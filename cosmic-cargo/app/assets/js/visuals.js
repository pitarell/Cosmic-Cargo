"use strict";

const VISUAL_SLUGS={Lua:"lua",Sol:"sol","Vênus":"venus",Marte:"marte",Europa:"europa","Titã":"tita",Halley:"halley",Netuno:"netuno","Plutão":"plutao","Andrômeda":"andromeda","Triângulo":"triangulo",Escultor:"escultor"};
const SHIP_VISUAL_KEYS=new Map(Object.entries(SHIPS).map(([key,ship])=>[ship,key]));
const landingImages={};
const shipSprites={};

function imageAsset(path){const image=new Image();image.decoding="async";image.src=path;return image}
function landingImage(destination){const slug=VISUAL_SLUGS[destination]||"lua";return landingImages[slug]||(landingImages[slug]=imageAsset(`assets/images/landing/${slug}.webp`))}
function shipSprite(key){return shipSprites[key]||(shipSprites[key]=imageAsset(`assets/images/ships/sprites/${key}.webp`))}
function landingSpriteSize(key){return key==="diplomat"?136:key==="voyager"?128:key==="swift"?120:key==="hauler"?112:104}

shipArt=function(ship){
  const key=SHIP_VISUAL_KEYS.get(ship)||"courier";
  return `<div class="ship-art generated-ship-art" role="img" aria-label="${ship.name}"><img loading="lazy" decoding="async" src="assets/images/ships/dealership/${key==='courier'?'courier-mk1':key==='hauler'?'atlas-hauler':key==='swift'?'kestrel-s2':key==='voyager'?'aurora-voyager':'zenith-diplomat'}.webp" alt="${ship.name}"></div>`;
};

const renderContractsBeforeVisuals=renderContracts;
renderContracts=()=>{
  renderContractsBeforeVisuals();
  const destination=acceptedCargo()[0]?.destination||(filter!=="Todos"?filter:null),panel=$("#destinationLore");
  if(!destination||!panel||panel.classList.contains("hidden"))return;
  const slug=VISUAL_SLUGS[destination];
  if(!slug||panel.querySelector(".destination-visual"))return;
  panel.insertAdjacentHTML("afterbegin",`<img class="destination-visual" loading="lazy" decoding="async" src="assets/images/presentations/${slug}.webp" alt="${destination}">`);
};

draw=()=>{
  const w=canvas.width,h=canvas.height,d=flight?DESTINATIONS[flight.destination]:DESTINATIONS.Lua;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#020711";ctx.fillRect(0,0,w,h);
  if(flight){
    const background=landingImage(flight.destination);
    if(background.complete&&background.naturalWidth){ctx.globalAlpha=.42;ctx.drawImage(background,0,0,w,h);ctx.globalAlpha=1}
    else{const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,"#020711");grad.addColorStop(1,d.color+"88");ctx.fillStyle=grad;ctx.fillRect(0,0,w,h)}
    ctx.fillStyle="rgba(2,7,17,.2)";ctx.fillRect(0,0,w,h);
    $("#hudPhase").textContent=flight.y<300?(GAME_LANGUAGE==="en-US"?"APPROACH":"APROXIMAÇÃO"):(GAME_LANGUAGE==="en-US"?"LANDING":"POUSO");
    $("#hudAlt").textContent=Math.max(0,Math.round((518-flight.y)*3.2))+" m";
    $("#hudVel").textContent=Math.round(Math.hypot(flight.vx,flight.vy))+" m/s";
    $("#hudAngle").textContent=Math.round(flight.angle*180/Math.PI)+"°";
    $("#hudFuel").textContent=Math.round(flight.fuel)+" u";
  }else{
    ctx.fillStyle="#8fa9be";ctx.font="20px Segoe UI";ctx.textAlign="center";ctx.fillText(GAME_LANGUAGE==="en-US"?"Prepare cargo and start the mission.":"Prepare uma carga e inicie a missão.",w/2,h/2);
  }
};

drawWidePad=()=>{
  if(!flight)return;
  ctx.save();
  const key=typeof flightShipKey==='function'?flightShipKey():(state.activeShip||"courier"),sprite=shipSprite(key),size=landingSpriteSize(key),visualCenterOffset=16-size/2;
  ctx.translate(flight.x,flight.y+visualCenterOffset);ctx.rotate(flight.angle);
  if(sprite.complete&&sprite.naturalWidth){ctx.shadowColor="#55dcff";ctx.shadowBlur=18;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.drawImage(sprite,-size/2,-size/2,size,size);ctx.shadowBlur=0}
  else{ctx.fillStyle="#dffcff";ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(22,25);ctx.lineTo(-22,25);ctx.closePath();ctx.fill()}
  for(const [x,power] of [[-size*.18,flight.left],[size*.18,flight.right]])if(power>.05){ctx.fillStyle="#ffca66";ctx.beginPath();ctx.moveTo(x-4,size*.46);ctx.lineTo(x+4,size*.46);ctx.lineTo(x,size*.46+10+power*22);ctx.closePath();ctx.fill()}
  const topLeft=Math.max(activeControlValue("topLeft"),flight.topLeft||0,keys.topLeft?1:0),topRight=Math.max(activeControlValue("topRight"),flight.topRight||0,keys.topRight?1:0);
  const drawUpperFlame=(side,power)=>{if(power<=.015)return;const direction=side<0?-1:1,innerX=direction*size*.18,outerX=direction*size*.29,length=14+power*22;ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='#ff714f';ctx.shadowBlur=12;ctx.fillStyle='#ff654f';ctx.beginPath();ctx.moveTo(innerX,-size*.2);ctx.lineTo(outerX,-size*.22);ctx.lineTo(outerX+direction*length,-size*.34);ctx.closePath();ctx.fill();ctx.shadowColor='#ffe86b';ctx.shadowBlur=8;ctx.fillStyle='#ffe86b';ctx.beginPath();ctx.moveTo(innerX+direction*2,-size*.205);ctx.lineTo(outerX-direction*2,-size*.225);ctx.lineTo(outerX+direction*length*.62,-size*.3);ctx.closePath();ctx.fill();ctx.restore()};
  drawUpperFlame(-1,topLeft);drawUpperFlame(1,topRight);
  ctx.restore();
};

landingPositionDamage=distance=>{
  const key=typeof flightShipKey==='function'?flightShipKey():(state.activeShip||"courier"),size=landingSpriteSize(key),gearHalf=size*.1;
  return landingPadPosition(distance,flight?.destination,gearHalf);
};

renderContracts();
renderGarage();

