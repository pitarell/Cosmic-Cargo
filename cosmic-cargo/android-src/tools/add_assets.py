from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import sys

apk = Path(sys.argv[1])
assets = Path(sys.argv[2])

with ZipFile(apk, "a", ZIP_DEFLATED) as archive:
    for source in assets.rglob("*"):
        if source.is_file():
            relative = source.relative_to(assets).as_posix()
            archive.write(source, f"assets/{relative}")
