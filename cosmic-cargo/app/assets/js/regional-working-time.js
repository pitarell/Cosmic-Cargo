"use strict";

(()=>{
  const HOUR=3600000,DAY=24*HOUR;
  const RULES={
    'pt-BR':{regularDaily:8,maxDaily:10,dailyRest:11,weeklyMax:44,weeklyRest:35,breakAfter:6,breakHours:1,overtimeRate:.5,nightRate:.2,managerWeeklyMax:40},
    'en-US':{regularDaily:11,maxDaily:11,dailyRest:10,weeklyMax:60,weeklyRest:34,breakAfter:8,breakHours:.5,overtimeRate:0,nightRate:0,managerWeeklyMax:40}
  };
  const rule=()=>RULES[GAME_LANGUAGE]||RULES['pt-BR'],english=()=>GAME_LANGUAGE==='en-US',locale=()=>english()?'en-US':'pt-BR',money=value=>`${Math.round(value||0).toLocaleString(locale())} CR`;
  Object.assign(LABOR_POLICY,{...rule(),nightBonus:0});

  function mondayStart(timestamp){const date=new Date(timestamp),day=(date.getDay()+6)%7;date.setDate(date.getDate()-day);date.setHours(0,0,0,0);return date.getTime()}
  function historyWindowStart(timestamp){return english()?timestamp-7*DAY:mondayStart(timestamp)}
  function normalizeLabor(employee){employee.workHistory=Array.isArray(employee.workHistory)?employee.workHistory:[];employee.totalSalaryPaid=Number(employee.totalSalaryPaid)||0;return employee}
  function weeklyHours(employee,at){normalizeLabor(employee);const start=historyWindowStart(at);return employee.workHistory.filter(entry=>entry.endedAt>=start&&entry.endedAt<=at).reduce((sum,entry)=>sum+(Number(entry.hours)||0),0)}
  function routeHours(employee,destination){return(AUTO_ROUTE_HOURS[destination]||8)*staffStats(employee).speed}
  function rawJourneyHours(employee){return routeHours(employee,employee.routeDestination)}
  function routeBreak(hours){return hours>rule().breakAfter?rule().breakHours:0}
  function regularHoursAvailable(employee,at){const daily=Math.max(0,rule().regularDaily-(Number(employee.workHours)||0)),weekly=Math.max(0,rule().weeklyMax-weeklyHours(employee,at));return Math.min(daily,weekly)}

  state.afk?.employees?.forEach(employee=>{normalizeLabor(employee);if(employee.routeDestination&&routeHours(employee,employee.routeDestination)>rule().maxDaily)employee.routeDestination=''});
  const employeeCanDispatchBeforeRegionalHours=employeeCanDispatch;
  employeeCanDispatch=(employee,now)=>{
    normalizeLabor(employee);
    if(!employeeCanDispatchBeforeRegionalHours(employee,now))return false;
    const hours=rawJourneyHours(employee),daily=Number(employee.workHours)||0,weekly=weeklyHours(employee,now);
    return hours<=rule().maxDaily&&daily+hours<=rule().maxDaily&&weekly+hours<=rule().weeklyMax;
  };

  const predictedJourneyHoursBeforeRegionalHours=predictedJourneyHours;
  predictedJourneyHours=employee=>{const hours=predictedJourneyHoursBeforeRegionalHours(employee);return hours+routeBreak(hours)};

  const dispatchAFKBeforeRegionalHours=dispatchAFK;
  dispatchAFK=(employee,now=Date.now())=>{
    const beforeDaily=Number(employee.workHours)||0,beforeWeekly=weeklyHours(employee,now),started=dispatchAFKBeforeRegionalHours(employee,now);
    if(!started)return false;
    const journey=state.afk.journeys.find(item=>item.employeeId===employee.id&&item.startedAt===now);
    if(!journey)return true;
    const hours=Number(journey.hours)||0,breakHours=routeBreak(hours),regular=Math.max(0,Math.min(hours,rule().regularDaily-beforeDaily,rule().weeklyMax-beforeWeekly));
    journey.breakHours=breakHours;journey.endAt+=breakHours*HOUR;journey.laborOvertimeHours=english()?0:Math.max(0,hours-regular);journey.laborNightHours=employee.shift==='night'?hours:0;journey.overtimeHours=0;
    return true;
  };

  const completeAFKJourneyBeforeRegionalHours=completeAFKJourney;
  completeAFKJourney=(journey,now)=>{
    const employee=state.afk?.employees?.find(item=>item.id===journey.employeeId),result=completeAFKJourneyBeforeRegionalHours(journey,now);
    if(!employee)return result;
    normalizeLabor(employee);employee.workHistory.push({endedAt:now,hours:Number(journey.hours)||0,overtimeHours:Number(journey.laborOvertimeHours)||0,nightHours:Number(journey.laborNightHours)||0,laborPaid:false});employee.workHistory=employee.workHistory.filter(entry=>entry.endedAt>=now-45*DAY);
    employee.restUntil=now+rule().dailyRest*HOUR;employee.status='idle';
    const log=state.afk.log.find(item=>item.id===journey.id);if(log)Object.assign(log,{overtime:Number(journey.laborOvertimeHours)||0,breakHours:Number(journey.breakHours)||0,dailyRestHours:rule().dailyRest});
    return result;
  };

  globalThis.staffPayrollExtras=(employee,dueAt)=>{
    normalizeLabor(employee);const entries=employee.workHistory.filter(entry=>!entry.laborPaid&&entry.endedAt<=dueAt),hourly=staffWeeklySalary(employee)/(english()?40:44),overtimeHours=entries.reduce((sum,entry)=>sum+(Number(entry.overtimeHours)||0),0),nightHours=entries.reduce((sum,entry)=>sum+(Number(entry.nightHours)||0),0),overtimePay=Math.round(hourly*overtimeHours*(1+rule().overtimeRate)),nightPay=Math.round(hourly*nightHours*rule().nightRate);entries.forEach(entry=>entry.laborPaid=true);return{overtimeHours,nightHours,overtimePay,nightPay,total:overtimePay+nightPay}
  };

  function ensureManagerLabor(manager){if(!manager)return null;manager.mood=Number.isFinite(manager.mood)?manager.mood:100;manager.totalSalaryPaid=Number(manager.totalSalaryPaid)||0;manager.awayUntil=Number(manager.awayUntil)||0;manager.leaveStart=Number(manager.leaveStart)||0;manager.lastMoodCalendarDay=Number(manager.lastMoodCalendarDay)||Number(manager.hiredAt)||Date.now();return manager}
  function managerAvailable(manager,now=Date.now()){ensureManagerLabor(manager);const day=new Date(now).getDay();return manager.awayUntil<=now&&manager.leaveStart<=now&&day!==0&&day!==6}
  function processManagerMood(now=Date.now()){
    const manager=ensureManagerLabor(state.afk?.manager);if(!manager)return;
    const cursor=new Date(manager.lastMoodCalendarDay),today=new Date(now);cursor.setHours(0,0,0,0);today.setHours(0,0,0,0);
    for(let at=cursor.getTime();at<today.getTime();at+=DAY){const date=new Date(at),weekend=date.getDay()===0||date.getDay()===6;if(at<(manager.hiredAt||0))continue;if(weekend)manager.mood=Math.min(100,manager.mood+10);else if(!(manager.awayUntil>at))manager.mood=Math.max(0,manager.mood-3)}
    manager.lastMoodCalendarDay=now;
  }
  function managerStatus(manager,now=Date.now()){if(manager.leaveStart>now)return english()?`Scheduled leave · starts ${formatAFKTime(manager.leaveStart)}`:`Afastamento agendado · começa ${formatAFKTime(manager.leaveStart)}`;if(manager.awayUntil>now)return`${manager.awayType==='vacation'?(english()?'Vacation':'Férias'):(english()?'Day off':'Folga')} · ${english()?'remaining':'faltam'} ${formatDuration(manager.awayUntil-now)}`;const day=new Date(now).getDay();if(day===0||day===6)return`${english()?'Weekly rest':'Descanso semanal'} · ${rule().weeklyRest}h`;return english()?'Available · administrative shift 8h–16h':'Disponível · jornada administrativa 8h–16h'}
  globalThis.giveManagerLeave=(type)=>{
    const manager=ensureManagerLabor(state.afk?.manager);if(!manager)return;const cost=managerLeaveCost(manager,type);if(state.credits<cost)return toast(english()?'Insufficient credits for this leave.':'Créditos insuficientes para este afastamento.');let start=Math.max(Date.now(),manager.awayUntil||0);start=weekendEnd(start);const duration=type==='vacation'?30*DAY:DAY;state.credits-=cost;manager.leaveStart=start;manager.awayUntil=start+duration;manager.awayType=type;manager.mood=type==='vacation'?100:Math.min(100,manager.mood+10);if(cost&&typeof addFinance==='function')addFinance({kind:'manager_leave',title:type==='vacation'?(english()?'Manager vacation':'Férias do gerente'):(english()?'Manager day off':'Folga do gerente'),detail:`${manager.name} · ${type==='vacation'?'30 dias':'24h'} · ${money(cost)}`,expenses:cost,net:-cost});save();renderAFK()
  };

  const managerAdminBeforeRegionalHours=managerAdmin;
  managerAdmin=now=>{const manager=state.afk?.manager;if(!manager||!managerAvailable(manager,now))return;return managerAdminBeforeRegionalHours(now)};

  const processAFKBeforeRegionalHours=processAFK;
  processAFK=(forceRender=false)=>{processManagerMood();return processAFKBeforeRegionalHours(forceRender)};

  const renderAFKBeforeRegionalHours=renderAFK;
  renderAFK=()=>{
    renderAFKBeforeRegionalHours();const currentRule=rule(),policy=english()?`Up to ${currentRule.maxDaily}h driving · ${currentRule.dailyRest}h daily rest · ${currentRule.weeklyMax}h/7 days · ${currentRule.weeklyRest}h weekly reset`:`8h normais + até 2h extras · ${currentRule.dailyRest}h entre jornadas · ${currentRule.weeklyMax}h semanais · ${currentRule.weeklyRest}h de descanso semanal`;
    $$('#crewGrid .staff-card.employed').forEach(card=>{if(card.querySelector('.working-time-policy'))return;card.querySelector('.staff-state')?.insertAdjacentHTML('afterend',`<p class="working-time-policy"><small>${english()?'WORKING TIME':'JORNADA'}</small><span>${policy}</span></p>`)});
    $$('#crewGrid [data-assign-route]').forEach(select=>{const employee=state.afk.employees.find(item=>item.id===select.dataset.assignRoute);if(!employee)return;[...select.options].forEach(option=>{if(!option.value)return;const unavailable=routeHours(employee,option.value)>currentRule.maxDaily;option.disabled=unavailable;if(unavailable&&!option.textContent.includes(english()?'labor limit':'limite trabalhista'))option.textContent+=english()?' · labor limit':' · limite trabalhista'})});
    const manager=ensureManagerLabor(state.afk?.manager),card=$('#managerPanel .manager-employed');
    if(manager&&card){const salary=managerWeeklySalary(manager),benefits=Math.round(salary*LABOR_POLICY.benefitRate),charge=Math.round(salary*LABOR_POLICY.employerCharge),leave=managerLeaveCost(manager,'day'),vacation=managerLeaveCost(manager,'vacation');card.querySelector('.manager-labor')?.remove();card.querySelector('.staff-title')?.insertAdjacentHTML('afterend',`<section class="manager-labor"><p class="staff-state">${managerStatus(manager)}</p><div class="mood ${manager.mood<20?'critical':manager.mood<50?'warning':''}">${english()?'Mood':'Humor'}: ${Math.round(manager.mood)}/100</div><p><small>${english()?'ADMINISTRATIVE WORKWEEK':'JORNADA ADMINISTRATIVA'}</small><br>${english()?'40h weekly · 8h–16h · 10h minimum daily rest · 34h weekly rest':'40h semanais · 8h–16h · 11h entre jornadas · 35h de descanso semanal'}</p><p><small>${english()?'WEEKLY SALARY AND EMPLOYER COST':'SALÁRIO SEMANAL E CUSTO PATRONAL'}</small><br>${money(salary)} + ${english()?'benefits':'benefícios'} ${money(benefits)} + ${english()?'charges':'encargos'} ${money(charge)} = <b>${money(salary+benefits+charge)}</b></p><div class="staff-actions"><button class="secondary" data-manager-leave="day">${english()?'Day off':'Folga'} · 24h · ${money(leave)}</button><button class="secondary" data-manager-leave="vacation">${english()?'Vacation':'Férias'} · 30 ${english()?'days':'dias'} · ${money(vacation)}</button></div></section>`);$$('[data-manager-leave]').forEach(button=>button.onclick=()=>giveManagerLeave(button.dataset.managerLeave))}
    $$('#managerPanel .manager-card:not(.manager-employed)').forEach(card=>{if(card.querySelector('.manager-candidate-salary'))return;const name=card.querySelector('h3')?.textContent,candidate=state.afk?.managerCandidates?.find(item=>item.name===name);if(candidate)card.querySelector('button')?.insertAdjacentHTML('beforebegin',`<p class="manager-candidate-salary">${english()?'Weekly salary':'Salário semanal'}: <b>${money(managerWeeklySalary(candidate))}</b></p>`)})
  };

  processManagerMood();save();renderAFK();
})();
