"use strict";

const STAFF_LIMIT_V2=6;
const STAFF_TIER_DELAYS={2:3*86400000,3:5*86400000};
const STAFF_POOL={
  1:[
    {name:"Lia Moura",trait:"economy",history:"Ex-técnica de mineração lunar, especializada em economizar combustível em cargueiros antigos."},
    {name:"Bento Arantes",trait:"cargo",history:"Ex-carregador orbital cuja experiência de convés reduz avarias em encomendas delicadas."},
    {name:"Maya Torres",trait:"piloting",history:"Piloto de resgate lunar com disciplina para aproximações de baixa gravidade."},
    {name:"Ícaro Nunes",trait:"speed",history:"Navegador de correio orbital acostumado a cumprir janelas curtas de entrega."},
    {name:"Amina Sol",trait:"cargo",history:"Supervisora de docas que conhece os pontos frágeis de cada tipo de embalagem."},
    {name:"Téo Nadir",trait:"economy",history:"Mecânico de bordo que extrai autonomia de sistemas de propulsão básicos."}
  ],
  2:[
    {name:"Yara Okafor",trait:"piloting",history:"Veterana das tempestades marcianas, mantém a nave estável em rotas de risco médio."},
    {name:"Caio Venn",trait:"speed",history:"Navegador venusiano, especialista em janelas atmosféricas e escalas eficientes."},
    {name:"Davi Kessler",trait:"economy",history:"Planejador de rotas jovianas com excelente controle de consumo e reservas."},
    {name:"Iris Volkov",trait:"cargo",history:"Especialista em materiais criogênicos e proteção de cargas científicas."},
    {name:"Samira Quill",trait:"piloting",history:"Piloto de plataformas atmosféricas, treinada para corrigir aproximações sob ventos cruzados."},
    {name:"León Matsuda",trait:"economy",history:"Analista de propulsão marciana que planeja reservas com grande precisão."},
    {name:"Nádia Bell",trait:"cargo",history:"Supervisora de transporte científico com histórico de baixíssima perda de carga."},
    {name:"Orion Freitas",trait:"speed",history:"Ex-mensageiro entre luas, conhecido por conexões rápidas e pontuais."}
  ],
  3:[
    {name:"Nyx Tanaka",trait:"economy",history:"Comandante das rotas de Titã, combina autonomia, precisão e disciplina operacional."},
    {name:"Ravi Anders",trait:"piloting",history:"Piloto de fronteira treinado para pousos difíceis e preservação da frota."},
    {name:"Selene Costa",trait:"cargo",history:"Chefe de logística exterior, reconhecida pela baixa taxa de avarias."},
    {name:"Noa Sato",trait:"speed",history:"Navegador de longa distância que reduz tempos sem comprometer os descansos legais."},
    {name:"Zahra Petrov",trait:"piloting",history:"Comandante de resgate no cinturão exterior, habituada a condições extremas."},
    {name:"Gael Adebayo",trait:"cargo",history:"Especialista em logística de fronteira e contenção de materiais instáveis."},
    {name:"Mei Navarro",trait:"economy",history:"Engenheira de voo profundo focada em autonomia e manutenção preventiva."},
    {name:"Dante Hoshino",trait:"speed",history:"Capitão de comboios rápidos que coordena trajetórias sem sacrificar segurança."}
  ]
};

const STAFF_GIVEN_NAMES=["Alana","Bruno","Cecília","Diego","Elisa","Félix","Giovana","Hugo","Inara","Jonas","Kiara","Luan","Maíra","Nicolas","Olívia","Pablo","Raquel","Saulo","Valentina","William","Akira","Bianca","Ciro","Dalila","Enzo","Farah","Gustavo","Hana","Júlio","Larissa","Malik","Nina","Otávio","Paola","Renan","Sofia"];
const STAFF_SURNAMES=["Almeida","Borges","Chen","Dominguez","Espinosa","Farias","Gomes","Haddad","Ivanov","Jensen","Kaur","Lima","Moreau","Nakamura","Oliveira","Pereira","Qadir","Rossi","Silva","Tavares","Ueda","Vasquez","Walker","Xavier","Yamamoto","Zoric"];
function staffSurname(name){return String(name||'').trim().split(/\s+/).pop()||''}
function uniqueStaffName(serial,usedNames,usedSurnames){
  for(let offset=0;offset<STAFF_GIVEN_NAMES.length*STAFF_SURNAMES.length;offset++){
    const index=serial+offset,given=STAFF_GIVEN_NAMES[(index*5)%STAFF_GIVEN_NAMES.length],surname=STAFF_SURNAMES[(index*7+3)%STAFF_SURNAMES.length],name=`${given} ${surname}`;
    if(!usedNames.has(name)&&!usedSurnames.has(surname))return name;
  }
  return`Piloto ${serial+1}`;
}

const baseStaffHireCost=staffHireCost;
staffHireCost=e=>baseStaffHireCost(e)*2;

function ensureStaffMarket(now=Date.now()){
  ensureAdvancedAFK();
  const a=state.afk;
  a.staffMarket=a.staffMarket||{unlockedTier:1,tier2At:0,tier3At:0,serial:0};
  const market=a.staffMarket;
  if(!market.tier2At&&a.employees.length>=STAFF_LIMIT_V2)market.tier2At=now+STAFF_TIER_DELAYS[2];
  if(market.unlockedTier<2&&market.tier2At&&now>=market.tier2At)market.unlockedTier=2;
  if(market.unlockedTier>=2&&!market.tier3At&&a.employees.length>=STAFF_LIMIT_V2&&a.employees.every(e=>e.level>=2))market.tier3At=now+STAFF_TIER_DELAYS[3];
  if(market.unlockedTier<3&&market.tier3At&&now>=market.tier3At)market.unlockedTier=3;
  a.candidates=(a.candidates||[]).filter(c=>(c.level||1)<=market.unlockedTier);
  const usedNames=new Set(a.employees.map(employee=>employee.name)),usedSurnames=new Set(a.employees.map(employee=>staffSurname(employee.name)));
  a.candidates.forEach(candidate=>{const surname=staffSurname(candidate.name);if(usedNames.has(candidate.name)||usedSurnames.has(surname))candidate.name=uniqueStaffName(market.serial++,usedNames,usedSurnames);usedNames.add(candidate.name);usedSurnames.add(staffSurname(candidate.name))});
  const desired=6;
  while(a.candidates.length<desired){
    const level=1+((market.serial+a.candidates.length)%market.unlockedTier),pool=STAFF_POOL[level],template=pool[(market.serial+a.candidates.length)%pool.length],serial=market.serial++;
    const templateSurname=staffSurname(template.name),name=usedNames.has(template.name)||usedSurnames.has(templateSurname)?uniqueStaffName(serial,usedNames,usedSurnames):template.name;usedNames.add(name);usedSurnames.add(staffSurname(name));
    a.candidates.push(staffCandidate({id:`market-${level}-${serial}`,name,level,trait:template.trait,hireMod:.94+(serial%4)*.04,commissionMod:[.01,-.01,.015,-.015][serial%4],history:template.history}));
  }
}

hireEmployee=id=>{
  ensureStaffMarket();
  if(!afkUnlocked())return toast("Compre primeiro uma nave de categoria 4.");
  if(state.afk.employees.length>=STAFF_LIMIT_V2)return toast("O quadro já possui seis funcionários. Demita um piloto para realizar uma substituição.");
  const index=state.afk.candidates.findIndex(c=>c.id===id),candidate=state.afk.candidates[index];
  if(!candidate)return;
  const cost=staffHireCost(candidate);
  if(state.credits<cost)return toast("Créditos insuficientes para esta contratação.");
  state.credits-=cost;state.afk.candidates.splice(index,1);
  state.afk.employees.push({...candidate,mood:100,shift:"day",shipKey:"",status:"idle",hiredAt:Date.now(),workHours:0,workDay:"",workedDates:[],restUntil:0,leaveStart:0,awayUntil:0});
  ensureStaffMarket();save();renderAFK();toast(`${candidate.name} foi contratado(a).`);
};

function nextShiftOpening(employee,after){
  const date=new Date(after+60000);
  for(let day=0;day<9;day++){
    const candidate=new Date(date);candidate.setDate(date.getDate()+day);candidate.setHours(employee.shift==="night"?22:8,0,0,0);
    if(candidate.getDay()>=1&&candidate.getDay()<=5&&candidate.getTime()>after)return candidate.getTime();
  }
  return after+86400000;
}

function simulateAutomaticPeriod(from,to){
  if(!state.afk.enabled||!afkUnlocked()||GAME_EDITION==="android"||to<=from)return{trips:0,net:0};
  let cursor=from,trips=0,net=0,guard=0;
  while(cursor<=to&&guard++<200000){
    const finished=state.afk.journeys.filter(j=>j.endAt<=cursor);
    for(const journey of finished){const before=state.afk.totalNet;completeAFKJourney(journey,journey.endAt);net+=state.afk.totalNet-before;trips++}
    if(finished.length)state.afk.journeys=state.afk.journeys.filter(j=>j.endAt>cursor);
    const busy=new Set(state.afk.journeys.map(j=>j.shipKey));
    eligibleAFKShips().forEach(shipKey=>{if(!busy.has(shipKey)){const employee=nextEmployeeForShip(shipKey,cursor);if(employee&&dispatchAFK(employee,cursor))busy.add(shipKey)}});
    const events=[to];
    state.afk.journeys.forEach(j=>{if(j.endAt>cursor)events.push(j.endAt)});
    Object.values(state.shipUnavailableUntil||{}).forEach(until=>{if(until>cursor&&until<=to)events.push(until)});
    state.afk.employees.forEach(e=>{
      for(const value of [e.restUntil,e.awayUntil,e.leaveStart])if(value>cursor)events.push(value);
      if(e.shipKey&&!shiftOpen(e,new Date(cursor)))events.push(nextShiftOpening(e,cursor));
    });
    const next=Math.min(...events.filter(value=>value>cursor));
    if(!Number.isFinite(next)||next<=cursor)break;
    cursor=next;
  }
  return{trips,net};
}

processAFK=(forceRender=false)=>{
  ensureAdvancedAFK();ensureStaffMarket();
  const now=Date.now(),a=state.afk,from=Math.min(now,Number(a.lastSimulationAt)||now),offline=now-from>5*60000;
  processMoodCalendar(now);
  const report=simulateAutomaticPeriod(from,now);
  a.lastSimulationAt=now;
  managerAdmin(now);ensureStaffMarket(now);
  if(offline&&report.trips)a.offlineReport={trips:report.trips,net:report.net,elapsed:now-from,at:now};
  save();
  if(report.trips||forceRender){renderAFK();renderGarage();renderContracts()}
};
addEventListener("pagehide",()=>{ensureAdvancedAFK();if(!Number.isFinite(state.afk.lastSimulationAt))state.afk.lastSimulationAt=Date.now();save()});

const renderAFKBeforeOperationsV2=renderAFK;
renderAFK=()=>{
  ensureStaffMarket();renderAFKBeforeOperationsV2();
  const a=state.afk,summary=$("#automaticSummary"),market=a.staffMarket,now=Date.now();
  if(summary){const team=[...summary.querySelectorAll("span")].find(x=>x.querySelector("small")?.textContent==="EQUIPE");if(team)team.querySelector("b").textContent=`${a.employees.length}/${STAFF_LIMIT_V2}`}
  document.querySelector(".offline-report")?.remove();
  if(a.offlineReport){const report=a.offlineReport,section=$("#automatic");section?.querySelector(".section-head")?.insertAdjacentHTML("afterend",`<div class="offline-report"><div><b>Operação processada pelo relógio do computador</b><p>${report.trips} ${report.trips===1?'viagem':'viagens'} concluída${report.trips===1?'':'s'} durante ${formatDuration(report.elapsed)}.</p></div><strong class="${report.net>=0?'fuel-ok':'fuel-bad'}">${report.net>=0?'+':'−'}${Math.abs(Math.round(report.net)).toLocaleString('pt-BR')} CR</strong></div>`)}
  document.querySelector(".candidate-progress")?.remove();
  const target=market.unlockedTier<2?2:market.unlockedTier<3?3:null,unlockAt=target===2?market.tier2At:market.tier3At;
  $("#candidateGrid")?.insertAdjacentHTML("beforebegin",`<div class="candidate-progress">Mercado atual: <b>pilotos até o nível ${market.unlockedTier}</b>. ${target?unlockAt?`Nível ${target} disponível em ${formatDuration(Math.max(0,unlockAt-now))}.`:`Preencha as seis vagas com pilotos de nível ${target-1} para iniciar a liberação do nível ${target}.`:'Todos os níveis de contratação estão liberados.'} Candidatos continuam disponíveis para futuras substituições.</div>`);
  $$("[data-hire]").forEach(button=>button.disabled=a.employees.length>=STAFF_LIMIT_V2||button.disabled);
};

function shiftEndTimestamp(employee,at){
  const date=new Date(at),end=new Date(at);
  if(employee.shift==='night'){if(date.getHours()>=22)end.setDate(end.getDate()+1);end.setHours(6,0,0,0)}else end.setHours(16,0,0,0);
  return end.getTime();
}
function nextScheduledEmployee(employee,shipKey){
  const order=(state.afk.shipOrders?.[shipKey]||[]).filter(id=>state.afk.employees.some(candidate=>candidate.id===id&&candidate.shipKey===shipKey));
  if(order.length<2)return null;
  const index=Math.max(0,order.indexOf(employee.id));
  for(let step=1;step<order.length;step++){const candidate=state.afk.employees.find(item=>item.id===order[(index+step)%order.length]);if(candidate?.routeDestination&&!candidate.negotiationPending)return candidate}
  return null;
}
function predictedJourneyHours(employee){return(AUTO_ROUTE_HOURS[employee.routeDestination]||8)*staffStats(employee).speed}
function journeyFitsSequence(employee,shipKey,now){
  const next=nextScheduledEmployee(employee,shipKey);
  if(!next)return true;
  return now+predictedJourneyHours(employee)*3600000<=nextShiftOpening(next,now);
}
nextEmployeeForShip=(shipKey,now)=>{
  const a=state.afk,order=(a.shipOrders?.[shipKey]||[]).filter(id=>a.employees.some(employee=>employee.id===id&&employee.shipKey===shipKey));a.shipOrders[shipKey]=order;
  if(!order.length)return null;
  const last=a.lastEmployeeByShip?.[shipKey],start=Math.max(-1,order.indexOf(last));
  for(let step=1;step<=order.length;step++){
    const employee=a.employees.find(item=>item.id===order[(start+step)%order.length]);
    if(employee&&employeeCanDispatch(employee,now)&&journeyFitsSequence(employee,shipKey,now)){a.lastEmployeeByShip=a.lastEmployeeByShip||{};a.lastEmployeeByShip[shipKey]=employee.id;return employee}
  }
  return null;
};
const dispatchAFKBeforeSequence=dispatchAFK;
dispatchAFK=(employee,now=Date.now())=>{
  if(!journeyFitsSequence(employee,employee.shipKey,now))return false;
  const started=dispatchAFKBeforeSequence(employee,now);
  if(started){const journey=state.afk.journeys.find(item=>item.employeeId===employee.id&&item.startedAt===now);if(journey)journey.overtimeHours=Math.max(0,(journey.endAt-shiftEndTimestamp(employee,now))/3600000)}
  return started;
};
function shipHasAvailableDestination(employee,shipKey){
  const ship=SHIPS[shipKey],record=afkShipRecord(shipKey);if(!ship||record.condition<20)return false;
  return contracts().some(contract=>!contract.emergency&&!isExtrasolarDestination(contract.destination)&&contract.level<=employee.level&&contract.volume<=ship.slots&&contract.mass<=ship.mass&&(!employee.routeDestination||contract.destination===employee.routeDestination)&&shipCanReachDestination(key,contract.destination)&&Math.round(tripFuel([contract])*staffStats(employee).fuel)<=record.fuel);
}
const renderAFKBeforeShipAvailability=renderAFK;
renderAFK=()=>{
  renderAFKBeforeShipAvailability();
  $$('#crewGrid [data-assign]').forEach(select=>{
    const employee=state.afk.employees.find(item=>item.id===select.dataset.assign);if(!employee)return;let limited=false;
    [...select.options].forEach(option=>{if(!option.value)return;const available=shipHasAvailableDestination(employee,option.value);option.disabled=!available;option.textContent=option.textContent.replace(/ · indisponível$/,'')+(available?'':' · indisponível');if(!available)limited=true});
    select.classList.toggle('ship-limited',limited);
  });
};

const completeAFKJourneyBeforeOvertime=completeAFKJourney;
completeAFKJourney=(journey,now)=>{
  completeAFKJourneyBeforeOvertime(journey,now);
  const overtime=Math.max(0,Number(journey.overtimeHours)||0),log=state.afk.log.find(item=>item.id===journey.id),employee=state.afk.employees.find(item=>item.id===journey.employeeId);
  if(!overtime||!log||!employee)return;
  const commission=Math.round(log.afterTax*staffStats(employee).commission*(1+(overtime/journey.hours)*.5)),benefits=0,operatingNet=log.afterTax-(log.loanPayment||0)-commission-benefits-log.fuelCost-log.repair,managerFee=state.afk.manager&&operatingNet>0?Math.round(operatingNet*managerCommissionRate()):0,net=operatingNet-managerFee,difference=net-log.net;
  state.credits+=difference;state.afk.totalNet+=difference;
  Object.assign(log,{commission,benefits,managerFee,net,overtime});
  const ledger=state.financeLedger?.find(entry=>entry.sourceId===journey.id);
  if(ledger){ledger.expenses=(log.tax||0)+(log.loanPayment||0)+commission+benefits+log.fuelCost+log.repair+managerFee;ledger.net=net}
};

const completeAFKJourneyBeforeShipFuelPrice=completeAFKJourney;
completeAFKJourney=(journey,now)=>{
  completeAFKJourneyBeforeShipFuelPrice(journey,now);
  const log=state.afk?.log?.find(item=>item.id===journey.id);if(!log)return;
  const correctFuelCost=journey.fuel*fuelPrice(journey.shipKey),previousFuelCost=Number(log.fuelCost)||0,refund=previousFuelCost-correctFuelCost;if(!refund)return;
  log.fuelCost=correctFuelCost;log.net+=refund;state.credits+=refund;state.afk.totalNet+=refund;
  const ledger=state.financeLedger?.find(entry=>entry.sourceId===journey.id);if(ledger){ledger.expenses-=refund;ledger.net+=refund}
};

const renderAFKBeforeDynamicTaxLabel=renderAFK;
renderAFK=()=>{renderAFKBeforeDynamicTaxLabel();$$('.trip-log').forEach((card,index)=>{const log=state.afk?.log?.[index],taxLine=card.querySelector('.tax-line');if(log&&taxLine)taxLine.textContent=`${GAME_LANGUAGE==='en-US'?'Tax':'Imposto'} ${economyPercent(ECONOMY.freightTax)} −${(log.tax||0).toLocaleString(GAME_LANGUAGE==='en-US'?'en-US':'pt-BR')}`})};

const renderGarageBeforeAutomaticAvailability=renderGarage;
renderGarage=()=>{
  renderGarageBeforeAutomaticAvailability();
  const english=GAME_LANGUAGE==='en-US';
  $$('#fleetGrid .fleet-card').forEach(card=>{
    const key=Object.keys(SHIPS).find(shipKey=>SHIPS[shipKey].name===card.querySelector('h2')?.textContent),journey=state.afk?.journeys?.find(item=>item.shipKey===key);
    if(!key||!journey)return;
    card.classList.add('automatic-trip');
    const eyebrow=card.querySelector('.eyebrow'),button=card.querySelector('[data-activate-ship]'),details=card.querySelector('.fleet-details');
    if(eyebrow)eyebrow.textContent=english?'ON AUTOMATIC JOURNEY':'EM VIAGEM AUTOMÁTICA';
    if(button){button.disabled=true;button.className='secondary';button.textContent=english?'Ship unavailable':'Nave indisponível'}
    details?.querySelector('.automatic-trip-status')?.remove();
    details?.insertAdjacentHTML('afterbegin',`<p class="automatic-trip-status"><b>${english?'Route':'Rota'}: ${journey.destination}</b><span>${english?'Returns':'Retorna'} ${formatAFKTime(journey.endAt)}</span></p>`);
  });
};

MANAGER_CANDIDATES.forEach(manager=>{if(!manager.baseCost){manager.baseCost=manager.cost;manager.cost*=2}});
if(state.afk?.managerCandidates)state.afk.managerCandidates.forEach(manager=>{const base=MANAGER_CANDIDATES.find(item=>item.id===manager.id)?.baseCost||manager.cost;manager.cost=base*2});

function trainManager(skill){
  ensureAdvancedAFK();const manager=normalizeManager(state.afk.manager),english=GAME_LANGUAGE==='en-US';
  if(!manager||!MANAGER_SKILLS[skill])return;
  const level=manager.skills[skill]||0;if(level>=4)return toast(english?'This management category is already at maximum level.':'Esta categoria de gestão já está no nível máximo.');
  const cost=managerTrainingCost(skill);if(state.credits<cost)return toast(english?'Insufficient credits for this management course.':'Créditos insuficientes para este treinamento gerencial.');
  state.credits-=cost;manager.skills[skill]=level+1;save();
  if(typeof addFinance==='function')addFinance({kind:'manager_training',title:(english?'Manager training · ':'Treinamento gerencial · ')+(MANAGER_SKILLS[skill][english?'nameEn':'name']),detail:`${manager.name} · ${english?'level':'nível'} ${level+1}`,expenses:cost,net:-cost});
  renderAFK();toast(english?'Management category improved.':'Categoria gerencial melhorada.');
}
function fireManager(){
  ensureAdvancedAFK();const manager=normalizeManager(state.afk.manager),english=GAME_LANGUAGE==='en-US';if(!manager)return;
  const cost=managerSeveranceCost();if(state.credits<cost)return toast(english?'Insufficient credits to pay the severance.':'Créditos insuficientes para pagar a multa rescisória.');
  const message=english?`Dismiss ${manager.name} and pay ${cost.toLocaleString('en-US')} CR in severance?`:`Demitir ${manager.name} e pagar ${cost.toLocaleString('pt-BR')} CR de multa rescisória?`;
  if(!confirm(message))return;state.credits-=cost;state.afk.manager=null;save();
  if(typeof addFinance==='function')addFinance({kind:'manager_severance',title:english?'Manager dismissal':'Demissão de gerente',detail:manager.name,expenses:cost,net:-cost});
  renderAFK();toast(english?`${manager.name} was dismissed.`:`${manager.name} foi desligado(a).`);
}
const renderAFKBeforeManagerDevelopment=renderAFK;
renderAFK=()=>{
  renderAFKBeforeManagerDevelopment();const panel=$('#managerPanel'),manager=normalizeManager(state.afk?.manager);if(!panel||!manager)return;
  const english=GAME_LANGUAGE==='en-US',locale=english?'en-US':'pt-BR',rate=Math.round(managerCommissionRate()*100),moodLimit=managerMoodLimit(),leaveDiscount=Math.round(managerLeaveDiscount()*100),severance=managerSeveranceCost();
  panel.innerHTML=`<article class="manager-card manager-employed"><div class="staff-title"><div><span class="eyebrow">${english?'MANAGER LEVEL':'GERENTE NÍVEL'} ${manager.level}</span><h3>${manager.name}</h3></div><span class="staff-level">N${manager.level}</span></div><p>${manager.history}</p><div class="staff-metrics manager-metrics"><span>${english?'Commission':'Comissão'}<b>${rate}%</b></span><span>${english?'Leave trigger':'Gatilho de folga'}<b>${moodLimit}%</b></span><span>${english?'Benefit discount':'Desconto benefícios'}<b>${leaveDiscount}%</b></span></div><div class="staff-training manager-training">${Object.entries(MANAGER_SKILLS).map(([key,skill])=>{const level=manager.skills[key]||0,max=level>=4,cost=max?0:managerTrainingCost(key);return`<div><span><b>${skill[english?'nameEn':'name']} · ${english?'Level':'Nível'} ${level}/4</b><small>${skill[english?'descEn':'desc']}</small></span><button class="${max?'secondary':state.credits>=cost?'primary':'danger'}" data-train-manager="${key}" ${max?'disabled':''}>${max?(english?'Maximum':'Máximo'):`N${level+1} · ${cost.toLocaleString(locale)} CR`}</button></div>`}).join('')}</div><button class="danger manager-fire" id="fireManager" ${state.credits<severance?'disabled':''}>${english?'Dismiss manager':'Demitir gerente'} · ${english?'severance':'multa'} ${severance.toLocaleString(locale)} CR</button></article>`;
  $$('[data-train-manager]').forEach(button=>button.onclick=()=>trainManager(button.dataset.trainManager));$('#fireManager').onclick=fireManager;
};

function setFlightPaused(paused){
  if(!flight||!['flying','paused'].includes(flight.status))return;
  const overlay=$("#flightPauseOverlay"),button=$("#pauseFlight");
  flight.status=paused?"paused":"flying";keys={left:false,right:false,topLeft:false,topRight:false};
  overlay?.classList.toggle("hidden",!paused);button?.classList.toggle("paused",paused);button.textContent=paused?(GAME_LANGUAGE==='en-US'?"Resume":"Continuar"):(GAME_LANGUAGE==='en-US'?"Pause":"Pausar");
}
function updatePauseAvailability(){const button=$("#pauseFlight");if(button)button.disabled=!flight||!['flying','paused'].includes(flight.status)}
const pauseButton=$("#pauseFlight");
pauseButton.onclick=()=>{if(flight?.status==="flying")setFlightPaused(true);else if(flight?.status==="paused")setFlightPaused(false)};
const stage=document.querySelector(".flight-stage");
const pauseEnglish=GAME_LANGUAGE==='en-US';
pauseButton.textContent=pauseEnglish?'Pause':'Pausar';
stage.insertAdjacentHTML("beforeend",`<div id="flightPauseOverlay" class="pause-overlay hidden"><div><h2>${pauseEnglish?'LANDING PAUSED':'POUSO PAUSADO'}</h2><p>${pauseEnglish?'Physics and fuel consumption are suspended.':'A física e o consumo de combustível estão suspensos.'}</p><button id="resumeFlight" class="primary">${pauseEnglish?'Resume landing':'Continuar pouso'}</button></div></div>`);
$("#resumeFlight").onclick=()=>setFlightPaused(false);
addEventListener("keydown",event=>{if((event.key==="p"||event.key==="P"||event.key==="Escape")&&flight&&['flying','paused'].includes(flight.status)){event.preventDefault();setFlightPaused(flight.status==="flying")}},true);
let gamepadPauseHeld=false;function monitorPauseGamepad(){const pad=navigator.getGamepads?.()[0],motorButtons=new Set(Object.values(inputConfig?.bindings||{}).map(Number)),pauseIndex=[9,8,11].find(index=>!motorButtons.has(index)),held=pauseIndex!==undefined&&readGamepadButton(pad?.buttons?.[pauseIndex])>.5;if(held&&!gamepadPauseHeld&&flight&&['flying','paused'].includes(flight.status))setFlightPaused(flight.status==="flying");gamepadPauseHeld=held;updatePauseAvailability();requestAnimationFrame(monitorPauseGamepad)}requestAnimationFrame(monitorPauseGamepad);

addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")processAFK(true)});
addEventListener("focus",()=>processAFK(false));
ensureStaffMarket();processAFK(true);renderAFK();

