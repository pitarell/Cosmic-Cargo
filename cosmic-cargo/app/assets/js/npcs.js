"use strict";
(()=>{
  const english=()=>GAME_LANGUAGE==='en-US';
  const portrait=slot=>`<span class="npc-portrait npc-slot-${slot}" aria-hidden="true"></span>`;
  const FEMALE_STAFF_NAMES=new Set(['lia','maya','amina','yara','iris','samira','nadia','nyx','selene','zahra','mei','alana','cecilia','elisa','giovana','inara','kiara','maira','olivia','raquel','valentina','akira','bianca','dalila','farah','hana','larissa','nina','paola','sofia','helena','mina']);
  const MALE_STAFF_NAMES=new Set(['bento','icaro','teo','caio','davi','leon','orion','ravi','noa','gael','dante','bruno','diego','felix','hugo','jonas','luan','nicolas','pablo','saulo','william','ciro','enzo','gustavo','julio','malik','otavio','renan','omar','mateo']);
  const normalizeName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const EAST_ASIAN_SURNAMES=new Set(['chen','kwon','matsuda','nakamura','sato','tanaka','ueda','yamamoto','hoshino']);
  const MIDDLE_SOUTH_ASIAN_SURNAMES=new Set(['haddad','kaur','nadir','qadir']);
  const AFRICAN_SURNAMES=new Set(['adebayo','okafor']);
  const LATIN_SURNAMES=new Set(['almeida','arantes','borges','costa','dominguez','espinosa','farias','freitas','gomes','lima','moura','navarro','oliveira','pereira','reyes','silva','tavares','torres','vasquez','xavier']);
  const portraitVariant=(name,slots)=>{
    const hash=[...normalizeName(name)].reduce((total,char)=>((total*31)+char.charCodeAt(0))>>>0,0);
    return slots[hash%slots.length];
  };
  const genderSlot=name=>{
    const parts=normalizeName(name).trim().split(/\s+/),first=parts[0],surname=parts.at(-1),female=FEMALE_STAFF_NAMES.has(first)||(!MALE_STAFF_NAMES.has(first)&&/[aei]$/.test(first));
    if(first==='amina')return'arab-female';
    if(surname==='kaur'&&!female)return'south-asian-male';
    if(surname==='adebayo'&&!female)return'west-african-male';
    if(EAST_ASIAN_SURNAMES.has(surname))return female?8:'east-asian-male';
    if(MIDDLE_SOUTH_ASIAN_SURNAMES.has(surname))return female?9:10;
    if(AFRICAN_SURNAMES.has(surname))return portraitVariant(name,female?[4,6]:[10]);
    if(LATIN_SURNAMES.has(surname))return portraitVariant(name,female?[2,6,11]:[5,10]);
    return portraitVariant(name,female?[0,4,11]:[3,5,7]);
  };
  function speechCard(slot,name,role,text,extraClass=''){
    return`<section class="npc-speech-card ${extraClass}">${portrait(slot)}<div class="npc-speech"><small>${role}</small><h3>${name}</h3><p>${text}</p></div></section>`;
  }
  function correctDestinationLockReasons(){
    $$('#destinationFilter [data-dest].destination-locked').forEach(button=>{
      const destination=button.dataset.dest;if(!destination||destination==='Lua')return;if(destination==='Todos'){const reason=english()?'Complete the fifth Moon transport to enable the full destination list.':'Conclua o quinto transporte lunar para habilitar a lista completa de destinos.';button.title=reason;button.setAttribute('aria-label',`${destination}: ${reason}`);return}
      const tier=DESTINATIONS[destination]?.requiredTier||1,initial=(state.landings||0)<5;
      const reason=initial?(tier>1?(english()?`Complete the fifth Moon transport, then purchase a class ${tier} ship.`:`Conclua o quinto transporte lunar e depois compre uma nave de categoria ${tier}.`):(english()?'Complete the fifth Moon transport to unlock this destination.':'Conclua o quinto transporte lunar para liberar este destino.')):(english()?`Purchase a class ${tier} ship to unlock this destination.`:`Compre uma nave de categoria ${tier} para liberar este destino.`);
      button.title=reason;button.setAttribute('aria-label',`${destination}: ${reason}`);
    });
  }
  const renderContractsBeforeNPC=renderContracts;
  renderContracts=()=>{renderContractsBeforeNPC();correctDestinationLockReasons();if($('#humanitarianScheduleNotice'))setTimeout(showHumanitarianBenefactor,220)};

  function showHumanitarianBenefactor(){
    state.npcEvents=state.npcEvents||{};if(state.npcEvents.humanitarianBenefactorSeen)return;
    state.npcEvents.humanitarianBenefactorSeen=true;save();$('#humanitarianBenefactorDialog')?.remove();
    const overlay=document.createElement('div');overlay.id='humanitarianBenefactorDialog';overlay.className='humanitarian-benefactor-overlay';overlay.innerHTML=`<div class="humanitarian-benefactor-dialog" role="dialog" aria-modal="true" aria-labelledby="humanitarianBenefactorTitle"><img src="assets/images/npcs/dr-elias-amari.png" alt="${english()?'Dr. Elias Amari, humanitarian transport benefactor':'Dr. Elias Amari, benfeitor do transporte humanitário'}"><div class="humanitarian-benefactor-copy"><small>${english()?'HUMANITARIAN TRANSPORT NETWORK':'REDE DE TRANSPORTE HUMANITÁRIO'}</small><h2 id="humanitarianBenefactorTitle">Dr. Elias Amari</h2><div class="humanitarian-benefactor-bubble"><p>${english()?'Pilot, I finance emergency logistics where credits cannot measure what is at stake. Humanitarian cargo pays no freight, but every delivery keeps a colony alive and strengthens its future.':'Piloto, eu financio a logística de emergência onde os créditos não conseguem medir o que está em jogo. A carga humanitária não paga frete, mas cada entrega mantém uma colônia viva e fortalece seu futuro.'}</p><p>${english()?'The shipment still has a hidden replacement value. Protect it: damage generates a penalty even when the mission itself brings no profit.':'A encomenda ainda possui um valor oculto de reposição. Proteja-a: danos geram multa mesmo quando a missão não oferece lucro.'}</p></div><button class="primary">${english()?'I will deliver it':'Eu farei a entrega'}</button></div></div>`;document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('visible'));overlay.querySelector('button').onclick=()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),180)};
  }
  const toggleContractBeforeBenefactor=toggleContract;
  toggleContract=id=>{const emergencyBefore=acceptedCargo().some(item=>item.emergency),result=toggleContractBeforeBenefactor(id),emergencyAfter=acceptedCargo().some(item=>item.emergency);if(!emergencyBefore&&emergencyAfter)setTimeout(showHumanitarianBenefactor,180);return result};

  function workshopTutorialState(){state.npcEvents=state.npcEvents||{};const progress=state.npcEvents.workshopTutorial=state.npcEvents.workshopTutorial||{introduced:false,selected:false,completed:false,accessoriesExplained:false};if(typeof progress.accessoriesExplained!=='boolean')progress.accessoriesExplained=false;return progress}
  function mechanicPortrait(){return`<span class="npc-portrait npc-slot-1 mechanic-tutorial-portrait" aria-hidden="true"></span>`}
  function showWorkshopIntroduction(){
    const progress=workshopTutorialState();if(progress.introduced||progress.completed||(state.landings||0)<3)return;progress.introduced=true;progress.accessoriesExplained=true;save();
    $('#mechanicWorkshopTutorial')?.remove();const overlay=document.createElement('div');overlay.id='mechanicWorkshopTutorial';overlay.className='mechanic-workshop-overlay';overlay.innerHTML=`<div class="mechanic-workshop-dialog" role="dialog" aria-modal="true" aria-labelledby="mechanicWorkshopTitle">${mechanicPortrait()}<div><small>${english()?'HANGAR MECHANIC':'MECÂNICO DO HANGAR'}</small><h2 id="mechanicWorkshopTitle">Bernardo Hook</h2><div class="mechanic-workshop-bubble"><p>${english()?'Welcome to the Workshop. Here you can repair hull damage, monitor component wear, schedule preventive maintenance and improve the active ship.':'Bem-vindo à Oficina. Aqui você pode consertar danos no casco, acompanhar o desgaste dos componentes, programar manutenção preventiva e melhorar a nave ativa.'}</p><p>${english()?'Accessories unlock specialized cargo: refrigeration for temperature-controlled loads, a life-support pod for living cargo, radiation shielding for radioactive materials, and a diplomatic vault for level 5 secret cargo. Each accessory is installed only on the selected ship; humanitarian cargo never requires one.':'Os acessórios liberam cargas especializadas: refrigeração para cargas com temperatura controlada, pod de manutenção de vida para cargas vivas, blindagem contra radiação para materiais radioativos e cofre diplomático para cargas secretas de nível 5. Cada acessório é instalado somente na nave selecionada; cargas humanitárias nunca exigem acessórios.'}</p><p>${english()?'For your first purchase, choose an available upgrade. It will enter the purchase record without being applied immediately. Then close the purchase and approve the itemized invoice, including tax.':'Na primeira compra, escolha uma melhoria disponível. Ela entrará no registro de compras sem ser aplicada imediatamente. Depois, feche a compra e aprove a nota fiscal discriminada, incluindo o imposto.'}</p></div><button class="primary">${english()?'Show upgrades and accessories':'Mostrar melhorias e acessórios'}</button></div></div>`;document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('visible'));overlay.querySelector('button').onclick=()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),180);setTimeout(renderWorkshopPurchaseGuide,220)};
  }
  function showWorkshopAccessoryExplanation(){
    const progress=workshopTutorialState();if(progress.accessoriesExplained)return;progress.accessoriesExplained=true;save();$('#mechanicWorkshopTutorial')?.remove();const overlay=document.createElement('div');overlay.id='mechanicWorkshopTutorial';overlay.className='mechanic-workshop-overlay';overlay.innerHTML=`<div class="mechanic-workshop-dialog" role="dialog" aria-modal="true" aria-labelledby="mechanicWorkshopTitle">${mechanicPortrait()}<div><small>${english()?'HANGAR MECHANIC':'MECÂNICO DO HANGAR'}</small><h2 id="mechanicWorkshopTitle">Bernardo Hook</h2><div class="mechanic-workshop-bubble"><p>${english()?'We install four specialized accessories: refrigeration, a life-support pod, radiation shielding and a diplomatic vault. The vault is required for secret cargo, available only in level 5 Diplomatic contracts.':'Instalamos quatro acessórios especializados: refrigeração, pod de manutenção de vida, blindagem contra radiação e cofre diplomático. O cofre é obrigatório para cargas secretas, disponíveis somente nos contratos de nível 5 Diplomática.'}</p><p>${english()?'The equipment belongs only to the ship where it was installed. Contracts requiring a missing accessory remain blocked, while humanitarian cargo always remains normal and never requires equipment.':'O equipamento pertence somente à nave em que foi instalado. Contratos que exigem um acessório ausente ficam bloqueados, enquanto cargas humanitárias são sempre normais e nunca exigem equipamentos.'}</p></div><button class="primary">${english()?'View accessories':'Ver acessórios'}</button></div></div>`;document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('visible'));overlay.querySelector('button').onclick=()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),180);setTimeout(()=>$('#accessoryShop')?.scrollIntoView({behavior:'smooth',block:'center'}),220)};
  }
  function renderWorkshopPurchaseGuide(){
    const progress=workshopTutorialState();$('#workshopPurchaseGuide')?.remove();$$('#workshop .workshop-tutorial-target').forEach(element=>element.classList.remove('workshop-tutorial-target'));if(!progress.introduced||progress.completed)return;
    const target=progress.selected?$('#finalizeUpgradePurchase'):[...$$('#upgradeShop [data-upgrade]')].find(button=>!button.disabled&&!button.classList.contains('unaffordable'));
    const shop=progress.selected?$('#upgradeCart'):$('#upgradeShop');if(!shop)return;shop.insertAdjacentHTML('beforebegin',`<section id="workshopPurchaseGuide" class="npc-speech-card mechanic-purchase-guide">${mechanicPortrait()}<div class="npc-speech"><small>${english()?'FIRST PURCHASE TUTORIAL':'TUTORIAL DA PRIMEIRA COMPRA'}</small><h3>Bernardo Hook</h3><p>${progress.selected?(english()?'The improvement is recorded. Review the price, tax and total, then close the purchase to generate the invoice.':'A melhoria está registrada. Confira preço, imposto e total e depois feche a compra para gerar a nota fiscal.'):(english()?'Choose one highlighted improvement. Nothing is charged until you close the purchase.':'Escolha uma melhoria destacada. Nenhum valor será cobrado até você fechar a compra.')}</p></div></section>`);if(target){target.classList.add('workshop-tutorial-target');target.scrollIntoView({behavior:'smooth',block:'center'})}
  }
  const navBeforeWorkshopNPC=nav;
  nav=view=>{const result=navBeforeWorkshopNPC(view);if(view==='workshop'&&(state.landings||0)>=3){setTimeout(()=>{const progress=workshopTutorialState();if(!progress.introduced)showWorkshopIntroduction();else if(!progress.accessoriesExplained)showWorkshopAccessoryExplanation();else renderWorkshopPurchaseGuide()},120)}return result};
  const buyUpgradeBeforeWorkshopNPC=buyUpgrade;
  buyUpgrade=key=>{const before=(typeof pendingUpgrades!=='undefined'?pendingUpgrades.items.length:0),result=buyUpgradeBeforeWorkshopNPC(key),after=(typeof pendingUpgrades!=='undefined'?pendingUpgrades.items.length:0),progress=workshopTutorialState();if(progress.introduced&&!progress.completed&&after>before){progress.selected=true;save();setTimeout(renderWorkshopPurchaseGuide,80)}return result};
  const finalizeUpgradePurchaseBeforeWorkshopNPC=finalizeUpgradePurchase;
  finalizeUpgradePurchase=()=>{const progress=workshopTutorialState(),guided=progress.introduced&&!progress.completed&&progress.selected,result=finalizeUpgradePurchaseBeforeWorkshopNPC();if(guided)setTimeout(()=>{const modal=$('#shipPurchaseModal'),content=$('#shipPurchaseContent'),button=$('#closeUpgradeInvoice');if(!modal||modal.classList.contains('hidden')||!content||!button)return;content.insertAdjacentHTML('afterbegin',`<section class="npc-speech-card mechanic-invoice-guide">${mechanicPortrait()}<div class="npc-speech"><small>${english()?'INVOICE APPROVAL':'APROVAÇÃO DA NOTA FISCAL'}</small><h3>Bernardo Hook</h3><p>${english()?'Check the selected improvement, subtotal, workshop tax and total paid. Approving this invoice completes your first guided purchase.':'Confira a melhoria selecionada, o subtotal, o imposto da oficina e o total pago. Aprovar esta nota conclui sua primeira compra orientada.'}</p></div></section>`);button.textContent=english()?'Approve invoice and continue':'Aprovar nota fiscal e continuar';button.classList.add('workshop-tutorial-target');button.onclick=()=>{modal.classList.add('hidden');progress.completed=true;save();$('#workshopPurchaseGuide')?.remove();toast(english()?'First Workshop purchase completed.':'Primeira compra na Oficina concluída.')}},80);return result};
  window.addEventListener('cosmiccargo:workshop-accessory-selection',event=>{if(!event.detail?.selected)return;const progress=workshopTutorialState();if(progress.introduced&&!progress.completed){progress.selected=true;save();setTimeout(renderWorkshopPurchaseGuide,80)}});
  window.addEventListener('cosmiccargo:workshop-purchase-finalized',()=>{const progress=workshopTutorialState();if(!progress.introduced||progress.completed||!progress.selected)return;setTimeout(()=>{const modal=$('#shipPurchaseModal'),content=$('#shipPurchaseContent'),button=$('#closeUpgradeInvoice');if(!modal||modal.classList.contains('hidden')||!content||!button)return;content.insertAdjacentHTML('afterbegin',`<section class="npc-speech-card mechanic-invoice-guide">${mechanicPortrait()}<div class="npc-speech"><small>${english()?'UNIFIED INVOICE':'NOTA FISCAL UNIFICADA'}</small><h3>Bernardo Hook</h3><p>${english()?'Review the improvements, accessories, subtotal, taxes and total. This single invoice completes the Workshop purchase.':'Confira as melhorias, os acessórios, o subtotal, os impostos e o total. Esta nota única conclui a compra da Oficina.'}</p></div></section>`);button.textContent=english()?'Approve invoice and continue':'Aprovar nota fiscal e continuar';button.classList.add('workshop-tutorial-target');button.onclick=()=>{modal.classList.add('hidden');progress.completed=true;save();$('#workshopPurchaseGuide')?.remove();toast(english()?'First Workshop purchase completed.':'Primeira compra na Oficina concluída.')}},60)});
  function decorateTaxAgent(){
    const audit=$('#resultPanel .tax-audit');
    if(!audit||audit.querySelector('.npc-portrait'))return;
    audit.insertAdjacentHTML('afterbegin',speechCard(0,english()?'Inspector Vera Knox':'Fiscal Vera Knox',english()?'INTERPLANETARY REVENUE':'RECEITA INTERPLANETÁRIA',english()?'Your undeclared freight income was identified. The accumulated assessment must be settled before your operation can proceed.':'Identificamos receitas de frete não declaradas. A cobrança acumulada precisa ser quitada antes que sua operação possa prosseguir.','tax-agent-card'));
  }
  const pResultBeforeNPC=pResult;
  pResult=(...args)=>{pResultBeforeNPC(...args);decorateTaxAgent()};

  const renderCreditBeforeNPC=renderCreditPanel;
  renderCreditPanel=()=>{
    renderCreditBeforeNPC();
    const panel=$('#loanPanel');if(!panel)return;
    panel.querySelector('.banker-npc')?.remove();
    panel.insertAdjacentHTML('afterbegin',speechCard(2,english()?'Marina Vale':'Marina Vale',english()?'BUSINESS ACCOUNT MANAGER':'GERENTE DE CONTA EMPRESARIAL',state.afk?.loan?(english()?'I can help you monitor the balance and plan an early repayment with the available interest discount.':'Posso ajudar a acompanhar o saldo e planejar uma quitação antecipada com o desconto de juros disponível.'):(english()?'Choose credit only when the expected freight margin can absorb the automatic installments.':'Escolha o crédito apenas quando a margem prevista dos fretes puder absorver as parcelas automáticas.'),'banker-npc'));
  };

  function decoratePeople(){
    $$('#candidateGrid .staff-card,#crewGrid .staff-card').forEach(card=>{
      if(card.querySelector('.staff-portrait'))return;
      const name=card.querySelector('h2')?.textContent?.trim();if(!name)return;
      const visual=document.createElement('div');visual.className='staff-portrait';visual.innerHTML=portrait(genderSlot(name));card.prepend(visual);
    });
    $$('#managerPanel .manager-card').forEach(card=>{
      if(card.querySelector('.staff-portrait'))return;
      const name=card.querySelector('h3')?.textContent?.trim();if(!name)return;
      const visual=document.createElement('div');visual.className='staff-portrait manager-portrait';visual.innerHTML=portrait(genderSlot(name));card.prepend(visual);
    });
  }
  const renderAFKBeforeNPC=renderAFK;
  renderAFK=()=>{renderAFKBeforeNPC();decoratePeople()};

  const repairNotices=new Set(JSON.parse(localStorage.getItem('cosmicCargoNpcRepairNotices')||'[]'));
  function persistRepairNotices(){localStorage.setItem('cosmicCargoNpcRepairNotices',JSON.stringify([...repairNotices].slice(-30)))}
  function showMechanicNotice(key,endedAt){
    const noticeId=`${key}-${endedAt}`;if(repairNotices.has(noticeId)||!SHIPS[key])return;
    repairNotices.add(noticeId);persistRepairNotices();
    $('#mechanicNpcNotice')?.remove();const notice=document.createElement('div');notice.id='mechanicNpcNotice';notice.className='npc-floating-notice mechanic-repair-complete';notice.innerHTML=`${portrait(1)}<div class="npc-speech"><small>${english()?'HANGAR MECHANIC':'MECÂNICO DO HANGAR'} · Bernardo Hook</small><h3>${english()?'Repair completed':'Conserto da nave finalizado'}</h3><p>${english()?`${SHIPS[key].name} is available again.`:`A ${SHIPS[key].name} está disponível novamente.`}</p><div class="npc-notice-actions"><button class="primary">${english()?'Open Hangar':'Abrir Hangar'}</button><button class="secondary npc-dismiss" aria-label="${english()?'Close':'Fechar'}">×</button></div></div>`;document.body.appendChild(notice);notice.querySelector('.primary').onclick=()=>{notice.remove();nav('hangar')};notice.querySelector('.npc-dismiss').onclick=()=>notice.remove();
  }
  function checkFinishedRepairs(snapshot){const completed=Array.isArray(state.completedRepairNotices)?[...state.completedRepairNotices]:[];Object.entries(snapshot||{}).forEach(([key,until])=>{if(Number(until)<=Date.now())completed.push({key,endedAt:Number(until)})});const unique=[...new Map(completed.map(item=>[`${item.key}-${item.endedAt}`,item])).values()];unique.forEach(item=>showMechanicNotice(item.key,Number(item.endedAt)));if(completed.length){state.completedRepairNotices=[];save()}}
  const renderGarageBeforeNPC=renderGarage;
  renderGarage=()=>{const repairSnapshot={...(state.shipUnavailableUntil||{})};renderGarageBeforeNPC();checkFinishedRepairs(repairSnapshot);if($('#workshop').classList.contains('active'))setTimeout(renderWorkshopPurchaseGuide,0)};
  setInterval(()=>checkFinishedRepairs(state.shipUnavailableUntil),15000);

  renderCreditPanel();renderAFK();decorateTaxAgent();correctDestinationLockReasons();checkFinishedRepairs(state.shipUnavailableUntil);if($('#humanitarianScheduleNotice'))setTimeout(showHumanitarianBenefactor,220);
})();
