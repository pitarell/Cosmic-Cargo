from __future__ import annotations

import base64
import hashlib
import shutil
import sys
import tempfile
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs7
from cryptography.x509.oid import NameOID


def wrap_manifest_line(line: bytes) -> bytes:
    parts = []
    while len(line) > 70:
        parts.append(line[:70])
        line = b" " + line[70:]
    parts.append(line)
    return b"\r\n".join(parts) + b"\r\n"


def digest(value: bytes) -> str:
    return base64.b64encode(hashlib.sha256(value).digest()).decode("ascii")


def section(name: str, payload: bytes) -> bytes:
    return wrap_manifest_line(f"Name: {name}".encode()) + wrap_manifest_line(
        f"SHA-256-Digest: {digest(payload)}".encode()
    ) + b"\r\n"


source_apk, assets_dir, output_apk = map(Path, sys.argv[1:4])
with tempfile.TemporaryDirectory() as temporary:
    work = Path(temporary)
    with zipfile.ZipFile(source_apk) as archive:
        archive.extractall(work)
    meta = work / "META-INF"
    if meta.exists():
        shutil.rmtree(meta)
    embedded = work / "assets" / "game"
    if embedded.exists():
        shutil.rmtree(embedded)
    shutil.copytree(assets_dir, embedded)

    entries = []
    for path in sorted(work.rglob("*")):
        if path.is_file() and "META-INF" not in path.parts:
            entries.append((path.relative_to(work).as_posix(), path.read_bytes()))

    main = b"Manifest-Version: 1.0\r\nCreated-By: Cosmic Cargo Build\r\n\r\n"
    sections = [section(name, payload) for name, payload in entries]
    manifest = main + b"".join(sections)
    signature = (
        b"Signature-Version: 1.0\r\n"
        b"Created-By: Cosmic Cargo Build\r\n"
        + wrap_manifest_line(f"SHA-256-Digest-Manifest: {digest(manifest)}".encode())
        + b"\r\n"
        + b"".join(
            wrap_manifest_line(f"Name: {name}".encode())
            + wrap_manifest_line(f"SHA-256-Digest: {digest(item)}".encode())
            + b"\r\n"
            for (name, _), item in zip(entries, sections)
        )
    )

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "Cosmic Cargo Development")])
    now = datetime.now(timezone.utc)
    certificate = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(days=1))
        .not_valid_after(now + timedelta(days=3650))
        .sign(key, hashes.SHA256())
    )
    signed = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(signature)
        .add_signer(certificate, key, hashes.SHA256())
        .sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.DetachedSignature, pkcs7.PKCS7Options.Binary])
    )

    output_apk.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_apk, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, payload in entries:
            archive.writestr(name, payload)
        archive.writestr("META-INF/MANIFEST.MF", manifest)
        archive.writestr("META-INF/CERT.SF", signature)
        archive.writestr("META-INF/CERT.RSA", signed)
