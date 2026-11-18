import test from 'node:test';
import assert from 'node:assert/strict';
import {AXES,QUESTIONS,FOLLOWUP_QUESTIONS} from '../app/lib/bank-data.mjs';
import {getQuestionnaire,getFollowupQuestionnaire,scoreAssessment,getMethodology} from '../app/lib/instrument.mjs';
import {restoreHistory} from '../app/lib/history.mjs';

function slight(tied=[]) {
  const q=getQuestionnaire({mode:'full',seed:'exact50-regression'});
  const p={...q.answerTemplate,metadata:{model:'Synthetic exact-tie fixture'},answers:q.questions.map(q=>({id:q.id,value:4}))};
  for(const axis of AXES){
    if(tied.includes(axis.id)) continue;
    const item=QUESTIONS.find(q=>q.axis===axis.id);
    p.answers.find(a=>a.id===item.id).value=4+item.direction;
  }
  return p;
}
function legacyRound(round=1,axes=AXES.map(a=>a.id)) {
  return {version:'1.0.0',round,axes,answers:FOLLOWUP_QUESTIONS.filter(q=>q.round===round&&axes.includes(q.axis)).map(q=>({id:q.id,value:4}))};
}

test('near-50 old X axes now get letters and no fresh follow-up',()=>{
  const p=slight();
  const r=scoreAssessment(p);
  assert.equal(r.displayType,'INFP-T');assert.equal(r.scoringVersion,'1.2.0');
  assert.ok(r.axes.every(a=>a.rightPercent===51.39&&a.status==='clear'));
  assert.equal(r.followup.status,'resolved');assert.equal(r.followup.next,null);
  const one=scoreAssessment(slight(['AT']));
  assert.equal(one.displayType,'INFP-X');
  assert.deepEqual(one.followup.next.targetAxes,['AT']);
  assert.equal(one.followup.next.questions.length,4);
  assert.equal(one.followup.next.followupVersion,'1.1.0');
});

test('missing values have a distinct unknown marker and never a 50% X',()=>{
  const p=getQuestionnaire().answerTemplate;
  const r=scoreAssessment(p);
  assert.equal(r.displayType,'????-?');
  assert.ok(r.axes.every(a=>a.letter==='?'&&a.rightPercent===null));
  assert.equal(r.followup.status,'incomplete');assert.equal(r.followup.next,null);
  assert.deepEqual(getMethodology().deadband,{left:50,right:50,inclusive:true,letter:'X'});
});

test('legacy 40–60 follow-ups replay without losing answers but use current display and next rules',()=>{
  const p={...slight(['AT']),followups:[legacyRound()]};
  const r=scoreAssessment(p);
  assert.equal(r.displayType,'INFP-X');
  assert.equal(r.followups[0].version,'1.0.0');
  assert.deepEqual(r.followups[0].answers,p.followups[0].answers);
  assert.deepEqual(r.followup.next.targetAxes,['AT']);
  assert.equal(r.followup.next.round,2);
  assert.equal(r.followup.next.answerTemplate.followups[0].version,'1.0.0');
  assert.equal(r.followup.next.answerTemplate.followups[1].version,'1.1.0');
  const next=structuredClone(r.followup.next.answerTemplate);
  next.followups[1].answers=next.followups[1].answers.map(a=>({...a,value:4}));
  assert.equal(scoreAssessment(next).displayType,'INFP-X');
  assert.equal(scoreAssessment(next).followup.status,'limit');
  const allClear=scoreAssessment({...slight(),followups:[legacyRound(),legacyRound(2)]});
  assert.equal(allClear.displayType,'INFP-T');assert.equal(allClear.followup.next,null);
});

test('new rounds reject old interval targeting and legacy rounds still enforce their own targets',()=>{
  const p={...slight(['AT']),followups:[legacyRound()]};
  const newVersion=structuredClone(p);newVersion.followups[0].version='1.1.0';
  assert.throws(()=>scoreAssessment(newVersion),/axes|维度/);
  const missingAxis=structuredClone(p);missingAxis.followups[0].axes=['AT'];
  assert.throws(()=>scoreAssessment(missingAxis),/axes|维度/);
  const future=structuredClone(p);future.followups[0].version='9.0.0';
  assert.throws(()=>scoreAssessment(future),/版本/);
  const neutral=slight(AXES.map(a=>a.id));
  const mixed={...neutral,followups:[{...legacyRound(),version:'1.1.0'},legacyRound(2)]};
  assert.throws(()=>scoreAssessment(mixed),/旧版|倒退|顺序/);
});

test('resuming an incomplete old round keeps its original wider targets, version and answered values',()=>{
  const p={...slight(['AT']),followups:[legacyRound()]};
  p.followups[0].answers[0].value=null;
  p.followups[0].answers[1].value=6;
  const r=scoreAssessment(p);
  assert.equal(getFollowupQuestionnaire(r),null);
  const resumed=getFollowupQuestionnaire(r,{resumeCurrent:true});
  assert.ok(resumed);assert.equal(resumed.round,1);assert.equal(resumed.questions.length,20);
  assert.deepEqual(resumed.targetAxes,AXES.map(a=>a.id));
  assert.equal(resumed.followupVersion,'1.0.0');
  assert.equal(resumed.answerTemplate.followups.length,1);
  assert.deepEqual(resumed.answerTemplate.answers,r.answers);
  const answers=new Map(resumed.answerTemplate.followups[0].answers.map(a=>[a.id,a.value]));
  for(const a of r.followups[0].answers) assert.equal(answers.get(a.id),a.value);
  assert.deepEqual(getFollowupQuestionnaire(r,{resumeCurrent:true}).questions,resumed.questions);
  resumed.answerTemplate.followups[0].answers=resumed.answerTemplate.followups[0].answers.map(a=>({...a,value:a.value??4}));
  assert.equal(scoreAssessment(resumed.answerTemplate).complete,true);
  assert.equal(getFollowupQuestionnaire(scoreAssessment(resumed.answerTemplate),{resumeCurrent:true}),null);
});

test('history migration recalculates old X letters while preserving experiment identity and response data',()=>{
  const old={...slight(['AT']),id:'old-result',createdAt:'2026-11-17T10:00:00.000Z',scoringVersion:'1.1.0',displayType:'XXXX-X',followups:[legacyRound()]};
  const restored=restoreHistory([old])[0];
  assert.equal(restored.id,old.id);assert.equal(restored.createdAt,old.createdAt);
  assert.equal(restored.scoringVersion,'1.2.0');assert.equal(restored.displayType,'INFP-X');
  assert.deepEqual(restored.answers,old.answers);assert.deepEqual(restored.followups,old.followups);
  assert.deepEqual(getFollowupQuestionnaire(restored),restored.followup.next);
});
