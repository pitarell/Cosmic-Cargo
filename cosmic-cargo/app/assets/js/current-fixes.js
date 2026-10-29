"use strict";
(()=>{
  const isEnglish=()=>GAME_LANGUAGE==='en-US';
  const money=value=>`${Math.round(Math.abs(Number(value)||0)).toLocaleString(isEnglish()?'en-US':'pt-BR')} CR`;
  const balanceMoney=value=>`${Number(value)<0?'−':''}${money(value)}`;
  const destinationOrder=['Lua','Vênus','Marte','Sol','Europa','Titã','Halley','Netuno','Plutão','Andrômeda','Triângulo','Escultor'];
  const destinationSlug=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const colonyRelationshipLevel=value=>Math.max(1,Math.min(5,1+Math.floor(Math.max(0,Number(value)||0)/25)));
  let allContractsFreightOrder='highest';
  const accessoryHash=value=>[...String(value||'')].reduce((total,char)=>(Math.imul(total,31)+char.charCodeAt(0))>>>0,17);
  const SHIP_ACCESSORIES={
    refrigeration:{icon:'❄',base:2400,pt:'Refrigeração do compartimento de cargas',en:'Refrigerated cargo hold',detailPt:'Permite transportar cargas refrigeradas, que consomem combustível adicional durante a viagem.',detailEn:'Allows refrigerated cargo, which consumes additional fuel throughout the trip.'},
    lifeSupport:{icon:'◉',base:3000,pt:'Pod de manutenção de vida',en:'Life-support pod',detailPt:'Mantém organismos, animais e outras cargas vivas em condições seguras durante a rota.',detailEn:'Keeps organisms, animals and other living cargo safe throughout the route.'},
    radiationShield:{icon:'☢',base:3600,pt:'Blindagem contra radiação',en:'Radiation shielding',detailPt:'Isola materiais radioativos e protege a nave, a tripulação e as demais encomendas.',detailEn:'Isolates radioactive materials and protects the ship, crew and other cargo.'},
    vault:{icon:'◈',base:5000,pt:'Cofre diplomático',en:'Diplomatic vault',detailPt:'Protege documentos, artefatos e encomendas secretas liberadas na categoria Diplomática.',detailEn:'Protects documents, artifacts and secret orders unlocked in the Diplomatic category.'}
  };
  function ensureShipAccessories(){state.shipAccessories=state.shipAccessories&&typeof state.shipAccessories==='object'?state.shipAccessories:{};state.ownedShips.forEach(key=>state.shipAccessories[key]=state.shipAccessories[key]||{})}
  function hasShipAccessory(key,shipKey=state.activeShip){ensureShipAccessories();return !!state.shipAccessories[shipKey]?.[key]}
  function requiredAccessory(contract){if(!contract||contract.emergency||stableCareerLandings<5)return null;if(contract.secretCargo)return'vault';const trait=contract.requiresRefrigeration?'refrigerated':contract.logistics?.trait||contract.trait;return trait==='refrigerated'?'refrigeration':trait==='live'?'lifeSupport':trait==='radioactive'?'radiationShield':null}
  function accessoryCost(key){return Math.round(SHIP_ACCESSORIES[key].base*Math.max(1,(SHIPS[state.activeShip]?.upgradeScale||1)*.55))}

  let stableCareerState=state,stableCareerLandings=Number(state.landings)||0;
  const contractsBeforeLinearCargo=contracts;
  contracts=()=>{
    const list=contractsBeforeLinearCargo();
    if(state!==stableCareerState){stableCareerState=state;stableCareerLandings=Number(state.landings)||0}
    else stableCareerLandings=Math.max(stableCareerLandings,Number(state.landings)||0);
    const normalized=stableCareerLandings<3?list:list.map(contract=>{
      const originalContractIndex=String(contract.id||'').split('-')[2];
      if(!['Lua','Vênus','Marte'].includes(contract.destination)||contract.emergency||originalContractIndex!=='0')return contract;
      return{...contract,volume:3,linearThree:true,shapeVariant:0};
    });
    const specs=state.acceptedCargoSpecs||{};
    return normalized.map(contract=>{
      const stored=state.accepted.includes(contract.id)&&specs[contract.id]?{...contract,...specs[contract.id]}:contract;
      if(stored.emergency)return{...stored,trait:'standard',requiresRefrigeration:false,logistics:{...stored.logistics,trait:'standard'}};
      const trait=stored.logistics?.trait||stored.trait,randomRefrigerated=stableCareerLandings>=5&&!stored.emergency&&['standard','perishable'].includes(trait)&&accessoryHash(stored.id)%6===0;
      const prepared=randomRefrigerated?{...stored,trait:'refrigerated',requiresRefrigeration:true,logistics:{...stored.logistics,trait:'refrigerated'}}:stored;
      return Number(prepared.level)===5&&accessoryHash(`${prepared.id}-secret`)%3===0?{...prepared,secretCargo:true,trait:'standard',requiresRefrigeration:false,logistics:{...prepared.logistics,trait:'standard'}}:prepared;
    });
  };
  const baseCargoShapeBeforeLinear=baseCargoShape;
  baseCargoShape=contract=>contract?.volume===3&&contract.linearThree?[[0,0],[0,1],[0,2]]:baseCargoShapeBeforeLinear(contract);
  const toggleContractBeforeCargoSnapshot=toggleContract;
  toggleContract=id=>{
    const wasAccepted=state.accepted.includes(id),visibleContract=contracts().find(contract=>contract.id===id),spec=visibleContract?{volume:visibleContract.volume,linearThree:!!visibleContract.linearThree,shapeVariant:visibleContract.shapeVariant||0}:null,result=toggleContractBeforeCargoSnapshot(id);
    state.acceptedCargoSpecs=state.acceptedCargoSpecs||{};
    if(!wasAccepted&&state.accepted.includes(id)&&spec)state.acceptedCargoSpecs[id]=spec;
    if(wasAccepted&&!state.accepted.includes(id))delete state.acceptedCargoSpecs[id];
    save();renderContracts();renderCargo();return result;
  };
  function cargoFitsEmptyHold(contract){
    if(!contract)return false;
    for(let rotation=0;rotation<4;rotation++)for(let anchor=0;anchor<shipSlots();anchor++)if(cellsForCargo(contract,anchor,rotation))return true;
    return false;
  }
  function fuelForCandidateContract(contract){
    const current=acceptedCargo();if(current.some(item=>item.id===contract.id))return tripFuel(current);
    const candidate=[...current,contract],humanitarianDue=!current.length&&((state.tutorial?.active&&(state.landings||0)===2)||(state.landings||0)>=Number(state.nextHumanitarianAt||Infinity));
    if(humanitarianDue&&!contract.emergency){const humanitarian=emergencyContract(contract.destination);if(humanitarian)candidate.push(humanitarian)}
    return tripFuel(candidate);
  }
  function acceptedSlotUsage(){const specs=state.acceptedCargoSpecs||{},availableContracts=new Map(contracts().map(contract=>[contract.id,contract]));return state.accepted.reduce((total,id)=>total+Number(specs[id]?.volume??availableContracts.get(id)?.volume??0),0)}
  function humanitarianSlotReservation(){const hasEmergency=state.accepted.some(id=>id.startsWith('emergency-')),due=(state.tutorial?.active&&(state.landings||0)===2)||(state.landings||0)>=Number(state.nextHumanitarianAt||Infinity);return due&&!hasEmergency?1:0}
  const contractBlockReasonBeforePhysicalFit=contractBlockReason;
  contractBlockReason=contract=>{
    if(!state.accepted.includes(contract.id)){const used=acceptedSlotUsage(),humanitarianReserve=humanitarianSlotReservation(),available=Math.max(0,shipSlots()-used-humanitarianReserve);if(Number(contract.volume)>available)return isEnglish()?`Requires ${contract.volume} slots; ${available} available${humanitarianReserve?' because 1 slot is reserved for mandatory humanitarian cargo':''}.`:`Exige ${contract.volume} slots; ${available} disponível${available===1?'':'is'}${humanitarianReserve?' porque 1 slot está reservado para a carga humanitária obrigatória':''}.`}
    const accessory=requiredAccessory(contract);if(accessory&&!hasShipAccessory(accessory)){const item=SHIP_ACCESSORIES[accessory];return isEnglish()?`Requires ${item.en}. Purchase this accessory in the Workshop.`:`Exige ${item.pt.toLowerCase()}. Compre este acessório na Oficina.`}
    const reason=contractBlockReasonBeforePhysicalFit(contract);
    if(reason)return reason;
    const requiredFuel=fuelForCandidateContract(contract),available=Math.max(0,state.fuel-150);
    if(requiredFuel>available)return isEnglish()?`Insufficient fuel: ${requiredFuel} units required, ${available} available after landing reserve.`:`Combustível insuficiente: são necessárias ${requiredFuel} unidades, mas apenas ${available} estão disponíveis após reservar o pouso.`;
    if(!cargoFitsEmptyHold(contract))return isEnglish()?'Incompatible shape: this piece does not fit in the current ship.':'Formato incompatível: esta peça não cabe na nave atual.';
    return'';
  };

  function normalizeFinance(){
    state.financeLedger=Array.isArray(state.financeLedger)?state.financeLedger:[];
    state.financeLedger.forEach(entry=>{
      for(const key of ['gross','expenses','tax','net'])entry[key]=Number.isFinite(Number(entry[key]))?Number(entry[key]):0;
      if(!entry.title)entry.title=isEnglish()?'Unidentified transaction':'Movimentação não identificada';
      if(!entry.detail)entry.detail=isEnglish()?'No additional description':'Sem descrição complementar';
    });
  }

  const renderFinanceBeforeAudit=renderFinance;
  renderFinance=()=>{
    normalizeFinance();
    renderFinanceBeforeAudit();
    const heading=$('.finance-ledger-head span');
    if(heading)heading.textContent=isEnglish()?'Only the 10 most recent records are shown':'Exibição limitada aos 10 registros mais recentes';
    const summary=$('#financeSummary');
    if(summary){
      summary.dataset.scope=isEnglish()?'LAST 10 RECORDS':'ÚLTIMOS 10 REGISTROS';
      const cards=[...summary.querySelectorAll('.finance-kpi')],netCard=cards.at(-1);
      if(netCard){netCard.querySelector('small').textContent=isEnglish()?'ACCUMULATED RESULT OF AUTOMATIC TRIPS':'RESULTADO ACUMULADO DAS VIAGENS AUTOMÁTICAS';const value=Number(state.afk?.totalNet)||0,field=netCard.querySelector('b');field.textContent=`${value>=0?'+':'−'}${money(value)}`;field.className=`finance-net ${value>=0?'positive':'negative'}`}
      if(!summary.querySelector('.available-balance'))summary.insertAdjacentHTML('beforeend',`<article class="finance-kpi available-balance"><small>${isEnglish()?'AVAILABLE BALANCE':'SALDO DISPONÍVEL'}</small><b>${balanceMoney(state.credits)}</b><p>${isEnglish()?'Includes every income and expense in the career.':'Inclui todas as entradas e saídas da carreira.'}</p></article>`);
      else summary.querySelector('.available-balance b').textContent=balanceMoney(state.credits);
      if(!summary.nextElementSibling?.classList.contains('finance-balance-explanation'))summary.insertAdjacentHTML('afterend',`<p class="finance-balance-explanation">${isEnglish()?'The automatic-trip result measures only employee-operated routes. Available balance also reflects your own flights, purchases, fuel, repairs, taxes, insurance, loans and other transactions.':'O resultado das viagens automáticas considera somente as rotas operadas pelos funcionários. O saldo disponível também inclui seus voos, compras, combustível, consertos, impostos, seguros, empréstimos e demais movimentações.'}</p>`);
    }
  };

  const completeAFKJourneyBeforeLabor=completeAFKJourney;
  completeAFKJourney=(journey,time)=>{
    const result=completeAFKJourneyBeforeLabor(journey,time),log=state.afk?.log?.find(item=>item.id===journey.id);
    if(log&&!log.laborChargeApplied){
      const laborBase=(Number(log.commission)||0)+(Number(log.benefits)||0),laborCharge=Math.round(laborBase*LABOR_POLICY.employerCharge);
      log.laborCharge=laborCharge;log.laborChargeApplied=true;log.net=(Number(log.net)||0)-laborCharge;
      state.credits-=laborCharge;state.afk.totalNet=(Number(state.afk.totalNet)||0)-laborCharge;
      const ledger=state.financeLedger?.find(entry=>entry.sourceId===journey.id);
      if(ledger){ledger.expenses=(Number(ledger.expenses)||0)+laborCharge;ledger.net=(Number(ledger.net)||0)-laborCharge;ledger.detail=`${ledger.detail||''} · Encargo trabalhista ${money(laborCharge)}`}
      save();
    }
    return result;
  };

  const renderAFKBeforeLabor=renderAFK;
  renderAFK=()=>{
    renderAFKBeforeLabor();
    const summary=$('#automaticSummary'),labels=summary?[...summary.querySelectorAll('span')]:[],netCard=labels.find(item=>/LUCRO LÍQUIDO ACUMULADO|ACCUMULATED NET PROFIT/i.test(item.textContent));
    if(netCard)netCard.querySelector('small').textContent=isEnglish()?'ACCUMULATED RESULT OF AUTOMATIC TRIPS':'RESULTADO ACUMULADO DAS VIAGENS AUTOMÁTICAS';
    if(summary&&!summary.querySelector('.automatic-available-balance'))summary.insertAdjacentHTML('beforeend',`<span class="automatic-available-balance"><small>${isEnglish()?'AVAILABLE BALANCE':'SALDO DISPONÍVEL'}</small><b>${balanceMoney(state.credits)}</b></span>`);
    $$('#automaticLog .trip-log').forEach((card,index)=>{
      const log=state.afk?.log?.[index],economy=card.querySelector('.trip-economy');
      if(!log||!economy||economy.querySelector('.labor-charge'))return;
      const taxLine=[...economy.children].find(element=>/Imposto|Tax/i.test(element.textContent));
      const line=document.createElement('span'),rate=economyPercent(LABOR_POLICY.employerCharge);line.className='labor-charge';line.innerHTML=`${isEnglish()?'Employer payroll charge':'Encargo trabalhista'} · ${rate} <b>−${money(log.laborCharge||0)}</b>`;
      if(taxLine)taxLine.after(line);else economy.appendChild(line);
    });
  };

  function decorateDestinations(){
    $$('#destinationFilter [data-dest]').forEach(button=>{if(button.dataset.dest!=='Todos'&&!button.querySelector('.destination-mini-icon'))button.insertAdjacentHTML('afterbegin',`<i class="destination-mini-icon destination-${destinationSlug(button.dataset.dest)}"></i>`)});
    $$('#contractList .card').forEach(card=>{const name=card.querySelector('.route h2')?.textContent?.trim(),planet=card.querySelector('.planet');if(name&&planet){planet.textContent='';planet.className=`planet destination-pixel destination-${destinationSlug(name)}`}});
    const lore=$('#destinationLore'),selected=acceptedCargo()[0]?.destination||(filter!=='Todos'?filter:null),orb=lore?.querySelector('.destination-orb');
    if(selected&&orb){orb.textContent='';orb.className=`destination-orb destination-pixel destination-${destinationSlug(selected)}`}
    if(lore&&!lore.classList.contains('hidden')&&!lore.querySelector('#hideDestinationLoreBottom')){
      lore.insertAdjacentHTML('beforeend',`<div class="destination-lore-bottom"><button id="hideDestinationLoreBottom" class="secondary">${isEnglish()?'Hide destination story':'Ocultar história do destino'}</button></div>`);
      $('#hideDestinationLoreBottom').onclick=()=>$('#toggleDestinationLore')?.click();
    }
    const relationship=lore?.querySelector('.colony-operation span:first-child b');if(relationship&&selected){const score=Number(state.colonyRelations?.[selected])||0,description=relationship.textContent.replace(/^(NÍVEL|LEVEL)\s+\d+\s+·\s+/i,'');relationship.textContent=`${isEnglish()?'LEVEL':'NÍVEL'} ${colonyRelationshipLevel(score)} · ${description}`}
  }

  function preserveDestinationLayout(){
    const destination=acceptedCargo()[0]?.destination,container=$('#destinationFilter');
    if(!destination||!container||(state.landings||0)<5)return;
    const available=Object.keys(DESTINATIONS).filter(name=>GAME_EDITION!=='android'||!isExtrasolarDestination(name)),solar=available.filter(name=>!isExtrasolarDestination(name)),extra=available.filter(name=>isExtrasolarDestination(name));
    const button=name=>`<button class="${name===destination?'active':'destination-locked'}" data-dest="${name}" ${name===destination?'':'disabled'} title="${name===destination?'':(isEnglish()?'Finish or cancel the current contracts to change destination.':'Finalize ou cancele os contratos atuais para trocar de destino.')}">${name}</button>`;
    const group=(label,names,type)=>`<section class="destination-group ${type}"><span class="destination-group-label">${label}</span><div>${names.map(button).join('')}</div></section>`;
    container.innerHTML=`<div class="destination-all"><button class="destination-locked" disabled>${isEnglish()?'All':'Todos'}</button></div>${group(isEnglish()?'SOLAR SYSTEM':'SISTEMA SOLAR',solar,'solar')}${group(isEnglish()?'EXTRASOLAR ROUTES':'ROTAS EXTRASSOLARES',extra,'extrasolar')}`;
    container.querySelector(`[data-dest="${destination}"]`)?.addEventListener('click',()=>renderContracts());
  }

  function renderAllContractsFreightFilters(){
    const list=$('#contractList');if(!list)return;
    let controls=$('#allContractsFreightFilters');if(!controls){controls=document.createElement('section');controls.id='allContractsFreightFilters';controls.className='contract-freight-filters';list.before(controls)}
    const show=filter==='Todos'&&!acceptedCargo().length;controls.classList.toggle('hidden',!show);if(!show)return;
    controls.innerHTML=`<span>${isEnglish()?'ORGANIZE AVAILABLE CONTRACTS':'ORGANIZAR CONTRATOS DISPONÍVEIS'}</span><div><button class="${allContractsFreightOrder==='highest'?'active':'secondary'}" data-freight-order="highest">${isEnglish()?'Highest freight value':'Maior valor de frete'} ↓</button><button class="${allContractsFreightOrder==='lowest'?'active':'secondary'}" data-freight-order="lowest">${isEnglish()?'Lowest freight value':'Menor valor de frete'} ↑</button><button class="${allContractsFreightOrder==='destination'?'active':'secondary'}" data-freight-order="destination">${isEnglish()?'Group by destination':'Separar por destinos'} ◫</button></div>`;
    const available=new Map(contracts().map(contract=>[contract.id,contract])),direction=allContractsFreightOrder==='lowest'?1:-1,cards=$$('#contractList .card'),contractFor=card=>available.get(card.querySelector('[data-contract]')?.dataset.contract);
    $$('#contractList .contract-route-divider,#contractList .contract-destination-divider').forEach(divider=>divider.remove());
    if(allContractsFreightOrder==='destination'){
      cards.sort((left,right)=>destinationOrder.indexOf(contractFor(left)?.destination)-destinationOrder.indexOf(contractFor(right)?.destination));let currentDestination=null;
      cards.forEach(card=>{const destination=contractFor(card)?.destination;if(destination!==currentDestination){currentDestination=destination;const divider=document.createElement('div');divider.className=`contract-destination-divider ${isExtrasolarDestination(destination)?'extrasolar':'solar'}`;divider.innerHTML=`<i class="destination-mini-icon destination-${destinationSlug(destination)}"></i><span>${destination}</span>`;list.appendChild(divider)}list.appendChild(card)});
    }else cards.sort((left,right)=>((Number(contractFor(left)?.reward)||0)-(Number(contractFor(right)?.reward)||0))*direction).forEach(card=>list.appendChild(card));
    $$('[data-freight-order]').forEach(button=>button.onclick=()=>{allContractsFreightOrder=button.dataset.freightOrder;renderContracts()});
  }

  const renderContractsBeforePresentation=renderContracts;
  renderContracts=()=>{
    renderContractsBeforePresentation();preserveDestinationLayout();decorateDestinations();renderAllContractsFreightFilters();
    $$('#contractList [data-contract]').forEach(button=>{
      const contract=contracts().find(item=>item.id===button.dataset.contract),card=button.closest('.card');
      if(!contract||!card||card.querySelector('.contract-shape'))return;
      const stats=card.querySelector('.stats');
      const relation=Number(state.colonyRelations?.[contract.destination])||0,tags=card.querySelector('.tags');if(tags&&!tags.querySelector('.colony-level-tag'))tags.insertAdjacentHTML('beforeend',`<span class="tag colony-level-tag">${isEnglish()?'COLONY RELATIONSHIP':'RELAÇÃO COM A COLÔNIA'} · ${isEnglish()?'LEVEL':'NÍVEL'} ${colonyRelationshipLevel(relation)} · ${relation}/100</span>`);
      stats?.insertAdjacentHTML('beforebegin',`<div class="contract-shape"><span><small>${isEnglish()?'CARGO SHAPE':'FORMATO DA CARGA'}</small><b>${contract.linearThree?(isEnglish()?'Linear · 3 slots':'Linear · 3 slots'):(isEnglish()?'Rigid piece':'Peça rígida')}</b></span>${cargoShapePreview(contract)}</div>`);
      if(contract.secretCargo&&!card.querySelector('.secret-cargo-tag'))card.querySelector('.tags')?.insertAdjacentHTML('afterbegin',`<span class="tag secret-cargo-tag">◈ ${isEnglish()?'SECRET CARGO':'CARGA SECRETA'}</span>`);
      if(!cargoFitsEmptyHold(contract)){card.classList.add('shape-incompatible');const shape=card.querySelector('.contract-shape');shape?.insertAdjacentHTML('afterend',`<p class="shape-incompatible-warning">${isEnglish()?'INCOMPATIBLE WITH THE CURRENT SHIP':'INCOMPATÍVEL COM A NAVE ATUAL'}</p>`)}
      if(!state.accepted.includes(contract.id)){const requiredFuel=fuelForCandidateContract(contract),available=Math.max(0,state.fuel-150);if(requiredFuel>available){button.disabled=true;button.className='danger fuel-contract-blocked';button.textContent=isEnglish()?'INSUFFICIENT FUEL':'COMBUSTÍVEL INSUFICIENTE';card.classList.add('fuel-incompatible');card.querySelector('.contract-shape')?.insertAdjacentHTML('afterend',`<p class="fuel-incompatible-warning">${isEnglish()?`Route ${requiredFuel} u + landing reserve 150 u · tank ${Math.round(state.fuel)} u`:`Rota ${requiredFuel} u + reserva de pouso 150 u · tanque ${Math.round(state.fuel)} u`}</p>`)}}
      const accessory=requiredAccessory(contract);if(accessory&&!hasShipAccessory(accessory)){const item=SHIP_ACCESSORIES[accessory];button.disabled=true;button.className='danger accessory-contract-blocked';button.textContent=isEnglish()?'ACCESSORY REQUIRED':'ACESSÓRIO OBRIGATÓRIO';card.classList.add('accessory-incompatible');if(!card.querySelector('.accessory-required-warning'))card.querySelector('.contract-shape')?.insertAdjacentHTML('afterend',`<p class="accessory-required-warning">${item.icon} ${isEnglish()?`Install ${item.en} in the Workshop to accept this order.`:`Instale ${item.pt.toLowerCase()} na Oficina para aceitar esta encomenda.`}</p>`)}
    });
  };

  let pendingAccessories={shipKey:null,keys:[]};
  function resetPendingAccessories(){if(pendingAccessories.shipKey!==state.activeShip)pendingAccessories={shipKey:state.activeShip,keys:[]}}
  function accessoryPurchaseTotals(){resetPendingAccessories();const base=pendingAccessories.keys.reduce((total,key)=>total+accessoryCost(key),0),tax=pendingAccessories.keys.reduce((total,key)=>total+Math.round(accessoryCost(key)*ECONOMY.upgradeTax),0);return{base,tax,total:base+tax}}
  function toggleShipAccessoryPurchase(key){const item=SHIP_ACCESSORIES[key];ensureShipAccessories();resetPendingAccessories();resetPendingUpgradesIfNeeded();if(!item||hasShipAccessory(key))return;const selected=pendingAccessories.keys.includes(key);if(selected)pendingAccessories.keys=pendingAccessories.keys.filter(itemKey=>itemKey!==key);else{const base=accessoryCost(key),tax=Math.round(base*ECONOMY.upgradeTax),pendingTotal=pendingUpgradeTotals().total+accessoryPurchaseTotals().total;if(pendingTotal+base+tax>state.credits)return toast(isEnglish()?'This item exceeds the available balance for the current Workshop purchase.':'Este item ultrapassa o saldo disponível para a compra atual da Oficina.');pendingAccessories.keys.push(key)}window.dispatchEvent(new CustomEvent('cosmiccargo:workshop-accessory-selection',{detail:{selected:!selected}}));renderGarage()}
  const buyUpgradeBeforeCombinedBudget=buyUpgrade;
  buyUpgrade=key=>{resetPendingAccessories();resetPendingUpgradesIfNeeded();const queued=pendingUpgrades.items.filter(item=>item.key===key).length,level=(state.upgrades[key]||0)+queued;if(level>=upgradeMax(key))return buyUpgradeBeforeCombinedBudget(key);const base=upgradeCostAt(key,level),tax=Math.round(base*ECONOMY.upgradeTax),pendingTotal=pendingUpgradeTotals().total+accessoryPurchaseTotals().total;if(pendingTotal+base+tax>state.credits)return toast(isEnglish()?'This improvement exceeds the available balance for the current Workshop purchase.':'Esta melhoria ultrapassa o saldo disponível para a compra atual da Oficina.');return buyUpgradeBeforeCombinedBudget(key)};

  const renderGarageBeforeAccessories=renderGarage;
  renderGarage=()=>{
    renderGarageBeforeAccessories();ensureShipAccessories();resetPendingAccessories();const shop=$('#upgradeShop'),cart=$('#upgradeCart'),english=isEnglish(),locale=english?'en-US':'pt-BR',upgradeTotals=pendingUpgradeTotals(),accessoryTotals=accessoryPurchaseTotals(),combined={base:upgradeTotals.base+accessoryTotals.base,tax:upgradeTotals.tax+accessoryTotals.tax,total:upgradeTotals.total+accessoryTotals.total},cards=Object.entries(SHIP_ACCESSORIES).map(([key,item])=>{const owned=hasShipAccessory(key),selected=pendingAccessories.keys.includes(key),base=accessoryCost(key),tax=Math.round(base*ECONOMY.upgradeTax),total=base+tax,unaffordable=!selected&&combined.total+total>state.credits,name=english?item.en:item.pt,detail=english?item.detailEn:item.detailPt;return`<article class="shop-item accessory-item ${owned?'owned':selected?'selected':''}"><div><b>${item.icon} ${name}</b><p>${detail}</p><small>${english?'Installed only on':'Instalação exclusiva na'} ${SHIPS[state.activeShip].name}</small></div><button class="${owned?'secondary':selected?'secondary':unaffordable?'danger unaffordable':'primary'}" data-buy-accessory="${key}" ${owned||unaffordable?'disabled':''}>${owned?(english?'INSTALLED':'INSTALADO'):selected?(english?'Remove from purchase':'Remover da compra'):`${english?'Add':'Adicionar'} · ${total.toLocaleString(locale)} CR`} ${owned||selected?'':`<small>${english?'Price':'Preço'} ${base.toLocaleString(locale)} + ${english?'tax':'imposto'} ${tax.toLocaleString(locale)} CR</small>`}</button></article>`}).join('');
    $('#accessoryShop')?.remove();(cart||shop)?.insertAdjacentHTML('afterend',`<section id="accessoryShop" class="accessory-shop"><div class="accessory-shop-head"><span class="eyebrow">${english?'SHIP ACCESSORIES':'ACESSÓRIOS DA NAVE'}</span><h2>${english?'Cargo hold equipment':'Equipamentos do compartimento'}</h2></div><div class="accessory-grid">${cards}</div></section>`);$$('[data-buy-accessory]').forEach(button=>{if(!button.disabled)button.onclick=()=>toggleShipAccessoryPurchase(button.dataset.buyAccessory)});
    $$('#upgradeShop [data-upgrade]').forEach(button=>{const key=button.dataset.upgrade,queued=pendingUpgrades.items.filter(item=>item.key===key).length,level=(state.upgrades[key]||0)+queued,max=level>=upgradeMax(key);if(max)return;const base=upgradeCostAt(key,level),tax=Math.round(base*ECONOMY.upgradeTax),unaffordable=combined.total+base+tax>state.credits;button.disabled=unaffordable;button.className=unaffordable?'danger unaffordable':'primary'});
    if(cart){const totals=cart.querySelector('.upgrade-cart-totals'),head=cart.querySelector('.upgrade-cart-head h3'),count=cart.querySelector('.upgrade-cart-head>b'),finalize=$('#finalizeUpgradePurchase');cart.querySelectorAll('.pending-accessory-row').forEach(row=>row.remove());if(totals)pendingAccessories.keys.forEach(key=>{const item=SHIP_ACCESSORIES[key],base=accessoryCost(key),tax=Math.round(base*ECONOMY.upgradeTax);totals.insertAdjacentHTML('beforebegin',`<div class="upgrade-cart-row pending-accessory-row"><span>${item.icon} ${english?item.en:item.pt}<small>${english?'Ship accessory':'Acessório da nave'}</small></span><b>${(base+tax).toLocaleString(locale)} CR</b><button class="secondary" data-remove-accessory="${key}" aria-label="${english?'Remove':'Remover'}">×</button></div>`)});if(head)head.textContent=english?'Selected improvements and accessories':'Melhorias e acessórios selecionados';if(count)count.textContent=String(pendingUpgrades.items.length+pendingAccessories.keys.length);if(totals)totals.innerHTML=`<p><span>${english?'Items subtotal':'Subtotal dos itens'}</span><b>${combined.base.toLocaleString(locale)} CR</b></p><p><span>${english?'Workshop taxes':'Impostos da Oficina'} · ${economyPercent(ECONOMY.upgradeTax)}</span><b>${combined.tax.toLocaleString(locale)} CR</b></p><p><span>${english?'Purchase total':'Total da compra'}</span><b>${combined.total.toLocaleString(locale)} CR</b></p>`;if(finalize){const hasItems=pendingUpgrades.items.length+pendingAccessories.keys.length>0;finalize.disabled=!hasItems||combined.total>state.credits;finalize.className=hasItems&&combined.total<=state.credits?'primary':'secondary';finalize.textContent=english?'Close Workshop purchase':'Fechar compra da Oficina';finalize.onclick=finalizeWorkshopPurchase}$$('[data-remove-accessory]').forEach(button=>button.onclick=()=>toggleShipAccessoryPurchase(button.dataset.removeAccessory))}
  };

  function finalizeWorkshopPurchase(){
    resetPendingUpgradesIfNeeded();resetPendingAccessories();const english=isEnglish(),locale=english?'en-US':'pt-BR',upgrades=[...pendingUpgrades.items],accessories=[...pendingAccessories.keys],upgradeTotals=pendingUpgradeTotals(),accessoryTotals=accessoryPurchaseTotals(),totals={base:upgradeTotals.base+accessoryTotals.base,tax:upgradeTotals.tax+accessoryTotals.tax,total:upgradeTotals.total+accessoryTotals.total},shipName=SHIPS[state.activeShip].name;
    if(!upgrades.length&&!accessories.length)return toast(english?'Select at least one improvement or accessory.':'Selecione ao menos uma melhoria ou acessório.');if(state.credits<totals.total)return toast(english?'Insufficient credits to close this purchase.':'Créditos insuficientes para fechar esta compra.');
    upgrades.forEach(item=>state.upgrades[item.key]++);accessories.forEach(key=>state.shipAccessories[state.activeShip][key]=true);state.credits-=totals.total;pendingUpgrades={shipKey:state.activeShip,items:[]};pendingAccessories={shipKey:state.activeShip,keys:[]};save();const itemNames=[...upgrades.map(item=>`${UPGRADES[item.key].name} ${item.levelFrom}→${item.levelTo}`),...accessories.map(key=>english?SHIP_ACCESSORIES[key].en:SHIP_ACCESSORIES[key].pt)];addFinance({kind:'workshop_purchase',title:(english?'Workshop purchase · ':'Compra na Oficina · ')+shipName,detail:itemNames.join(' · ')+(english?' · tax ':' · imposto ')+money(totals.tax),expenses:totals.total,tax:totals.tax,net:-totals.total});renderGarage();renderContracts();
    const rows=[...upgrades.map(item=>`<div><span>${UPGRADES[item.key].name} · ${english?'Level':'Nível'} ${item.levelFrom} → ${item.levelTo}</span><strong>${item.base.toLocaleString(locale)} CR</strong></div>`),...accessories.map(key=>{const item=SHIP_ACCESSORIES[key];return`<div><span>${item.icon} ${english?item.en:item.pt} · ${english?'Accessory':'Acessório'}</span><strong>${accessoryCost(key).toLocaleString(locale)} CR</strong></div>`})].join(''),modal=$('#shipPurchaseModal'),content=$('#shipPurchaseContent');content.innerHTML=`<section class="fiscal-receipt workshop-invoice"><header><span>COSMIC CARGO</span><b>${english?'UNIFIED WORKSHOP INVOICE':'NOTA FISCAL UNIFICADA DA OFICINA'}</b></header><p class="invoice-ship">${shipName}</p>${rows}<div><span>${english?'Items subtotal':'Subtotal das melhorias e acessórios'}</span><strong>${totals.base.toLocaleString(locale)} CR</strong></div><div><span>${english?'Workshop taxes':'Impostos da Oficina'} · ${economyPercent(ECONOMY.upgradeTax)}</span><strong>${totals.tax.toLocaleString(locale)} CR</strong></div><div class="fiscal-total"><span>${english?'Total paid':'Total pago'}</span><strong>${totals.total.toLocaleString(locale)} CR</strong></div></section><button id="closeUpgradeInvoice" class="primary">${english?'Close invoice':'Fechar nota fiscal'}</button>`;modal.classList.remove('hidden');$('#closeUpgradeInvoice').onclick=()=>modal.classList.add('hidden');window.dispatchEvent(new CustomEvent('cosmiccargo:workshop-purchase-finalized'));
  }

  function showRotationNotice(){
    let notice=$('#cargoRotationNotice');
    if(!notice){notice=document.createElement('div');notice.id='cargoRotationNotice';notice.className='cargo-rotation-notice';notice.innerHTML=`<div><span>↻</span><h2>${isEnglish()?'ROTATE THE CARGO':'GIRE A PEÇA'}</h2><p>${isEnglish()?'The cargo does not fit in this orientation. Use the rotate button and try placing the complete piece again.':'A carga não cabe nesta orientação. Use o botão de girar e tente encaixar novamente a peça inteira na nave.'}</p><button class="primary">${isEnglish()?'Understood':'Entendi'}</button></div>`;document.body.appendChild(notice);notice.querySelector('button').onclick=()=>notice.classList.remove('show')}
    notice.classList.add('show');clearTimeout(showRotationNotice.timer);showRotationNotice.timer=setTimeout(()=>notice.classList.remove('show'),6000);
  }
  const toastBeforeRotationNotice=toast;
  toast=message=>{/não cabe|does not fit/i.test(String(message))?showRotationNotice():toastBeforeRotationNotice(message)};

  function dealershipDialog(title,body,buttonText='Continuar'){
    const modal=$('#shipPurchaseModal'),content=$('#shipPurchaseContent');if(!modal||!content)return;
    content.innerHTML=`<section class="dealership-npc-dialog"><img src="assets/images/npcs/dealership-agent.png" alt="${isEnglish()?'Dealership representative':'Representante da concessionária'}"><div><span class="eyebrow">${isEnglish()?'ORBITAL DEALERSHIP':'CONCESSIONÁRIA ORBITAL'}</span><h2>${title}</h2>${body}<button id="closeDealershipNpc" class="primary">${buttonText}</button></div></section>`;
    modal.classList.remove('hidden');$('#closeDealershipNpc').onclick=()=>modal.classList.add('hidden');
  }

  function creditNpcDialog(){
    $('#creditNpcDialog')?.remove();
    const english=isEnglish(),rate=economyPercent(ECONOMY.loanInterest),dialog=document.createElement('div');
    dialog.id='creditNpcDialog';dialog.className='credit-npc-overlay';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','creditNpcTitle');
    dialog.innerHTML=`<section class="credit-npc-dialog banker-npc"><span class="npc-portrait npc-slot-2" aria-hidden="true"></span><div class="npc-speech"><small>${english?'BUSINESS ACCOUNT MANAGER':'GERENTE DE CONTA EMPRESARIAL'}</small><h2 id="creditNpcTitle">${english?'Marina Vale · Business credit':'Marina Vale · Crédito empresarial'}</h2><p>${english?`A loan immediately adds funds to your available balance and creates a debt with a one-time interest charge of ${rate}. Only one loan can remain active at a time.`:`O empréstimo adiciona créditos imediatamente ao seu saldo disponível e cria uma dívida com juros únicos de ${rate}. Somente um empréstimo pode permanecer ativo por vez.`}</p><p>${english?'After each delivery, 10% of its gross freight value is automatically used to reduce the debt, after tax and before the other operating costs. You can also make partial payments or pay it off early, receiving a 50% discount on the interest included in that payment.':'Após cada entrega, 10% do valor bruto do frete é usado automaticamente para reduzir a dívida, depois do imposto e antes dos demais custos operacionais. Você também pode amortizar uma parte ou quitar antecipadamente, recebendo 50% de desconto nos juros incluídos nesse pagamento.'}</p><p class="credit-npc-advice">${english?'Compare the expected profit of your routes with the automatic payments before accepting the credit.':'Compare o lucro previsto das rotas com as cobranças automáticas antes de contratar o crédito.'}</p><button id="closeCreditNpcDialog" class="primary">${english?'Understood, show credit options':'Entendi, mostrar opções de crédito'}</button></div></section>`;
    document.body.appendChild(dialog);const close=()=>dialog.remove();$('#closeCreditNpcDialog').onclick=close;dialog.onclick=event=>{if(event.target===dialog)close()};setTimeout(()=>$('#closeCreditNpcDialog')?.focus(),30);
  }

  const navBeforeDealershipNpc=nav;
  nav=view=>{
    navBeforeDealershipNpc(view);
    state.npcEvents=state.npcEvents||{};
    if(view==='credit'&&$('#credit')?.classList.contains('active')&&!state.npcEvents.creditIntroduced){state.npcEvents.creditIntroduced=true;save();setTimeout(creditNpcDialog,100);return}
    if(view!=='dealership')return;
    if(!state.npcEvents.dealershipIntroduced){state.npcEvents.dealershipIntroduced=true;save();setTimeout(()=>dealershipDialog(isEnglish()?'Welcome to the orbital dealership':'Bem-vindo à concessionária orbital',isEnglish()?'<p>Compare ship classes, total price and purchase tax. Trading in the active ship is optional; a traded ship leaves your hangar. Every new ship starts without upgrades, fuel or insurance, so its policy must be purchased separately.</p>':'<p>Compare categorias, preço total e imposto de compra. Entregar a nave ativa na troca é opcional; uma nave entregue sai do Hangar. Toda nave nova começa sem melhorias, combustível ou seguro, portanto a apólice deve ser contratada separadamente.</p>',isEnglish()?'View ships':'Ver naves'),100)}
  };

  const buyShipBeforeDealershipNpc=buyShip;
  buyShip=(key,tradeIn=false)=>{
    const wasOwned=state.ownedShips.includes(key),previousActive=state.activeShip,result=buyShipBeforeDealershipNpc(key,tradeIn);
    if(!wasOwned&&state.ownedShips.includes(key)){
      ensureShipAccessories();state.shipAccessories[key]={};if(tradeIn&&!state.ownedShips.includes(previousActive))delete state.shipAccessories[previousActive];save();renderGarage();
      const ship=SHIPS[key],descriptions={courier:'cargueiro veterano, simples e resistente para iniciar a carreira',hauler:'plataforma branca de maior capacidade para expandir as rotas solares',swift:'nave esportiva de resposta rápida para operações mais exigentes',voyager:'cargueiro avançado preparado para o comércio extrassolar',diplomat:'nave diplomática de elite, com tecnologia e capacidade máximas'};
      setTimeout(()=>dealershipDialog(isEnglish()?`Congratulations on your ${ship.name}`:`Parabéns pela compra da ${ship.name}`,`<p>${isEnglish()?'Your new class':'Sua nova nave de categoria'} ${ship.tier} — ${isEnglish()?'a new stage of the transport company begins.':descriptions[key]+'.'}</p><p>${isEnglish()?'Fuel, upgrades and insurance are managed separately for this ship.':'Lembre-se de abastecer, configurar as melhorias e contratar um seguro próprio para ela.'}</p>`,isEnglish()?'Continue':'Continuar'),80);
    }
    return result;
  };

  const sellShipBeforeAccessories=sellShip;
  sellShip=key=>{const wasOwned=state.ownedShips.includes(key),result=sellShipBeforeAccessories(key);if(wasOwned&&!state.ownedShips.includes(key)){ensureShipAccessories();delete state.shipAccessories[key];save();renderGarage()}return result};

  const pResultBeforeVelocityReport=pResult;
  pResult=(...args)=>{
    pResultBeforeVelocityReport(...args);const metrics=flight?.landingMetrics,report=$('#resultPanel .pilot-report');if(!metrics||!report)return;
    const vertical=metrics.verticalSpeed??metrics.speed??0,horizontal=metrics.horizontalSpeed??0,gear=state.upgrades.gear||0,verticalLimit=38+gear*5,horizontalLimit=14+gear*2,items=report.querySelector('div');
    if(items){const first=items.querySelector('span');first?.remove();items.insertAdjacentHTML('afterbegin',`<span>${isEnglish()?'Vertical speed':'Velocidade vertical'}<b class="${vertical<=verticalLimit?'fuel-ok':'fuel-bad'}">${vertical.toFixed(1)} / ${verticalLimit} m/s</b></span><span>${isEnglish()?'Horizontal speed':'Velocidade horizontal'}<b class="${horizontal<=horizontalLimit?'fuel-ok':'fuel-bad'}">${horizontal.toFixed(1)} / ${horizontalLimit} m/s</b></span>`)}
  };

  const renderCargoBeforeLaunchReadiness=renderCargo;
  renderCargo=()=>{
    const acceptedBeforeRender=acceptedCargo(),acceptedById=new Map(acceptedBeforeRender.map(contract=>[contract.id,contract]));
    for(const [id,contract] of acceptedById){
      const occupied=state.slots.reduce((total,slotId)=>total+(slotId===id?1:0),0);
      if(occupied&&occupied!==contract.volume){state.slots=state.slots.map(slotId=>slotId===id?null:slotId);state.stagedCargo=state.stagedCargo||[];if(!state.stagedCargo.includes(id))state.stagedCargo.push(id)}
    }
    renderCargoBeforeLaunchReadiness();
    const button=$('#launchBtn'),actionbar=button?.closest('.actionbar');if(!button||!actionbar)return;
    $('#launchReadiness')?.remove();
    const accepted=acceptedCargo(),placed=new Set(state.slots.filter(Boolean)),metrics=cargoMetrics(),fuel=tripFuel(accepted),reasons=[];
    if(!accepted.length)reasons.push(isEnglish()?'Select a contract.':'Selecione um contrato.');
    else if(!accepted.every(contract=>placed.has(contract.id)))reasons.push(isEnglish()?'Load every cargo piece into the ship.':'Acondicione todas as cargas nos slots da nave.');
    if(metrics.mass>metrics.limit)reasons.push(isEnglish()?'Cargo exceeds the ship mass limit.':'A carga ultrapassa o limite de massa da nave.');
    if(fuel>state.fuel-150)reasons.push(isEnglish()?`Refuel the ship: the route requires ${fuel} units plus a 150-unit landing reserve.`:`Abasteça a nave: a rota exige ${fuel} unidades e mais 150 unidades de reserva para o pouso.`);
    if(state.condition<20)reasons.push(isEnglish()?'Mandatory repair: ship integrity is below 20%.':'Conserto obrigatório: a integridade da nave está abaixo de 20%.');
    if(Number(state.shipUnavailableUntil?.[state.activeShip]||0)>Date.now())reasons.push(isEnglish()?'The ship is still under repair.':'A nave ainda está em conserto.');
    $$('#cargoRulesPanel.warning strong').forEach(element=>{const text=element.textContent.trim();if(text&&!reasons.includes(text))reasons.push(text)});
    const ready=reasons.length===0;
    button.disabled=!ready;
    button.textContent=ready?(isEnglish()?`START MISSION · ${accepted[0].destination.toUpperCase()}`:`INICIAR MISSÃO · ${accepted[0].destination.toUpperCase()}`):(isEnglish()?'MISSION NOT READY':'MISSÃO AINDA NÃO LIBERADA');
    actionbar.insertAdjacentHTML('beforebegin',`<section id="launchReadiness" class="launch-readiness ${ready?'ready':'blocked'}"><b>${ready?(isEnglish()?'SHIP READY FOR DEPARTURE':'NAVE PRONTA PARA PARTIR'):(isEnglish()?'WHAT IS MISSING':'O QUE FALTA PARA INICIAR')}</b>${ready?`<p>${isEnglish()?'All cargo and operational requirements have been confirmed.':'Todas as cargas e condições operacionais foram confirmadas.'}</p>`:`<ul>${reasons.map(reason=>`<li>${reason}</li>`).join('')}</ul>`}</section>`);
  };

  function ensureShipNicknames(){state.shipNicknames=state.shipNicknames&&typeof state.shipNicknames==='object'?state.shipNicknames:{};return state.shipNicknames}
  function editShipNickname(key){
    if(!SHIPS[key]||!state.ownedShips.includes(key))return;const nicknames=ensureShipNicknames(),current=nicknames[key]||'',message=isEnglish()?`Choose a nickname for ${SHIPS[key].name}. Leave it blank to remove the current nickname.`:`Escolha um apelido para a ${SHIPS[key].name}. Deixe em branco para remover o apelido atual.`,answer=prompt(message,current);if(answer===null)return;const nickname=answer.trim().replace(/\s+/g,' ').slice(0,24);if(nickname)nicknames[key]=nickname;else delete nicknames[key];save();renderGarage();toast(nickname?(isEnglish()?`Ship nickname saved: ${nickname}.`:`Apelido da nave salvo: ${nickname}.`):(isEnglish()?'Ship nickname removed.':'Apelido da nave removido.'))
  }
  const renderGarageBeforeNicknames=renderGarage;
  renderGarage=()=>{
    renderGarageBeforeNicknames();const nicknames=ensureShipNicknames();$$('#fleetGrid .fleet-card').forEach(card=>{const heading=card.querySelector('.fleet-title h2'),key=Object.keys(SHIPS).find(shipKey=>SHIPS[shipKey].name===heading?.textContent.trim());if(!key||!heading)return;card.dataset.shipKey=key;const title=heading.parentElement,nickname=nicknames[key]||'';title.querySelector('.ship-nickname')?.remove();title.querySelector('.ship-nickname-button')?.remove();const label=document.createElement('p');label.className='ship-nickname';label.textContent=nickname?`“${nickname}”`:(isEnglish()?'No nickname':'Sem apelido');heading.insertAdjacentElement('afterend',label);const button=document.createElement('button');button.type='button';button.className='secondary ship-nickname-button';button.dataset.nicknameShip=key;button.textContent=nickname?(isEnglish()?'Change nickname':'Alterar apelido'):(isEnglish()?'Add nickname':'Apelidar nave');button.onclick=()=>editShipNickname(key);title.appendChild(button)});
  };

  const sellShipBeforeNicknames=sellShip;
  sellShip=key=>{const owned=state.ownedShips.includes(key),result=sellShipBeforeNicknames(key);if(owned&&!state.ownedShips.includes(key)){ensureShipNicknames();delete state.shipNicknames[key];save()}return result};
  const buyShipBeforeNicknames=buyShip;
  buyShip=(key,tradeIn=false)=>{const previous=state.activeShip,result=buyShipBeforeNicknames(key,tradeIn);if(tradeIn&&!state.ownedShips.includes(previous)){ensureShipNicknames();delete state.shipNicknames[previous];save();renderGarage()}return result};

  document.addEventListener('click',event=>{const button=event.target.closest?.('[data-loan]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(button.disabled)return toast(isEnglish()?'This credit option is currently unavailable.':'Esta opção de crédito está indisponível no momento.');const amount=Number(button.dataset.loan);if(!Number.isFinite(amount)||amount<=0)return toast(isEnglish()?'Invalid credit amount.':'Valor de crédito inválido.');takeLoan(amount)},true);

  normalizeFinance();ensureShipNicknames();save();renderContracts();renderGarage();
})();
