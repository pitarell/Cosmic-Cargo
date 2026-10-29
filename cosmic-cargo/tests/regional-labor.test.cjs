"use strict";

const assert=require("assert"),fs=require("fs"),vm=require("vm"),base="outputs/cosmic-cargo/app/assets/js/";

function workingTimeContext(language){
  const employee={id:"e",level:1,routeDestination:"Rota",shift:"night",workHours:0,workHistory:[],restUntil:0,totalSalaryPaid:0};
  const hours=language==="pt-BR"?8.5:11;
  const context={globalThis:null,GAME_LANGUAGE:language,LABOR_POLICY:{benefitRate:language==="pt-BR"?.08:.25,employerCharge:language==="pt-BR"?.36:.08},AUTO_ROUTE_HOURS:{Rota:hours},state:{credits:10000,afk:{employees:[employee],journeys:[],log:[],manager:null}},staffStats:()=>({speed:1}),employeeCanDispatch:()=>true,predictedJourneyHours:()=>hours,dispatchAFK:(person,now)=>{context.state.afk.journeys.push({id:"j",employeeId:person.id,startedAt:now,endAt:now+hours*3600000,hours});return true},completeAFKJourney:(journey)=>{context.state.afk.log.push({id:journey.id});return true},staffWeeklySalary:()=>language==="pt-BR"?60:115,managerWeeklySalary:()=>language==="pt-BR"?180:350,managerLeaveCost:()=>0,managerAdmin(){},processAFK(){},renderAFK(){},save(){},weekendEnd:value=>value,formatAFKTime:String,formatDuration:String,addFinance(){},toast(){},Date,$$:()=>[],$:()=>null};
  context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync(base+"regional-working-time.js","utf8"),context);return{context,employee,hours};
}

for(const language of ["pt-BR","en-US"]){
  const {context,employee,hours}=workingTimeContext(language),now=Date.now();
  assert.equal(context.employeeCanDispatch(employee,now),true);
  assert.equal(context.dispatchAFK(employee,now),true);
  const journey=context.state.afk.journeys[0];
  assert.equal(journey.breakHours,language==="pt-BR"?1:.5);
  assert.equal(journey.laborOvertimeHours,language==="pt-BR"?.5:0);
  context.completeAFKJourney(journey,journey.endAt);
  assert.equal(Math.round((employee.restUntil-journey.endAt)/3600000),language==="pt-BR"?11:10);
  const extras=context.staffPayrollExtras(employee,journey.endAt+1);
  assert.equal(extras.overtimeHours,language==="pt-BR"?.5:0);
  employee.routeDestination="Longa";context.AUTO_ROUTE_HOURS.Longa=11.5;
  assert.equal(context.employeeCanDispatch(employee,employee.restUntil+1),false);
  assert.equal(context.LABOR_POLICY.nightBonus,0);
  assert.equal(hours,language==="pt-BR"?8.5:11);
  const manager={id:"manager-1",name:"Gerente",mood:40,hiredAt:now-1000,totalSalaryPaid:0,skills:{}};context.state.afk.manager=manager;context.managerLeaveCost=()=>language==="pt-BR"?20:0;context.giveManagerLeave("day");
  assert.equal(manager.mood,50);assert.equal(Math.round((manager.awayUntil-manager.leaveStart)/86400000),1);assert.equal(context.state.credits,language==="pt-BR"?9980:10000);
}

function laborTerms(language){
  const manager={id:"manager-1",name:"Gerente",skills:{},totalSalaryPaid:1000,hireCost:language==="pt-BR"?720:1400},candidates=[{id:"manager-1",cost:1},{id:"manager-2",cost:1},{id:"manager-3",cost:1}];
  const context={globalThis:null,GAME_LANGUAGE:language,LABOR_POLICY:language==="pt-BR"?{paidLeave:true,severance:true}:{paidLeave:false,severance:false},MANAGER_CANDIDATES:candidates,state:{credits:10000,afk:{employees:[],candidates:[],managerCandidates:candidates.map(item=>({...item})),manager}},staffHireCost(){},staffStats:()=>({commission:0}),leaveCost(){},severanceCost(){},managerLeaveDiscount:()=>0,managerSeveranceCost(){},normalizeManager:value=>value,ensureAdvancedAFK(){},giveStaffLeave(){},hireEmployee(){},removeEmployee(){},hireManager(){},addFinance(){},save(){}};
  context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync(base+"regional-labor.js","utf8"),context);return{context,manager};
}

const brazilTerms=laborTerms("pt-BR");
assert.equal(brazilTerms.context.managerWeeklySalary(brazilTerms.manager),180);assert.equal(brazilTerms.context.managerLeaveCost(brazilTerms.manager,"day"),35);assert.equal(brazilTerms.context.managerLeaveCost(brazilTerms.manager,"vacation"),1030);assert.equal(brazilTerms.context.managerSeveranceCost(),800);
const usaTerms=laborTerms("en-US");
assert.equal(usaTerms.context.managerWeeklySalary(usaTerms.manager),350);assert.equal(usaTerms.context.managerLeaveCost(usaTerms.manager,"day"),0);assert.equal(usaTerms.context.managerLeaveCost(usaTerms.manager,"vacation"),0);assert.equal(usaTerms.context.managerSeveranceCost(),0);

function payroll(language){
  const now=Date.now(),logs=[],employee={id:"e",name:"Piloto",nextWeeklyPayrollAt:now-1,totalSalaryPaid:0},manager={id:"manager-1",name:"Gerente",nextWeeklyPayrollAt:now-1,totalSalaryPaid:0},salary=language==="pt-BR"?60:115,managerSalary=language==="pt-BR"?180:350,policy=language==="pt-BR"?{employerCharge:.36,benefitRate:.08}:{employerCharge:.08,benefitRate:.25};
  const context={GAME_LANGUAGE:language,LABOR_POLICY:policy,state:{credits:2000,afk:{employees:[employee],manager,weeklyPayrollStartedAt:now-10000,weeklyPayrollHistory:[],totalNet:0}},ensureAdvancedAFK(){},staffWeeklySalary:()=>salary,managerWeeklySalary:()=>managerSalary,staffPayrollExtras:()=>({total:0}),save(){},updateHeader(){},addFinance:value=>logs.push(value),toast(){},hireEmployee(){},processAFK(){},renderAFK(){},economyPercent:value=>(value*100)+"%",$$:()=>[]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(base+"weekly-payroll.js","utf8"),context);return{context,employee,manager,logs};
}

const brazil=payroll("pt-BR");
assert.equal(2000-brazil.context.state.credits,345);
assert.equal(brazil.employee.totalSalaryPaid,60);
assert.equal(brazil.manager.totalSalaryPaid,180);
const usa=payroll("en-US");
assert.equal(2000-usa.context.state.credits,618);
assert.equal(usa.employee.totalSalaryPaid,115);
assert.equal(usa.manager.totalSalaryPaid,350);

console.log("Regional labor tests: OK");
