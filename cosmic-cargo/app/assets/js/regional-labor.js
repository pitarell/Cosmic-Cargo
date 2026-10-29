"use strict";
(()=>{
  const TERMS={
    'pt-BR':{salary:{1:60,2:90,3:130},commission:{1:.04,2:.06,3:.08},managerHire:{'manager-1':720,'manager-2':1040,'manager-3':1520},managerSalary:{'manager-1':180,'manager-2':260,'manager-3':380}},
    'en-US':{salary:{1:115,2:170,3:250},commission:{1:.03,2:.05,3:.07},managerHire:{'manager-1':1400,'manager-2':2000,'manager-3':3000},managerSalary:{'manager-1':350,'manager-2':500,'manager-3':750}}
  };
  const terms=()=>TERMS[GAME_LANGUAGE]||TERMS['pt-BR'],english=()=>GAME_LANGUAGE==='en-US',locale=()=>english()?'en-US':'pt-BR',money=value=>`${Math.round(value||0).toLocaleString(locale())} CR`;
  globalThis.staffWeeklySalary=e=>Math.round((terms().salary[e?.level]||terms().salary[1])*(e?.hireMod||1)/5)*5;
  globalThis.managerWeeklySalary=m=>Math.round((terms().managerSalary[m?.id]||terms().managerSalary['manager-1'])/5)*5;
  staffHireCost=e=>Math.round(staffWeeklySalary(e)*4/10)*10;
  const staffStatsBeforeRegionalLabor=staffStats;
  staffStats=e=>{const stats=staffStatsBeforeRegionalLabor(e),skills=e.skills||{},base=terms().commission[e.level]||terms().commission[1];stats.commission=Math.max(.01,base+(e.commissionMod||0)-Math.min(.012,(skills.economy||0)*.003)+(e.commissionBonus||0));return stats};
  leaveCost=(e,type)=>{if(!e||!LABOR_POLICY.paidLeave)return 0;const weekly=staffWeeklySalary(e),gross=type==='vacation'?weekly*(30/7)*(4/3):weekly/5,discount=typeof managerLeaveDiscount==='function'?managerLeaveDiscount():0;return Math.round(gross*(1-discount)/5)*5};
  globalThis.managerLeaveCost=(m,type)=>{if(!m||!LABOR_POLICY.paidLeave)return 0;const weekly=managerWeeklySalary(m),gross=type==='vacation'?weekly*(30/7)*(4/3):weekly/5;return Math.round(gross/5)*5};
  severanceCost=e=>{if(!e||!LABOR_POLICY.severance)return 0;const notice=staffWeeklySalary(e)*(30/7),fgtsPenalty=(Number(e.totalSalaryPaid)||0)*.032,training=(Number(e.trainingSpent)||0)*.7;return Math.round((notice+fgtsPenalty+training)/10)*10};
  managerSeveranceCost=()=>{const m=normalizeManager(state.afk?.manager);if(!m||!LABOR_POLICY.severance)return 0;const notice=managerWeeklySalary(m)*(30/7),fgtsPenalty=(Number(m.totalSalaryPaid)||0)*.032,training=Object.entries(m.skills||{}).reduce((sum,[skill,level])=>{for(let index=0;index<level;index++)sum+=Math.round(m.hireCost*[.16,.24,.36,.52][index]/50)*50;return sum},0);return Math.round((notice+fgtsPenalty+training*.6)/10)*10};
  MANAGER_CANDIDATES.forEach(manager=>{manager.cost=terms().managerHire[manager.id]||manager.cost;manager.baseCost=manager.cost});
  ensureAdvancedAFK();
  state.afk.managerCandidates.forEach(manager=>{const cost=terms().managerHire[manager.id];if(cost){manager.cost=cost;manager.baseCost=cost}});
  state.afk.employees.forEach(employee=>{employee.totalSalaryPaid=Number(employee.totalSalaryPaid)||0});
  if(state.afk.manager)state.afk.manager.totalSalaryPaid=Number(state.afk.manager.totalSalaryPaid)||0;
  const giveStaffLeaveBeforeRegionalLabor=giveStaffLeave;
  giveStaffLeave=(id,type,automatic=false)=>{const employee=state.afk?.employees?.find(item=>item.id===id),before=state.credits,result=giveStaffLeaveBeforeRegionalLabor(id,type,automatic),spent=Math.max(0,before-state.credits);if(employee&&spent&&typeof addFinance==='function')addFinance({kind:'staff_leave',title:type==='vacation'?(english()?'Paid vacation':'Férias remuneradas'):(english()?'Paid day off':'Folga remunerada'),detail:`${employee.name} · ${type==='vacation'?'30 dias':'24h'} · ${money(spent)}`,expenses:spent,net:-spent});return result};
  const hireEmployeeBeforeRegionalLabor=hireEmployee;
  hireEmployee=id=>{const candidate=state.afk?.candidates?.find(item=>item.id===id),before=state.credits,result=hireEmployeeBeforeRegionalLabor(id),spent=Math.max(0,before-state.credits),hired=candidate&&state.afk?.employees?.some(item=>item.id===id);if(hired&&spent&&typeof addFinance==='function')addFinance({kind:'staff_hiring',title:(english()?'Employee onboarding · ':'Integração de funcionário · ')+candidate.name,detail:`${english()?'Recruitment and four weeks of onboarding reference':'Recrutamento e referência de quatro semanas de integração'} · ${money(spent)}`,expenses:spent,net:-spent});return result};
  const removeEmployeeBeforeRegionalLabor=removeEmployee;
  removeEmployee=(id,voluntary=false)=>{const employee=state.afk?.employees?.find(item=>item.id===id),before=state.credits,result=removeEmployeeBeforeRegionalLabor(id,voluntary),spent=Math.max(0,before-state.credits),removed=employee&&!state.afk?.employees?.some(item=>item.id===id);if(removed&&spent&&typeof addFinance==='function')addFinance({kind:'staff_severance',title:(english()?'Employee severance · ':'Rescisão de funcionário · ')+employee.name,detail:`${english()?'Notice, FGTS-equivalent penalty and training compensation':'Aviso, multa equivalente de FGTS e compensação de treinamento'} · ${money(spent)}`,expenses:spent,net:-spent});return result};
  const hireManagerBeforeRegionalLabor=hireManager;
  hireManager=id=>{const candidate=state.afk?.managerCandidates?.find(item=>item.id===id),before=state.credits,result=hireManagerBeforeRegionalLabor(id),manager=state.afk?.manager,spent=Math.max(0,before-state.credits);if(manager&&manager.id===id){manager.mood=Number.isFinite(manager.mood)?manager.mood:100;manager.totalSalaryPaid=Number(manager.totalSalaryPaid)||0;manager.awayUntil=Number(manager.awayUntil)||0;manager.leaveStart=Number(manager.leaveStart)||0;manager.lastMoodCalendarDay=Number(manager.lastMoodCalendarDay)||Date.now();if(spent&&typeof addFinance==='function')addFinance({kind:'manager_hiring',title:(english()?'Manager onboarding · ':'Contratação de gerente · ')+(candidate?.name||manager.name),detail:`${english()?'Recruitment and four weeks of salary reference':'Recrutamento e referência de quatro semanas de salário'} · ${money(spent)}`,expenses:spent,net:-spent});save()}return result};
  save();
})();
