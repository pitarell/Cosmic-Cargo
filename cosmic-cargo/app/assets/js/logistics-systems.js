(function(){
  'use strict';
  const english=()=>GAME_LANGUAGE==='en-US';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const hash=text=>[...String(text)].reduce((value,char)=>(Math.imul(value,33)+char.charCodeAt(0))>>>0,2166136261);
  const now=()=>Date.now()+(state.logisticsClockOffset||0);
  const money=value=>`${Math.round(value).toLocaleString(english()?'en-US':'pt-BR')} CR`;
  const TRAITS={
    standard:{pt:'Carga comum',en:'Standard cargo',detailPt:'Sem exigência logística adicional.',detailEn:'No additional logistics requirement.'},
    perishable:{pt:'Perecível',en:'Perishable',detailPt:'Prazo reduzido; perde o valor quando expira.',detailEn:'Short deadline; loses its value after expiry.'},
    liquid:{pt:'Líquida',en:'Liquid',detailPt:'Desloca o centro de massa durante a aproximação.',detailEn:'Shifts the center of mass during approach.'},
    live:{pt:'Organismo vivo',en:'Living organism',detailPt:'Exige estabilidade e não aceita material radioativo.',detailEn:'Requires stability and cannot travel with radioactive material.'},
    radioactive:{pt:'Radioativa',en:'Radioactive',detailPt:'Incompatível com organismos vivos.',detailEn:'Incompatible with living organisms.'},
    refrigerated:{pt:'Refrigerada',en:'Refrigerated',detailPt:'Consome combustível durante toda a viagem.',detailEn:'Consumes fuel throughout the trip.'}
  };
  const WEATHER=[
    {pt:'Janela estável',en:'Stable window',detailPt:'Boa visibilidade, vento previsível e consumo 5% menor.',detailEn:'Good visibility, predictable wind, and 5% lower consumption.',fuel:.95,reward:0,wind:.82,visibility:1},
    {pt:'Frente instável',en:'Unstable front',detailPt:'Rajadas e visibilidade reduzida; adicional de risco de 12%.',detailEn:'Gusts and reduced visibility; 12% risk premium.',fuel:1.05,reward:.12,wind:1.2,visibility:.78},
    {pt:'Tempestade severa',en:'Severe storm',detailPt:'Condição extrema; adicional de risco de 25%.',detailEn:'Extreme conditions; 25% risk premium.',fuel:1.12,reward:.25,wind:1.52,visibility:.55}
  ];
  const URGENCY=[
    {pt:'Regular',en:'Standard',hours:48,reward:0},
    {pt:'Prioritária',en:'Priority',hours:24,reward:.10},
    {pt:'Crítica',en:'Critical',hours:12,reward:.25}
  ];
  function ensure(){
    state.clientRelations=state.clientRelations&&typeof state.clientRelations==='object'?state.clientRelations:{};
    state.colonyDevelopment=state.colonyDevelopment&&typeof state.colonyDevelopment==='object'?state.colonyDevelopment:{};
    state.shipUnavailableUntil=state.shipUnavailableUntil&&typeof state.shipUnavailableUntil==='object'?state.shipUnavailableUntil:{};
    state.shipRepairInfo=state.shipRepairInfo&&typeof state.shipRepairInfo==='object'?state.shipRepairInfo:{};
    state.completedRepairNotices=Array.isArray(state.completedRepairNotices)?state.completedRepairNotices:[];
    if(state.logisticsBoardSeed!==state.boardSeed){state.logisticsBoardSeed=state.boardSeed;state.logisticsBoardCreatedAt=now();state.contractReplacements={}}
    state.logisticsBoardCreatedAt=Number(state.logisticsBoardCreatedAt)||now();
    state.contractReplacements=state.contractReplacements&&typeof state.contractReplacements==='object'?state.contractReplacements:{};
    Object.entries(state.shipUnavailableUntil).forEach(([key,until])=>{if(until<=Date.now()){if(!state.completedRepairNotices.some(item=>item.key===key&&Number(item.endedAt)===Number(until)))state.completedRepairNotices.push({key,endedAt:Number(until)});delete state.shipUnavailableUntil[key];delete state.shipRepairInfo[key]}});
  }
  function development(destination){return clamp(Number(state.colonyDevelopment?.[destination])||0,0,5)}
  function weather(destination,time=now()){
    if(state.tutorial?.active&&(state.landings||0)===0)return{...WEATHER[0],index:0,slot:0,nextAt:time+3*3600000};
    const slot=Math.floor(time/(3*3600000)),raw=hash(`${destination}-${slot}`)%3,reduction=Math.floor(development(destination)/2),index=Math.max(0,raw-reduction),base=WEATHER[index];
    return{...base,index,slot,nextAt:(slot+1)*3*3600000};
  }
  function traitFor(contract){
    if(contract.emergency)return'live';
    const name=contract.cargo.toLowerCase();
    if(/água|fluido|gás|hélio|metano|nitrogênio|deutério|ácido|refriger|criog|líquid/.test(name))return'liquid';
    if(/medic|vacina|ração|alimento|tecido|cápsula/.test(name))return'perishable';
    if(/semente|cultura|jardim|orquídea|animal|organismo|biológ|genétic/.test(name))return'live';
    if(/reator|isotóp|radio|antimatéria|fusão/.test(name))return'radioactive';
    if(/bateria|processador|refriger|criog/.test(name))return'refrigerated';
    return'standard'
  }
  function contractRules(contract){
    ensure();const trait=traitFor(contract),condition=weather(contract.destination),colony=state.colonyRelations?.[contract.destination]||0,client=state.clientRelations?.[contract.client]||0,relationBonus=clamp(colony+client,-50,200)*.001;
    if(contract.emergency)return{trait,urgency:URGENCY[0],hours:Infinity,deadline:Infinity,condition,exclusive:false,requiredRelation:0,expired:false,riskBonus:0,relationBonus};
    const urgency=URGENCY[hash(`${contract.id}-urgency`)%3],hours=trait==='perishable'?Math.min(18,urgency.hours):urgency.hours,deadline=(contract.availableAt||state.logisticsBoardCreatedAt)+hours*3600000,exclusive=hash(`${contract.id}-exclusive`)%7===0,requiredRelation=exclusive?20+10*(contract.level||1):0,expired=now()>deadline,riskBonus=condition.reward+urgency.reward;
    return{trait,urgency,hours,deadline,condition,exclusive,requiredRelation,expired,riskBonus,relationBonus};
  }
  function incompatibility(list){
    const traits=list.map(item=>item.logistics?.trait||traitFor(item));
    if(traits.includes('radioactive')&&traits.includes('live'))return english()?'Radioactive cargo cannot travel with living organisms.':'Carga radioativa não pode viajar com organismos vivos.';
    return'';
  }
  function remaining(deadline){if(!Number.isFinite(deadline))return english()?'NO DEADLINE':'SEM PRAZO';const ms=deadline-now();if(ms<=0)return english()?'EXPIRED':'EXPIRADO';const hours=Math.floor(ms/3600000),minutes=Math.floor(ms%3600000/60000);return`${hours}h ${String(minutes).padStart(2,'0')}min`}
  function repairRemaining(key){return Math.max(0,(state.shipUnavailableUntil?.[key]||0)-Date.now())}
  function timeLabel(ms){const minutes=Math.ceil(ms/60000);return minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}min`:`${minutes} min`}
  function shipUnavailable(key){ensure();return repairRemaining(key)>0}
  function preciseTimeLabel(ms){const seconds=Math.max(0,Math.ceil(ms/1000)),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),rest=seconds%60;return hours?`${hours}h ${String(minutes).padStart(2,'0')}min`:minutes?`${minutes}min ${String(rest).padStart(2,'0')}s`:`${rest}s`}
  function renderActiveShipAvailability(){
    const panel=$('#contractFuelStatus');if(!panel)return;panel.querySelector('.active-ship-availability')?.remove();
    const owned=state.ownedShips.includes(state.activeShip),remainingMs=owned?repairRemaining(state.activeShip):0,repairing=remainingMs>0,label=!owned?(english()?'NO SHIP':'SEM NAVE'):repairing?(english()?'UNDER REPAIR':'EM CONSERTO'):(english()?'SHIP AVAILABLE':'NAVE DISPONÍVEL'),detail=!owned?(english()?'Visit the dealership':'Acesse a Concessionária'):repairing?`${english()?'Available in':'Disponível em'} ${preciseTimeLabel(remainingMs)}`:(english()?'Ready for mission':'Pronta para missão');
    panel.insertAdjacentHTML('beforeend',`<span class="active-ship-availability ${!owned?'unavailable':repairing?'repairing':'available'}"><small>${label}</small><b>${detail}</b></span>`);
  }
  window.COSMIC_RULES={ensure,now,weather,contractRules,traitFor,incompatibility,development,shipUnavailable,repairRemaining};
  ensure();

  function replacementContract(original,previous){
    const generation=(previous?.replacementGeneration||0)+1,seed=hash(`${original.id}-${generation}-${Math.floor(now()/3600000)}`),planet=DESTINATIONS[original.destination],type=['standard','fragile','heavy'][(seed>>>3)%3],volume=type==='heavy'?2+(seed%2):1+((seed>>>5)%2),mass=Math.round((type==='heavy'?52:14)+((seed>>>7)%1000)/1000*(type==='heavy'?36:34)),level=1+((seed>>>11)%Math.max(1,unlockedContractLevel())),reward=Math.max(100,Math.round(original.reward*(.82+((seed>>>15)%47)/100)/10)*10);
    return{...original,id:`${original.id}-r${generation}-${seed.toString(36)}`,client:planet.clients[(seed>>>2)%planet.clients.length],cargo:planet.cargo[(seed>>>6)%planet.cargo.length],mass,volume,type,level,reward,availableAt:now(),replacementGeneration:generation,replaces:original.id};
  }

  const contractsBeforeLogistics=contracts;
  contracts=()=>contractsBeforeLogistics().map(original=>{
    let contract=state.contractReplacements[original.id]||original,rules=contractRules(contract);
    if(!contract.emergency&&rules.expired&&!state.accepted.includes(contract.id)){contract=replacementContract(original,contract);state.contractReplacements[original.id]=contract;rules=contractRules(contract)}
    const trait=rules.trait;
    if(contract.emergency)return{...contract,logistics:rules};
    const reward=rules.expired?0:Math.round(contract.reward*(1+rules.riskBonus+rules.relationBonus+(rules.exclusive?.18:0))/10)*10;
    return{...contract,reward,automaticReward:Math.round(contract.reward*(1+rules.riskBonus+rules.relationBonus+(rules.exclusive?.18:0))/10)*10,logistics:rules,trait};
  });

  const tripFuelBeforeLogistics=tripFuel;
  tripFuel=(list=acceptedCargo())=>{
    if(!list.length)return 0;const base=tripFuelBeforeLogistics(list),condition=weather(list[0].destination),refrigeration=list.filter(item=>(item.logistics?.trait||traitFor(item))==='refrigerated').reduce((total,item)=>total+18+item.volume*7,0),liquid=list.filter(item=>(item.logistics?.trait||traitFor(item))==='liquid').length*6;
    return Math.round(base*condition.fuel+refrigeration+liquid);
  };

  const cargoMetricsBeforeLogistics=cargoMetrics;
  cargoMetrics=()=>{
    const metrics=cargoMetricsBeforeLogistics();if(flight?.training||!metrics.mass)return metrics;
    const liquids=acceptedCargo().filter(item=>(item.logistics?.trait||traitFor(item))==='liquid'),liquidMass=liquids.reduce((sum,item)=>sum+item.mass,0),shift=liquidMass/metrics.mass*.18*(weather(liquids[0]?.destination||acceptedCargo()[0]?.destination).slot%2?1:-1);
    return{...metrics,com:metrics.com+shift,vcg:metrics.vcg+Math.abs(shift)*.3};
  };

  const contractBlockReasonBeforeLogistics=contractBlockReason;
  contractBlockReason=contract=>{
    if(!state.ownedShips.includes(state.activeShip))return english()?'No ship available':'Nenhuma nave disponível';
    if(shipUnavailable(state.activeShip))return english()?'Ship under repair':'Nave em conserto';
    const rules=contract.logistics||contractRules(contract),relation=state.colonyRelations?.[contract.destination]||0;
    if(rules.expired)return english()?'Deadline expired':'Prazo expirado';
    if(rules.exclusive&&relation<rules.requiredRelation)return english()?`Requires colony relation ${rules.requiredRelation}`:`Exige relação ${rules.requiredRelation} com a colônia`;
    const issue=incompatibility([...acceptedCargo(),contract]);if(issue)return issue;
    return contractBlockReasonBeforeLogistics(contract);
  };

  const renderContractsBeforeLogistics=renderContracts;
  renderContracts=()=>{
    ensure();renderContractsBeforeLogistics();const selected=acceptedCargo()[0]?.destination||(filter!=='Todos'?filter:null),reference=$('#contractFuelStatus');
    $('#launchWindowPanel')?.remove();
    if(reference){const destinations=selected&&DESTINATIONS[selected]?[selected]:Object.keys(DESTINATIONS),best=destinations.map(destination=>({destination,condition:weather(destination)})).sort((a,b)=>a.condition.index-b.condition.index)[0],condition=selected&&DESTINATIONS[selected]?weather(selected):best.condition,destination=selected&&DESTINATIONS[selected]?selected:best.destination,next=remaining(condition.nextAt);reference.insertAdjacentHTML('beforebegin',`<section id="launchWindowPanel" class="launch-window weather-${condition.index}"><div><span class="eyebrow">${english()?'LAUNCH WINDOW':'JANELA DE LANÇAMENTO'}</span><h3>${destination} · ${english()?condition.en:condition.pt}</h3><p>${english()?condition.detailEn:condition.detailPt}</p></div><div class="window-actions"><span>${english()?'Changes in':'Muda em'} <b>${next}</b></span></div></section>`)}
    $$('#contractList .card').forEach(card=>{const button=card.querySelector('[data-contract]'),contract=button?contracts().find(item=>item.id===button.dataset.contract):null;if(!contract)return;const rules=contract.logistics,tags=card.querySelector('.tags'),stats=card.querySelector('.stats');if(tags&&!tags.querySelector('.cargo-trait'))tags.insertAdjacentHTML('beforeend',`<span class="tag cargo-trait trait-${rules.trait}">${english()?TRAITS[rules.trait].en:TRAITS[rules.trait].pt}</span><span class="tag urgency-${rules.urgency===URGENCY[2]?'critical':'normal'}">${english()?rules.urgency.en:rules.urgency.pt}</span>${rules.exclusive?`<span class="tag exclusive">${english()?'EXCLUSIVE':'EXCLUSIVO'}</span>`:''}`);if(stats&&!stats.querySelector('.deadline-stat'))stats.insertAdjacentHTML('beforeend',`<span class="deadline-stat">${english()?'DEADLINE':'PRAZO'}<b class="${rules.expired?'fuel-bad':''}">${remaining(rules.deadline)}</b></span>`);card.title=english()?TRAITS[rules.trait].detailEn:TRAITS[rules.trait].detailPt});
    const lore=$('#destinationLore');if(selected&&lore&&!lore.classList.contains('hidden')){lore.querySelector('.destination-relations')?.remove();lore.querySelector('.colony-operation span:first-child')?.remove();const planet=DESTINATIONS[selected],relation=state.colonyRelations?.[selected]||0,level=development(selected),clients=planet.clients.map(client=>{const value=state.clientRelations?.[client]||0;return`<div><span>${client}</span><b class="${value<0?'fuel-bad':'fuel-ok'}">${value>=0?'+':''}${value}</b></div>`}).join('');const relationBlock=lore.querySelector('.colony-operation');(relationBlock||lore).insertAdjacentHTML(relationBlock?'afterend':'beforeend',`<section class="destination-relations"><header><div><small>${english()?'COLONY RELATIONSHIP':'RELAÇÃO COM A COLÔNIA'}</small><b>${relation>=0?'+':''}${relation}/100</b></div><span>${english()?'Development':'Desenvolvimento'} ${level}/5</span></header><p>${english()?'Excellent deliveries improve local trust. Humanitarian missions develop the colony, reduce environmental risk and improve landing infrastructure.':'Entregas excelentes aumentam a confiança local. Missões humanitárias desenvolvem a colônia, reduzem riscos ambientais e melhoram a infraestrutura de pouso.'}</p><h3>${english()?'Local clients':'Clientes locais'}</h3><div class="client-relations">${clients}</div></section>`)}
    renderActiveShipAvailability();
  };

  const renderCargoBeforeLogistics=renderCargo;
  renderCargo=()=>{
    renderCargoBeforeLogistics();const list=acceptedCargo(),issue=incompatibility(list),expired=list.some(item=>item.logistics?.expired),live=list.some(item=>item.logistics?.trait==='live'),metrics=cargoMetrics(),unstableLive=live&&(Math.abs(metrics.com)>.36||metrics.vcg>.48),button=$('#launchBtn');
    $('#cargoRulesPanel')?.remove();const summary=$('#cargoSummary');if(summary&&list.length){const traits=[...new Set(list.map(item=>item.logistics?.trait||traitFor(item)))];summary.insertAdjacentHTML('beforebegin',`<section id="cargoRulesPanel" class="cargo-rules ${issue||expired||unstableLive?'warning':''}"><h3>${english()?'Cargo requirements':'Requisitos especiais da carga'}</h3>${traits.map(key=>`<p><b>${english()?TRAITS[key].en:TRAITS[key].pt}:</b> ${english()?TRAITS[key].detailEn:TRAITS[key].detailPt}</p>`).join('')}${issue?`<strong>${issue}</strong>`:''}${expired?`<strong>${english()?'One or more contracts have expired.':'Um ou mais contratos estão com o prazo expirado.'}</strong>`:''}${unstableLive?`<strong>${english()?'Living cargo requires a lower and more centered load.':'A carga viva exige acondicionamento mais baixo e centralizado.'}</strong>`:''}</section>`)}
    if(button&&(issue||expired||unstableLive||shipUnavailable(state.activeShip))){button.disabled=true;button.textContent=shipUnavailable(state.activeShip)?(english()?'Ship under repair':'Nave em conserto'):issue||(expired?(english()?'Expired contract':'Contrato expirado'):(english()?'Stabilize living cargo':'Estabilize a carga viva'))}
    $$('#manifest .cargo-item').forEach(item=>{const name=item.querySelector('b')?.textContent,contract=list.find(entry=>entry.cargo===name);if(!contract||item.querySelector('.manifest-trait'))return;const rules=contract.logistics;item.querySelector('small')?.insertAdjacentHTML('afterend',`<span class="manifest-trait trait-${rules.trait}">${english()?TRAITS[rules.trait].en:TRAITS[rules.trait].pt} · ${english()?'deadline':'prazo'} ${remaining(rules.deadline)}</span>`)});
  };

  const startFlightBeforeLogistics=startFlight;
  startFlight=()=>{
    ensure();const list=acceptedCargo(),issue=incompatibility(list),expired=list.some(item=>item.logistics?.expired),live=list.some(item=>item.logistics?.trait==='live'),metrics=cargoMetrics();
    if(shipUnavailable(state.activeShip))return toast(english()?'This ship is still under repair.':'Esta nave ainda está em conserto.');
    if(issue)return toast(issue);if(expired)return toast(english()?'Cancel expired contracts before departure.':'Cancele os contratos vencidos antes da partida.');if(live&&(Math.abs(metrics.com)>.36||metrics.vcg>.48))return toast(english()?'Living cargo must be placed lower and closer to the center.':'A carga viva deve ficar mais baixa e próxima do centro.');
    const destination=list[0]?.destination,condition=destination?weather(destination):null;startFlightBeforeLogistics();if(flight&&condition){const developmentFactor=1-development(destination)*.04;flight.vx+=DESTINATIONS[destination].wind*(condition.wind-1)*28*developmentFactor;flight.environment={...condition,development:development(destination)}};
  };

  const drawBeforeWeather=draw;
  function updateExtrasolarPadTelemetry(){if(!flight||!isExtrasolarDestination(flight.destination))return;const panel=$('#flightAssistPanel'),position=landingPadPosition(Math.abs(flight.x-flight.pad),flight.destination,0),label=landingPositionLabel(position.level,english()),positionValue=panel?.querySelector('.flight-assist-grid span:last-child b'),message=panel?.querySelector('.flight-assist-message'),legend=panel?.querySelector('.flight-assist-legend'),gear=flightUpgrades().gear||0,speed=Math.hypot(flight.vx,flight.vy),angle=Math.abs(flight.angle*180/Math.PI),speedOk=speed<=38+gear*5,angleOk=angle<=6+gear*2;if(positionValue)positionValue.textContent=label;if(message&&speedOk&&angleOk)message.textContent=position.level==='center'?(english()?'Central zone aligned: minimum position damage.':'Zona central alinhada: dano mínimo de posição.'):(english()?`Current level: ${label}. Move closer to the center to reduce position damage.`:`Nível atual: ${label}. Aproxime-se do centro para reduzir o dano de posição.`);if(panel)panel.className=`flight-assist-panel ${speedOk&&angleOk&&position.level==='center'?'safe':position.level==='outside'?'danger':'warning'}`;if(legend)legend.innerHTML=`<span class="ok"><i></i>${english()?'Center · 0%':'Centro · 0%'}</span><span><i></i>${english()?'Inner · 4%':'Interna · 4%'}</span><span class="caution"><i></i>${english()?'Middle · 9%':'Intermediária · 9%'}</span><span class="caution"><i></i>${english()?'Outer · 16%':'Externa · 16%'}</span><span class="critical"><i></i>${english()?'Edge · 25%':'Borda · 25%'}</span>`}
  draw=()=>{drawBeforeWeather();updateExtrasolarPadTelemetry();if(!flight?.environment||flight.environment.visibility>=1)return;const opacity=(1-flight.environment.visibility)*.34,gradient=ctx.createLinearGradient(0,80,0,540);gradient.addColorStop(0,`rgba(176,190,205,${opacity*.35})`);gradient.addColorStop(1,`rgba(205,190,166,${opacity})`);ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,540)};

  const landingPositionDamageBeforeDevelopment=landingPositionDamage;
  landingPositionDamage=distance=>{const bonus=flight?.training?0:Math.min(.2,development(flight?.destination)*.04),position=landingPositionDamageBeforeDevelopment(distance);return{...position,damage:position.level==='outside'?position.damage:Math.max(0,Math.round(position.damage*(1-bonus)))}};

  const finishMissionBeforeLogistics=finishMission;
  finishMission=success=>{
    const delivered=flight?.training?[]:acceptedCargo().map(item=>({...item,logistics:{...item.logistics}})),destination=flight?.destination,damage=flight?.landingMetrics?.damage??100,destroyed=!flight?.training&&(damage>=100||flight?.integrity<=0),destroyedKey=state.activeShip;const result=finishMissionBeforeLogistics(success);
    if(delivered.length&&destination){delivered.forEach(item=>{const delta=item.emergency?(damage<=25?4:1):damage<=5?3:damage<=20?2:damage<=40?0:-2;state.clientRelations[item.client]=clamp((state.clientRelations[item.client]||0)+delta,-100,100)});if(delivered.some(item=>item.emergency)&&damage<60)state.colonyDevelopment[destination]=clamp(development(destination)+1,0,5);save()}
    if(destroyed)recycleDestroyedShip(destroyedKey);
    return result;
  };

  if(typeof chooseAFKContract==='function')chooseAFKContract=(employee,key)=>{const ship=SHIPS[key],list=contracts().filter(item=>!item.emergency&&(!item.logistics?.exclusive||(state.colonyRelations?.[item.destination]||0)>=item.logistics.requiredRelation)&&item.destination===employee.routeDestination&&item.level<=employee.level&&item.volume<=ship.slots&&item.mass<=ship.mass&&shipCanReachDestination(key,item.destination));if(!list.length)return null;const seed=Math.abs((Date.now()/60000|0)+employee.id.split('').reduce((total,char)=>total+char.charCodeAt(0),0)),selected=list[seed%list.length];return{...selected,reward:selected.automaticReward||selected.reward}};
  if(typeof completeAFKJourney==='function'){const completeAFKJourneyBeforeRelations=completeAFKJourney;completeAFKJourney=(journey,time)=>{const contract=contracts().find(item=>item.id===journey.contractId),result=completeAFKJourneyBeforeRelations(journey,time),log=state.afk?.log?.find(item=>item.id===journey.id);if(log){const expectedFuelCost=Math.round(Number(journey.fuel||0)*fuelPrice(journey.shipKey)),fuelDifference=expectedFuelCost-Number(log.fuelCost||0);if(fuelDifference){log.fuelCost=expectedFuelCost;log.net-=fuelDifference;state.credits-=fuelDifference;state.afk.totalNet-=fuelDifference;const ledger=state.financeLedger?.find(entry=>entry.sourceId===journey.id);if(ledger){ledger.expenses+=fuelDifference;ledger.net-=fuelDifference}}}if(contract&&log){const delta=log.cargoDamage<=5?2:log.cargoDamage<=20?1:log.cargoDamage>40?-2:0;state.clientRelations[contract.client]=clamp((state.clientRelations[contract.client]||0)+delta,-100,100);state.colonyRelations[contract.destination]=clamp((state.colonyRelations[contract.destination]||0)+delta,-100,100);save()}return result}};

  function beginRepairDowntime(key,damage){const secondsPerDamage={1:5,2:10,3:15}[SHIPS[key]?.tier]||20,duration=Math.round(Math.max(0,damage)*secondsPerDamage*1000);state.shipUnavailableUntil[key]=Date.now()+duration;state.shipRepairInfo[key]={startedAt:Date.now(),damage,duration};return duration}
  function showDestroyedReport(report){const panel=$('#resultPanel');if(!panel||!report)return;panel.querySelector('#repairAfterLanding')?.remove();panel.querySelector('.destroyed-ship-report')?.remove();const actions=panel.querySelector('.result-actions'),taxPending=typeof pendingTaxUI!=='undefined'&&!!pendingTaxUI;actions?.insertAdjacentHTML('beforebegin',`<section class="destroyed-ship-report"><h3>${english()?'SHIP DESTROYED':'NAVE DESTRUÍDA'}</h3><p>${english()?`${report.name} suffered total damage and was sold for recycling.`:`A ${report.name} sofreu perda total e foi vendida para reciclagem.`}</p><p>${english()?'Recycling value':'Valor da reciclagem'}: <b>+${money(report.salvage)}</b>. ${report.replacement?(english()?`${report.replacement} is now the active ship.`:`A ${report.replacement} agora é a nave ativa.`):(english()?'Purchase another ship at the dealership to continue.':'Compre outra nave na Concessionária para continuar.')}</p>${taxPending?`<p class="fuel-bad">${english()?'Complete the tax decision below before leaving the mission report.':'Conclua a decisão fiscal abaixo antes de sair do relatório da missão.'}</p>`:''}</section>`);panel.querySelector('#refuelAfterLanding')?.toggleAttribute('disabled',!report.replacement||taxPending);if(actions&&!actions.querySelector('#goDealershipAfterLoss'))actions.insertAdjacentHTML('afterbegin',`<button id="goDealershipAfterLoss" class="danger" ${taxPending?'disabled':''}>${taxPending?(english()?'Resolve tax decision first':'Resolva primeiro a decisão fiscal'):(english()?'Go to dealership':'Ir à Concessionária')}</button>`);const dealershipButton=panel.querySelector('#goDealershipAfterLoss');if(dealershipButton&&!taxPending)dealershipButton.onclick=()=>{flight=null;state.boardSeed++;save();renderGarage();renderContracts();renderCargo();nav('dealership')}}
  function recycleDestroyedShip(key){
    const ship=SHIPS[key];if(!ship||!state.ownedShips.includes(key))return;const salvage=Math.max(100,Math.round(ship.price*.08/100)*100),englishMode=english();
    state.credits+=salvage;state.ownedShips=state.ownedShips.filter(item=>item!==key);state.tradedShips=[...new Set([...(state.tradedShips||[]),key])];delete state.shipData[key];delete state.shipUnavailableUntil[key];delete state.shipRepairInfo[key];
    state.afk?.employees?.forEach(employee=>{if(employee.shipKey===key)employee.shipKey=''});if(state.afk?.shipOrders)delete state.afk.shipOrders[key];
    const replacement=[...state.ownedShips].sort((a,b)=>SHIPS[b].tier-SHIPS[a].tier)[0];if(replacement){const data=normalizeShipRecord(state.shipData[replacement],replacement);state.activeShip=replacement;state.condition=data.condition;state.fuel=data.fuel;state.upgrades={...data.upgrades};state.slots=Array(SHIPS[replacement].slots).fill(null)}else{state.condition=0;state.fuel=0;state.slots=Array(SHIPS[key].slots).fill(null)}state.cargoRotations={};state.stagedCargo=[];
    flight.destroyedReport={key,name:ship.name,salvage,replacement:replacement?SHIPS[replacement].name:null};save();if(typeof addFinance==='function')addFinance({kind:'ship_recycling',title:englishMode?`Recycling · ${ship.name}`:`Reciclagem · ${ship.name}`,detail:englishMode?'Total loss after 100% damage.':'Perda total após dano de 100%.',gross:salvage,expenses:0,net:salvage});showDestroyedReport(flight.destroyedReport);
  }
  const repairShipBeforeDowntime=repairShip;
  repairShip=()=>{
    ensure();const key=state.activeShip,damage=Math.max(0,100-state.condition),before=state.condition;repairShipBeforeDowntime();if(state.condition<=before||damage<=0)return;
    const duration=beginRepairDowntime(key,damage);save();renderGarage();renderContracts();renderCargo();toast(english()?`${SHIPS[key].name} will remain in repair for ${timeLabel(duration)}.`:`A ${SHIPS[key].name} ficará em conserto por ${timeLabel(duration)}.`);
  };

  const pResultBeforeRepairDowntime=pResult;
  pResult=(...args)=>{
    pResultBeforeRepairDowntime(...args);const [success,rows,total,repair,,missionDamage=0]=args,panel=$('#resultPanel'),report=flight?.destroyedReport;
    if(report){showDestroyedReport(report);return}
    const button=panel?.querySelector('#repairAfterLanding');if(!button||button.disabled)return;button.onclick=()=>{const key=state.activeShip,damage=Math.max(0,100-state.condition);state.credits-=repair;registerLandingRepair(repair);state.condition=100;const duration=beginRepairDowntime(key,damage);save();toast(english()?`Repair started. Ship unavailable for ${timeLabel(duration)}.`:`Conserto iniciado. Nave indisponível por ${timeLabel(duration)}.`);pResult(success,rows,total,0,false,missionDamage)};
  };

  const activateShipBeforeDowntime=activateShip;
  activateShip=key=>shipUnavailable(key)?toast(english()?'This ship is unavailable while under repair.':'Esta nave está indisponível enquanto estiver em conserto.'):activateShipBeforeDowntime(key);
  const renderGarageBeforeDowntime=renderGarage;
  renderGarage=()=>{
    ensure();renderGarageBeforeDowntime();$$('#fleetGrid .fleet-card').forEach(card=>{const key=Object.keys(SHIPS).find(item=>SHIPS[item].name===card.querySelector('h2')?.textContent);if(!key||!shipUnavailable(key))return;const remainingMs=repairRemaining(key),button=card.querySelector('[data-activate-ship]'),eyebrow=card.querySelector('.eyebrow'),details=card.querySelector('.fleet-details');card.classList.add('repairing');if(eyebrow)eyebrow.textContent=english()?'UNDER REPAIR':'EM CONSERTO';if(button){button.disabled=true;button.className='secondary';button.textContent=english()?'Ship unavailable':'Nave indisponível'}details?.querySelector('.repair-status')?.remove();details?.insertAdjacentHTML('afterbegin',`<p class="repair-status"><b>${english()?'Repair in progress':'Conserto em andamento'}</b><span>${english()?'Available in':'Disponível em'} ${timeLabel(remainingMs)}</span></p>`)});
    const fleet=$('#fleetGrid');if(fleet)[...fleet.querySelectorAll('.fleet-card')].sort((a,b)=>{const keyA=Object.keys(SHIPS).find(key=>SHIPS[key].name===a.querySelector('h2')?.textContent),keyB=Object.keys(SHIPS).find(key=>SHIPS[key].name===b.querySelector('h2')?.textContent);return (SHIPS[keyA]?.tier||99)-(SHIPS[keyB]?.tier||99)}).forEach(card=>fleet.appendChild(card));
    $$('#fleetGrid .fleet-card').forEach(card=>{const key=Object.keys(SHIPS).find(item=>SHIPS[item].name===card.querySelector('h2')?.textContent);if(!key)return;card.querySelectorAll('.upgrade-levels span').forEach((row,index)=>{const upgradeKey=Object.keys(UPGRADES)[index],value=state.shipData[key]?.upgrades?.[upgradeKey]||0;const label=row.querySelector('em');if(label)label.textContent=`${value}/${upgradeMax(upgradeKey,key)}`})});
    if(SHIPS[state.activeShip]?.tier===5){const levels={...state.upgrades};(pendingUpgrades?.items||[]).forEach(item=>levels[item.key]=(levels[item.key]||0)+1);$$('#upgradeShop [data-upgrade]').forEach(button=>{const key=button.dataset.upgrade,level=levels[key]||0,item=button.closest('.shop-item'),title=item?.querySelector('b');if(title)title.textContent=`${UPGRADES[key].name} · ${english()?'Level':'Nível'} ${level}/${upgradeMax(key)}`;if(level>=upgradeMax(key))return;const base=upgradeCostAt(key,level),tax=Math.round(base*ECONOMY.upgradeTax),total=base+tax,cartTotal=typeof pendingUpgradeTotals==='function'?pendingUpgradeTotals().total:0,unaffordable=cartTotal+total>state.credits,locale=english()?'en-US':'pt-BR';button.disabled=false;button.className=unaffordable?'danger unaffordable':'primary';button.innerHTML=`${english()?'Add':'Adicionar'} · ${total.toLocaleString(locale)} CR<small>${english()?'Price':'Preço'} ${base.toLocaleString(locale)} + ${english()?'tax':'imposto'} ${economyPercent(ECONOMY.upgradeTax)} ${tax.toLocaleString(locale)} CR</small>`});}
    if(shipUnavailable(state.activeShip)){const panel=$('#repairPanel');panel?.insertAdjacentHTML('afterbegin',`<p class="repair-status"><b>${english()?'Ship unavailable':'Nave indisponível'}</b><span>${english()?'Repair ends in':'Fim do conserto em'} ${timeLabel(repairRemaining(state.activeShip))}</span></p>`)}
    const fuelParagraph=$('#fuelShop>p'),fillButton=$('#fillFuel'),missingFuel=Math.max(0,shipFuel()-state.fuel),unitPrice=fuelPrice(state.activeShip),fillCost=Math.round(Math.floor(missingFuel)*unitPrice);if(fuelParagraph)fuelParagraph.innerHTML=`${fuelClass(state.activeShip)} · ${english()?'Price':'Preço'}: <b>${unitPrice.toLocaleString(english()?'en-US':'pt-BR')} CR ${english()?'per unit':'por unidade'}</b>. ${english()?'Fuel belongs to this ship and carries over to the next mission.':'O combustível pertence a esta nave e permanece para a próxima missão.'}`;if(fillButton&&missingFuel>0)fillButton.textContent=`${english()?'Fill tank':'Completar tanque'} · ${fillCost.toLocaleString(english()?'en-US':'pt-BR')} CR`;
    if(!state.ownedShips.length){$('#fleetGrid').innerHTML=`<p class="empty-state">${english()?'No ships in the Hangar. The destroyed ship can be purchased again at the dealership.':'Nenhuma nave no Hangar. A nave destruída pode ser comprada novamente na Concessionária.'}</p>`;$('#workshopShipCard').innerHTML=`<div><span class="eyebrow">${english()?'NO ACTIVE SHIP':'SEM NAVE ATIVA'}</span><h2>${english()?'Fleet unavailable':'Frota indisponível'}</h2></div>`;$('#refuelShipCard').innerHTML=$('#workshopShipCard').innerHTML;$('#repairPanel').innerHTML=`<p>${english()?'There is no ship available for repair.':'Não há nave disponível para conserto.'}</p>`}
  };

  const dispatchAFKBeforeRepairQueue=dispatchAFK;
  dispatchAFK=(employee,time=Date.now())=>{
    ensure();const repairEnds=Number(state.shipUnavailableUntil?.[employee?.shipKey]||0);
    if(repairEnds>time)return false;
    return dispatchAFKBeforeRepairQueue(employee,time);
  };

  const renderCargoBeforeTierLayout=renderCargo;
  renderCargo=()=>{renderCargoBeforeTierLayout();$('#cargoHold')?.classList.toggle('tier-one-vertical',SHIPS[state.activeShip]?.tier===1)};

  const renderFinanceBeforeRelations=renderFinance;
  renderFinance=()=>{
    renderFinanceBeforeRelations();ensure();$('#relationsPanel')?.remove();
  };

  const renderAFKBeforeStaffCosts=renderAFK;
  renderAFK=()=>{
    renderAFKBeforeStaffCosts();
    const anchor=$('#automaticSummary');
    if(!anchor)return;
    $('#staffCostSummary')?.remove();
    const automaticEvents=(state.afk?.log||[]).map(trip=>({...trip,eventType:'automatic',time:trip.endedAt||0}));
    const manualLedger=(state.financeLedger||[]).filter(entry=>entry.kind==='manual'),lastKnownManualFee=Number(state.afk?.lastManualDeductions?.managerFee||0);
    const manualEvents=manualLedger.map((entry,index)=>({...entry,managerFee:Number(entry.managerFee||(!index?lastKnownManualFee:0)),eventType:'manual',time:entry.time||0})).filter(entry=>entry.managerFee>0);
    const trips=[...automaticEvents,...manualEvents].sort((a,b)=>b.time-a.time).slice(0,10);
    const commissions=trips.reduce((total,trip)=>total+(trip.eventType==='automatic'?Number(trip.commission||0):0),0);
    const benefits=trips.reduce((total,trip)=>total+(trip.eventType==='automatic'?Number(trip.benefits||0):0),0);
    const automaticManagement=trips.reduce((total,trip)=>total+(trip.eventType==='automatic'?Number(trip.managerFee||0):0),0);
    const manualManagement=trips.reduce((total,trip)=>total+(trip.eventType==='manual'?Number(trip.managerFee||0):0),0);
    const management=automaticManagement+manualManagement;
    const staffCost=commissions+benefits+management;
    const net=trips.reduce((total,trip)=>total+(trip.eventType==='automatic'?Number(trip.net||0):0),0);
    const average=trips.length?Math.round(staffCost/trips.length):0;
    const scope=trips.length
      ?(english()?`Last ${trips.length} operations with personnel costs`:`Últimas ${trips.length} operações com gastos de pessoal`)
      :(english()?'No personnel costs recorded yet':'Nenhum gasto com pessoal registrado');
    const employeeTrips={};(state.afk?.log||[]).forEach(trip=>(employeeTrips[trip.employee]??=[]).push(trip));
    const alerts=Object.entries(employeeTrips).map(([name,history])=>{const recent=history.slice(0,5);if(recent.length<5)return null;const losses=recent.filter(trip=>Number(trip.net||0)<0).length;if(losses<3)return null;const cargoDamage=recent.reduce((total,trip)=>total+Number(trip.cargoDamage||0),0)/5,repair=recent.reduce((total,trip)=>total+Number(trip.repair||0),0),fuel=recent.reduce((total,trip)=>total+Number(trip.fuelCost||0),0);let suggestion;if(cargoDamage>18)suggestion=english()?'Train cargo protection or choose a safer route.':'Treine proteção de carga ou escolha uma rota mais segura.';else if(repair>fuel)suggestion=english()?'Train defensive piloting or assign a safer route.':'Treine pilotagem defensiva ou designe uma rota mais segura.';else suggestion=english()?'Train fuel management or assign a more efficient ship.':'Treine gestão de combustível ou designe uma nave mais eficiente.';return`<div><span>⚠</span><p><b>${name} · ${losses}/5 ${english()?'trips at a loss':'viagens com prejuízo'}</b><small>${suggestion}</small></p></div>`}).filter(Boolean);
    const alertsHtml=alerts.length?`<aside class="staff-profit-alerts"><small>${english()?'ATTENTION REQUIRED':'ATENÇÃO NECESSÁRIA'}</small>${alerts.join('')}</aside>`:'';
    anchor.insertAdjacentHTML('afterend',`<section id="staffCostSummary" class="staff-cost-summary"><header><span class="eyebrow">${english()?'EMPLOYEE EXPENSES':'GASTOS COM FUNCIONÁRIOS'}</span><h3>${english()?'Simple team statement':'Demonstrativo simples da equipe'}</h3><small>${scope}</small></header><div class="staff-cost-kpi"><small>${english()?'Personnel cost':'Custo com pessoal'}</small><b>${money(staffCost)}</b></div><div class="staff-cost-kpi"><small>${english()?'Average per operation':'Média por operação'}</small><b>${money(average)}</b></div><div class="staff-cost-kpi ${net<0?'negative':'positive'}"><small>${english()?'Employee flights net result':'Resultado líquido dos funcionários'}</small><b>${net>=0?'+':''}${money(net)}</b></div><div class="staff-cost-breakdown"><div><small>${english()?'PILOT COSTS':'CUSTOS DOS PILOTOS'}</small><b>${money(commissions+benefits)}</b><span>${english()?'Commissions':'Comissões'} ${money(commissions)} · ${english()?'benefits':'benefícios'} ${money(benefits)}</span></div><div><small>${english()?'MANAGEMENT COSTS':'CUSTOS DE GERÊNCIA'}</small><b>${money(management)}</b><span>${english()?'Automatic trips':'Viagens automáticas'} ${money(automaticManagement)} · ${english()?'your flights':'seus voos'} ${money(manualManagement)}</span><em>${english()?'Your flights are not included in the automatic-delivery net result.':'Seus voos não entram no resultado líquido das viagens automáticas.'}</em></div></div>${alertsHtml}</section>`);
  };

  let lastActiveRepairing=shipUnavailable(state.activeShip);
  setInterval(()=>{if(document.visibilityState!=='visible')return;const repairing=shipUnavailable(state.activeShip);renderActiveShipAvailability();if(lastActiveRepairing&&!repairing){renderContracts();renderCargo();renderGarage();toast(english()?'Repair completed. Ship available.':'Conserto concluído. Nave disponível.')}lastActiveRepairing=repairing},1000);
  setInterval(()=>{ensure();if(document.visibilityState==='visible'){const active=document.querySelector('.view.active')?.id;if(['contracts','cargo'].includes(active))active==='contracts'?renderContracts():renderCargo();if(['hangar','workshop','refueling'].includes(active))renderGarage()}},30000);
  save();renderContracts();renderCargo();renderGarage();renderAFK();
})();
