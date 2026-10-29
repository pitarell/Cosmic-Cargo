(function(){
  UPGRADES.power.desc='Aumenta o empuxo dos dois motores inferiores.';
  // Os motores inferiores sustentam a nave. Os superiores são propulsores laterais de atitude
  // e produzem somente torque, sem empuxo vertical ou frenagem da subida.
  update=dt=>{
    if(!flight||flight.status!=='flying')return;
    const upgrades=state.upgrades,ship=SHIPS[state.activeShip],cargo=cargoMetrics(),destination=DESTINATIONS[flight.destination],smooth=Math.max(.025,(.14-upgrades.precision*.018)/ship.tech),response=Math.min(1,dt/smooth);
    flight.left+=(activeControlValue('left')-flight.left)*response;
    flight.right+=(activeControlValue('right')-flight.right)*response;
    flight.topLeft=(flight.topLeft||0)+(activeControlValue('topLeft')-(flight.topLeft||0))*response;
    flight.topRight=(flight.topRight||0)+(activeControlValue('topRight')-(flight.topRight||0))*response;
    const motorLoad=Math.max(flight.left,flight.right,flight.topLeft,flight.topRight),burn=motorLoad*2*dt*(1-upgrades.efficiency*.125)/ship.tech;
    if(flight.fuel<=0){flight.left=0;flight.right=0;flight.topLeft=0;flight.topRight=0}else flight.fuel=Math.max(0,flight.fuel-burn);
    const lowerAverage=(flight.left+flight.right)/2,upperAverage=(flight.topLeft+flight.topRight)/2,thrustReference=ship.tier===5?SHIPS.voyager:ship,lowerThrust=(1.48+upgrades.power*.14)*thrustReference.stability*thrustReference.tech,signedThrust=lowerAverage*lowerThrust;
    flight.vx+=(Math.sin(flight.angle)*signedThrust+destination.wind*.07)*dt*88;
    flight.vy+=(destination.g-Math.cos(flight.angle)*signedThrust)*dt*88;
    const lowerTorque=(flight.right-flight.left)*.82,upperTorque=(flight.topLeft-flight.topRight)*.82,controlActivity=(lowerAverage+upperAverage)/2;
    flight.angular+=(lowerTorque+upperTorque)*dt+cargo.com*.0007*controlActivity*dt*60;
    flight.angular*=Math.pow(.983+upgrades.stability*.002,dt*60);
    flight.angle+=flight.angular*dt;
    flight.x+=flight.vx*dt;
    flight.y+=flight.vy*dt;
    if(flight.x<18||flight.x>942){flight.x=Math.max(18,Math.min(942,flight.x));flight.vx*=-.35}
    if(flight.y>=518)land();
  };
  function thrusterBalanceText(){const english=GAME_LANGUAGE==='en-US';return english?'Upper motors control attitude only: Q rotates the ship clockwise and O rotates it counterclockwise. They do not push the ship downward. A and K remain responsible for lift and descent control.':'Os motores superiores controlam apenas a inclinação: Q gira a nave no sentido horário e O no sentido anti-horário. Eles não empurram a nave para baixo. A e K continuam responsáveis pela sustentação e pelo controle da descida.'}
  const renderInputSettingsBeforeThrusterBalance=renderInputSettings;
  renderInputSettings=()=>{renderInputSettingsBeforeThrusterBalance();const panel=$('#inputSettings');if(!panel)return;panel.insertAdjacentHTML('beforeend',`<article class="control-card thruster-balance-help"><h2>${GAME_LANGUAGE==='en-US'?'Four-thruster controls':'Controle dos quatro motores'}</h2><p>${thrusterBalanceText()}</p><div class="thruster-balance-diagram"><span>Q ↻</span><span>O ↺</span><b>${GAME_LANGUAGE==='en-US'?'ATTITUDE CONTROL':'CONTROLE DE INCLINAÇÃO'}</b><span>A ↑</span><span>K ↑</span></div></article>`)};
  renderInputSettings();
})();
