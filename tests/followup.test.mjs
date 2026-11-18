import test from 'node:test';
import assert from 'node:assert/strict';
import {AXES, QUESTIONS, FOLLOWUP_QUESTIONS} from '../app/lib/bank-data.mjs';
import {getQuestionnaire, getFollowupQuestionnaire, scoreAssessment} from '../app/lib/instrument.mjs';
import {restoreHistory} from '../app/lib/history.mjs';
import {FOLLOWUP_QUESTIONS as SOURCE_FOLLOWUP_QUESTIONS} from '../app/lib/followup-bank.ts';
import {getFollowupQuestionnaire as downloadableNext,scoreAssessment as downloadableScore} from '../public/agent16.mjs';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

function base(mode='full', middle=['TF','AT']) {
  const q=getQuestionnaire({mode,seed:'followup-test'});
  return {...q.answerTemplate,metadata:{model:'Synthetic test fixture',systemPrompt:'Fixed test context'},answers:q.questions.map(({id})=>{
    const item=QUESTIONS.find(q=>q.id===id);
    const right=item.axis==='EI'||item.axis==='SN';
    return {id,value:middle.includes(item.axis)?4:4+item.direction*(right?3:-3)};
  })};
}
function answerNext(input, valueFor=(q)=>4) {
  const next=getFollowupQuestionnaire(input);
  assert.ok(next);
  const out=structuredClone(next.answerTemplate);
  out.followups.at(-1).answers=next.questions.map(q=>({id:q.id,value:valueFor(FOLLOWUP_QUESTIONS.find(x=>x.id===q.id))}));
  return out;
}

test('INXJ-X automatically offers eight fresh questions for TF and AT only',()=>{
  const first=scoreAssessment(base());
  assert.equal(first.displayType,'INXJ-X');
  assert.equal(first.followup.status,'available');
  assert.deepEqual(first.followup.targetAxes,['TF','AT']);
  const next=first.followup.next;
  assert.equal(next.kind,'followup');assert.equal(next.round,1);
  assert.equal(next.questions.length,8);
  assert.deepEqual(next.targetAxes,['TF','AT']);
  assert.ok(next.questions.every(q=>/^f\d{2}$/.test(q.id)));
  assert.deepEqual(Object.keys(next.questions[0]).sort(),['id','text']);
  assert.deepEqual(next.answerTemplate.answers,first.answers);
  assert.deepEqual(next.answerTemplate.origin,{id:first.id,createdAt:first.createdAt});
  assert.deepEqual(getFollowupQuestionnaire(first),next);
});

test('supplemental bank has two balanced fresh rounds per axis and reproducible order',()=>{
  assert.equal(FOLLOWUP_QUESTIONS.length,40);
  assert.equal(new Set(FOLLOWUP_QUESTIONS.map(q=>q.id)).size,40);
  for(const axis of AXES) for(const round of [1,2]) {
    const group=FOLLOWUP_QUESTIONS.filter(q=>q.axis===axis.id&&q.round===round);
    assert.equal(group.length,4);assert.equal(group.reduce((n,q)=>n+q.direction,0),0);
    assert.equal(new Set(group.map(q=>q.pair)).size,2);
    for(const pair of new Set(group.map(q=>q.pair))) {
      const items=group.filter(q=>q.pair===pair);
      assert.equal(items.length,2);assert.equal(items[0].direction,-items[1].direction);
    }
  }
  const p=base(),a=getFollowupQuestionnaire(p),b=getFollowupQuestionnaire(p);
  assert.deepEqual(a.questions,b.questions);
});

test('complete targeted followup pools answers, keeps clear axes unchanged and stops early',()=>{
  const initial=scoreAssessment(base());
  const input=answerNext(initial,q=>4+3*q.direction);
  const result=scoreAssessment(input);
  assert.equal(result.displayType,'INFJ-T');
  assert.equal(result.complete,true);assert.equal(result.answered,68);
  assert.equal(result.followup.status,'resolved');
  assert.equal(result.followup.next,null);assert.equal(getFollowupQuestionnaire(result),null);
  assert.equal(result.followup.roundsCompleted,1);
  assert.equal(result.axes[2].rightPercent,62.5);assert.equal(result.axes[2].total,16);
  for(const id of ['EI','SN','JP']) assert.deepEqual(result.axes.find(a=>a.id===id),initial.axes.find(a=>a.id===id));
  assert.equal(result.followup.baseline.displayType,'INXJ-X');
  assert.deepEqual(result.answers,initial.answers);
  assert.deepEqual(result.metadata,initial.metadata);
  assert.deepEqual(result.origin,{id:initial.id,createdAt:initial.createdAt});
  assert.notEqual(result.id,initial.id);
});

test('second round includes only remaining middle axes and stops honestly at two rounds',()=>{
  const one=scoreAssessment(answerNext(base(),q=>q.axis==='TF'?4+3*q.direction:4));
  assert.equal(one.displayType,'INFJ-X');
  assert.deepEqual(one.followup.next.targetAxes,['AT']);
  assert.equal(one.followup.next.questions.length,4);assert.equal(one.followup.next.round,2);
  const ids1=new Set(one.followups[0].answers.map(a=>a.id));
  assert.ok(one.followup.next.questions.every(q=>!ids1.has(q.id)));
  const two=scoreAssessment(answerNext(one));
  assert.equal(two.displayType,'INFJ-X');assert.equal(two.followup.status,'limit');
  assert.equal(two.followup.roundsCompleted,2);assert.equal(two.followup.next,null);
  assert.equal(two.axes[4].rightPercent,50);assert.equal(two.axes[4].total,20);
  assert.throws(()=>scoreAssessment({...two,followups:[...two.followups,two.followups[1]]}),/两轮|2/);
});

test('quick plus supplemental rounds remain valid and preserve the original form',()=>{
  const one=scoreAssessment(answerNext(base('quick'),q=>4+3*q.direction));
  assert.equal(one.mode,'quick');assert.equal(one.displayType,'INFJ-T');
  assert.equal(one.axes[2].rightPercent,75);assert.equal(one.axes[2].total,8);
  assert.equal(one.followup.baseline.total,20);
});

test('partial base or supplemental responses do not trigger another round or imply clarity',()=>{
  const partialBase=base();partialBase.answers[0].value=null;
  const b=scoreAssessment(partialBase);
  assert.equal(b.followup.status,'incomplete');assert.equal(b.followup.next,null);
  const p=answerNext(base(),q=>4+3*q.direction);
  const last=p.followups[0];const skipped=last.answers.find(a=>FOLLOWUP_QUESTIONS.find(q=>q.id===a.id).axis==='TF');
  skipped.value=null;
  const r=scoreAssessment(p);
  assert.equal(r.complete,false);assert.equal(r.displayType,'XXXX-X');
  assert.equal(r.axes.find(a=>a.id==='TF').status,'insufficient');
  assert.equal(r.axes.find(a=>a.id==='TF').score,null);
  assert.equal(r.followup.status,'incomplete');assert.equal(r.followup.roundsCompleted,0);assert.equal(r.followup.next,null);
  assert.equal(r.followup.baseline.displayType,'INXJ-X');
  assert.throws(()=>scoreAssessment({...p,followups:[last,{...last,round:2}]}),/完整|补齐/);
});

test('validation derives eligible targets from original answers and rejects invalid continuations',()=>{
  const good=answerNext(base());
  const mutate=(fn)=>{const p=structuredClone(good);fn(p);return p;};
  for(const p of [
    mutate(p=>p.followups[0].version='2'),
    mutate(p=>p.followups[0].round=2),
    mutate(p=>p.followups[0].axes=['EI','AT']),
    mutate(p=>p.followups[0].axes=['TF','TF','AT']),
    mutate(p=>p.followups[0].answers.push(p.followups[0].answers[0])),
    mutate(p=>p.followups[0].answers[0].id='q03'),
    mutate(p=>p.followups[0].answers[0].value='7'),
    mutate(p=>p.followups[0].answers[0].value=7.1),
    mutate(p=>p.followups=null),
    mutate(p=>p.origin={id:'',createdAt:'never'}),
    mutate(p=>p.answers[0].value=null),
  ]) assert.throws(()=>scoreAssessment(p));
  const forged=scoreAssessment({...base(),displayType:'ESTP-A',axes:[],followup:{status:'resolved'}});
  assert.equal(forged.displayType,'INXJ-X');assert.equal(forged.followup.next.questions.length,8);
  const wrongRound=mutate(p=>p.followups[0].answers[0].id=FOLLOWUP_QUESTIONS.find(q=>q.round===2).id);
  assert.throws(()=>scoreAssessment(wrongRound),/ID|题目/);
});

test('boundary remains inclusive after pooling and is not forced to a letter',()=>{
  const p=answerNext(base());
  // Full: 16 items. Sum z=9 remains 59.375%, sum z=10 gives 60.4167%.
  const tf=p.followups[0].answers.filter(a=>FOLLOWUP_QUESTIONS.find(q=>q.id===a.id).axis==='TF');
  for(const a of tf.slice(0,3)) a.value=4+3*FOLLOWUP_QUESTIONS.find(q=>q.id===a.id).direction;
  assert.equal(scoreAssessment(p).axes[2].letter,'X');
  tf[3].value=4+FOLLOWUP_QUESTIONS.find(q=>q.id===tf[3].id).direction;
  assert.equal(scoreAssessment(p).axes[2].letter,'F');
});

test('legacy exports and cumulative history restore retain raw answers, scores and timestamps',()=>{
  const legacy=scoreAssessment(base());delete legacy.followup;
  const first=scoreAssessment(answerNext(legacy));
  first.createdAt='2026-11-01T00:00:00.000Z';
  const replay=scoreAssessment(JSON.parse(JSON.stringify(first)));
  assert.deepEqual(replay.axes,first.axes);assert.deepEqual(replay.followups,first.followups);
  const restored=restoreHistory([first,legacy]);
  const found=restored.find(r=>r.id===first.id);
  assert.equal(found.createdAt,first.createdAt);assert.deepEqual(found.followups,first.followups);
  assert.deepEqual(found.followup.next.questions,first.followup.next.questions);
});

test('base reimport and history restoration anchor next questions to the displayed baseline identity',()=>{
  const first=scoreAssessment(base());
  const imported=scoreAssessment(first);
  assert.notEqual(imported.id,first.id);
  assert.deepEqual(imported.followup.next.answerTemplate.origin,{id:imported.id,createdAt:imported.createdAt});
  assert.deepEqual(getFollowupQuestionnaire(imported),imported.followup.next);
  first.createdAt='2026-10-01T02:03:04.000Z';
  const restored=restoreHistory([first])[0];
  assert.deepEqual(restored.followup.next.answerTemplate.origin,{id:restored.id,createdAt:restored.createdAt});
  const child=scoreAssessment(answerNext(imported));
  assert.deepEqual(child.origin,{id:imported.id,createdAt:imported.createdAt});
});

test('downloadable scorer and key-free static supplemental bank match the browser source',async()=>{
  assert.deepEqual(FOLLOWUP_QUESTIONS,SOURCE_FOLLOWUP_QUESTIONS);
  const saved=JSON.parse(await readFile(new URL('../public/questions/followup.json',import.meta.url),'utf8'));
  assert.equal(saved.questions.length,40);
  assert.deepEqual(saved.questions,FOLLOWUP_QUESTIONS.map(({id,text})=>({id,text})));
  const initial=scoreAssessment(base());
  assert.deepEqual(downloadableNext(initial),getFollowupQuestionnaire(initial));
  const p=answerNext(initial,q=>q.axis==='TF'?4+3*q.direction:4);
  const local=scoreAssessment(p),standalone=downloadableScore(p);
  assert.deepEqual(standalone.axes,local.axes);
  assert.deepEqual(standalone.followups,local.followups);
  assert.deepEqual(standalone.followup,local.followup);
  assert.equal(standalone.scoringVersion,'1.1.0');
});

test('offline CLI emits targeted next questions and honours the stopping state',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'agent16-followup-'));
  try {
    const modulePath=fileURLToPath(new URL('../public/agent16.mjs',import.meta.url));
    const file=join(dir,'answers.json');await writeFile(file,JSON.stringify(base()));
    const run=(command)=>JSON.parse(execFileSync(process.execPath,[modulePath,command,file],{encoding:'utf8'}));
    const initial=run('score');
    assert.equal(initial.followup.next.questions.length,8);
    await writeFile(file,JSON.stringify(initial));
    assert.deepEqual(run('followup'),initial.followup.next);
    const finished=scoreAssessment(answerNext(initial,q=>4+3*q.direction));
    await writeFile(file,JSON.stringify(finished));
    assert.equal(run('followup'),null);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
