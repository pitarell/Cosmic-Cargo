"use strict";

(()=>{
  const DAY=86400000;
  const english=()=>GAME_LANGUAGE==='en-US';
  const locale=()=>english()?'en-US':'pt-BR';
  const money=value=>`${Math.round(value||0).toLocaleString(locale())} CR`;

  function nextFridayAfter(timestamp){
    const date=new Date(timestamp);
    date.setHours(0,0,0,0);
    let days=(5-date.getDay()+7)%7;
    if(days===0)days=7;
    date.setDate(date.getDate()+days);
    return date.getTime();
  }

  function ensureWeeklyPayroll(now=Date.now()){
    ensureAdvancedAFK();
    const operation=state.afk;
    if(!Number.isFinite(operation.weeklyPayrollStartedAt))operation.weeklyPayrollStartedAt=now;
    operation.weeklyPayrollHistory=Array.isArray(operation.weeklyPayrollHistory)?operation.weeklyPayrollHistory:[];
    operation.employees.forEach(employee=>{
      if(!Number.isFinite(employee.nextWeeklyPayrollAt)){
        const beginning=Math.max(Number(employee.hiredAt)||now,operation.weeklyPayrollStartedAt);
        employee.nextWeeklyPayrollAt=nextFridayAfter(beginning);
      }
    });
    const manager=operation.manager;
    if(manager&&!Number.isFinite(manager.nextWeeklyPayrollAt))manager.nextWeeklyPayrollAt=nextFridayAfter(Math.max(Number(manager.hiredAt)||now,operation.weeklyPayrollStartedAt));
  }

  function processWeeklyPayroll(now=Date.now()){
    ensureWeeklyPayroll(now);
    const operation=state.afk,charges=new Map();
    operation.employees.forEach(employee=>{
      let guard=0;
      while(employee.nextWeeklyPayrollAt<=now&&guard++<520){
        const dueAt=employee.nextWeeklyPayrollAt,cost=staffWeeklySalary(employee),extras=typeof staffPayrollExtras==='function'?staffPayrollExtras(employee,dueAt):{total:0};
        if(!charges.has(dueAt))charges.set(dueAt,[]);
        charges.get(dueAt).push({type:'employee',employeeId:employee.id,employee:employee.name,cost,extras});
        employee.nextWeeklyPayrollAt=nextFridayAfter(dueAt+DAY);
      }
    });
    const manager=operation.manager;
    if(manager){let guard=0;while(manager.nextWeeklyPayrollAt<=now&&guard++<520){const dueAt=manager.nextWeeklyPayrollAt,cost=managerWeeklySalary(manager);if(!charges.has(dueAt))charges.set(dueAt,[]);charges.get(dueAt).push({type:'manager',employeeId:manager.id,employee:manager.name,cost,extras:{total:0}});manager.nextWeeklyPayrollAt=nextFridayAfter(dueAt+DAY)}}
    if(!charges.size)return 0;
    let grandTotal=0;
    [...charges.entries()].sort((a,b)=>a[0]-b[0]).forEach(([dueAt,items])=>{
      const basePayroll=items.reduce((sum,item)=>sum+item.cost,0),premiumPay=items.reduce((sum,item)=>sum+(item.extras?.total||0),0),payroll=basePayroll+premiumPay;
      const laborCharge=Math.round(payroll*LABOR_POLICY.employerCharge),benefits=Math.round(basePayroll*LABOR_POLICY.benefitRate);
      const total=payroll+laborCharge+benefits;
      grandTotal+=total;
      state.credits-=total;
      operation.totalNet=(Number(operation.totalNet)||0)-total;
      items.forEach(item=>{const person=item.type==='manager'?operation.manager:operation.employees.find(employee=>employee.id===item.employeeId);if(person)person.totalSalaryPaid=(Number(person.totalSalaryPaid)||0)+item.cost+(item.extras?.total||0)});
      operation.weeklyPayrollHistory.unshift({dueAt,basePayroll,premiumPay,payroll,laborCharge,benefits,total,items});
      if(typeof addFinance==='function')addFinance({
        kind:'staff_payroll',time:dueAt,
        title:english()?'Weekly employee payroll':'Pagamento semanal dos funcionários',
        detail:items.map(item=>`${item.employee} · ${money(item.cost)}${item.extras?.total?` + ${english()?'labor premiums':'adicionais'} ${money(item.extras.total)}`:''}`).join(' · ')+` · ${english()?'employee benefits':'benefícios'} ${economyPercent(LABOR_POLICY.benefitRate)} · ${money(benefits)} · ${english()?'employer payroll charge':'encargos trabalhistas'} ${economyPercent(LABOR_POLICY.employerCharge)} · ${money(laborCharge)}`,
        expenses:total,net:-total
      });
    });
    operation.weeklyPayrollHistory=operation.weeklyPayrollHistory.slice(0,12);
    save();updateHeader();
    return grandTotal;
  }

  const hireEmployeeBeforePayroll=hireEmployee;
  hireEmployee=id=>{
    const previousIds=new Set((state.afk?.employees||[]).map(employee=>employee.id));
    const result=hireEmployeeBeforePayroll(id);
    ensureWeeklyPayroll();
    const employee=state.afk.employees.find(item=>!previousIds.has(item.id));
    if(employee){employee.nextWeeklyPayrollAt=nextFridayAfter(employee.hiredAt||Date.now());save()}
    return result;
  };

  const processAFKBeforePayroll=processAFK;
  processAFK=(forceRender=false)=>{
    const result=processAFKBeforePayroll(forceRender);
    const charged=processWeeklyPayroll();
    if(charged>0)renderAFK();
    if(charged>0)toast(english()?`Weekly payroll charged: ${money(charged)}.`:`Folha semanal cobrada: ${money(charged)}.`);
    return result;
  };

  const renderAFKBeforePayroll=renderAFK;
  renderAFK=()=>{
    ensureWeeklyPayroll();
    renderAFKBeforePayroll();
    const now=Date.now();
    $$('#crewGrid .staff-card.employed').forEach(card=>{
      const name=card.querySelector('h2')?.textContent;
      const employee=state.afk.employees.find(item=>item.name===name);
      if(!employee||card.querySelector('.weekly-payroll-info'))return;
      const date=new Date(employee.nextWeeklyPayrollAt).toLocaleString(locale(),{weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),payroll=staffWeeklySalary(employee),laborCharge=Math.round(payroll*LABOR_POLICY.employerCharge),benefits=Math.round(payroll*LABOR_POLICY.benefitRate);
      const anchor=card.querySelector('.staff-controls')||card.lastElementChild;
      anchor?.insertAdjacentHTML('beforebegin',`<p class="weekly-payroll-info"><small>${english()?'WEEKLY SALARY':'SALÁRIO SEMANAL'}</small><b>${money(payroll)}</b><span>${english()?'Benefits':'Benefícios'} ${economyPercent(LABOR_POLICY.benefitRate)}: ${money(benefits)} · ${english()?'employer charge':'encargos'} ${economyPercent(LABOR_POLICY.employerCharge)}: ${money(laborCharge)} · ${english()?'total':'total'} ${money(payroll+benefits+laborCharge)}</span><span>${english()?'Next payment':'Próximo pagamento'}: ${date}${employee.nextWeeklyPayrollAt<now?' · '+(english()?'processing':'processando'):''}</span></p>`);
      if(english()){
        const day=card.querySelector('[data-leave="day"]'),vacation=card.querySelector('[data-leave="vacation"]'),fire=card.querySelector('[data-fire]');
        if(day)day.textContent='Unpaid day off · 24h';
        if(vacation)vacation.textContent='Unpaid vacation · 30 days';
        if(fire)fire.textContent='Dismiss · no mandatory severance';
      }
    });
    $$('#candidateGrid .staff-card').forEach(card=>{
      const name=card.querySelector('h2')?.textContent;
      const candidate=state.afk.candidates.find(item=>item.name===name);
      if(!candidate||card.querySelector('.candidate-payroll-info'))return;
      const payroll=staffWeeklySalary(candidate),laborCharge=Math.round(payroll*LABOR_POLICY.employerCharge),benefits=Math.round(payroll*LABOR_POLICY.benefitRate),hire=staffHireCost(candidate);
      card.querySelector('[data-hire]')?.insertAdjacentHTML('beforebegin',`<small class="candidate-payroll-info">${english()?'Onboarding':'Contratação'}: <b>${money(hire)}</b> · ${english()?'weekly salary':'salário semanal'}: <b>${money(payroll)}</b> · ${english()?'benefits':'benefícios'} ${money(benefits)} · ${english()?'employer charge':'encargos'} ${money(laborCharge)}</small>`);
    });
    if(english()){
      const managerFire=$('#fireManager');
      if(managerFire)managerFire.textContent='Dismiss manager · no mandatory severance';
    }
  };

  ensureWeeklyPayroll();
  processWeeklyPayroll();
  save();
})();
