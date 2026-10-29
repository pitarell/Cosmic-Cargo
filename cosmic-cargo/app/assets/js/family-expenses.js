"use strict";

(()=>{
  const WEEK=7*86400000;
  const FAMILY_COSTS={
    'pt-BR':{
      1:{health:0,education:0},
      2:{health:40,education:60},
      3:{health:65,education:95},
      4:{health:100,education:145},
      5:{health:150,education:220}
    },
    'en-US':{
      1:{health:55,education:0},
      2:{health:70,education:0},
      3:{health:90,education:0},
      4:{health:115,education:0},
      5:{health:145,education:0}
    }
  };
  const english=()=>GAME_LANGUAGE==='en-US';
  const money=value=>`${Math.round(value||0).toLocaleString(english()?'en-US':'pt-BR')} CR`;

  function highestOwnedTier(){
    return Math.max(1,...(state.ownedShips||[]).map(key=>SHIPS[key]?.tier||1));
  }

  function ensureFamilyExpenses(now=Date.now()){
    if(!state.familyExpenses||typeof state.familyExpenses!=='object'){
      state.familyExpenses={startedAt:now,nextChargeAt:now+WEEK,history:[]};
    }
    if(!Number.isFinite(state.familyExpenses.nextChargeAt))state.familyExpenses.nextChargeAt=now+WEEK;
    if(!Array.isArray(state.familyExpenses.history))state.familyExpenses.history=[];
  }

  function processFamilyExpenses(now=Date.now()){
    if(!state.careerStarted)return 0;
    ensureFamilyExpenses(now);
    let charged=0,guard=0;
    while(state.familyExpenses.nextChargeAt<=now&&guard++<520){
      const dueAt=state.familyExpenses.nextChargeAt,tier=highestOwnedTier(),cost=FAMILY_COSTS[GAME_LANGUAGE]?.[tier]||FAMILY_COSTS['pt-BR'][tier],health=cost.health,education=cost.education,total=health+education;
      if(total>0){
        state.credits-=total;
        charged+=total;
        state.familyExpenses.history.unshift({dueAt,tier,health,education,total});
        if(typeof addFinance==='function')addFinance({
          kind:'family_expenses',time:dueAt,
          title:english()?'Weekly family expenses':'Despesas familiares semanais',
          detail:`${english()?'Family health plan':'Plano de saúde familiar'} ${money(health)} · ${english()?'Public education for two children':'Educação de dois filhos'} ${education?money(education):(english()?'public · no tuition':'pública · sem mensalidade')} · ${english()?'fleet class':'categoria da frota'} ${tier}`,
          expenses:total,net:-total
        });
      }
      state.familyExpenses.nextChargeAt=dueAt+WEEK;
    }
    state.familyExpenses.history=state.familyExpenses.history.slice(0,12);
    if(charged){save();updateHeader()}
    return charged;
  }

  const processAFKBeforeFamilyExpenses=processAFK;
  processAFK=(forceRender=false)=>{
    const charged=processFamilyExpenses();
    return processAFKBeforeFamilyExpenses(forceRender||charged>0);
  };

  ensureFamilyExpenses();
  processFamilyExpenses();
  save();
  setInterval(processFamilyExpenses,60000);
})();
