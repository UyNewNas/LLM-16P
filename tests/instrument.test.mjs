import test from 'node:test';
import assert from 'node:assert/strict';
import {getQuestionnaire, scoreAssessment} from '../app/lib/instrument.mjs';

test('full questionnaire contains 60 opaque questions and a versioned response template', () => {
 const q = getQuestionnaire({mode:'full',seed:'test'});
 assert.ok(q, 'questionnaire must be implemented');
 assert.equal(q.questions.length,60);
 assert.equal(q.version,'1.0.0');
 assert.equal(q.answerTemplate.answers.length,60);
 assert.deepEqual(Object.keys(q.questions[0]).sort(),['id','text']);
});

const input = (value=4,mode='full') => {
 const q=getQuestionnaire({mode,seed:'test'});
 return {...q.answerTemplate,metadata:{model:'test-only'},answers:q.questions.map(q=>({id:q.id,value}))};
};

test('neutral answers remain neutral and never become an arbitrary personality', () => {
 const r=scoreAssessment(input());
 assert.ok(r,'scorer must be implemented');
 assert.equal(r.displayType,'XXXX-X');
 assert.equal(r.complete,true);
 assert.ok(r.axes.every(a=>a.score===0 && a.rightPercent===50 && a.status==='borderline'));
});

test('straight-line strong agreement is flagged and cancels across balanced keys', () => {
 const r=scoreAssessment(input(7));
 assert.equal(r.type,'XXXX');
 assert.equal(r.quality.straightLining,true);
 assert.equal(r.quality.pairConsistency,0);
});

test('skip and omitted data are counted separately, never scored as neutral', () => {
 const p=input(null); p.answers=p.answers.slice(1);
 const r=scoreAssessment(p);
 assert.equal(r.complete,false);
 assert.equal(r.answered,0);
 assert.equal(r.quality.missingCount,1);
 assert.equal(r.quality.skippedCount,59);
 assert.equal(r.quality.neutralCount,0);
 assert.ok(r.axes.every(a=>a.score===null && a.rightPercent===null && a.status==='insufficient'));
});

test('changing seed changes order without changing question identity', () => {
 const a=getQuestionnaire({mode:'quick',seed:'a'}).questions;
 const b=getQuestionnaire({mode:'quick',seed:'b'}).questions;
 assert.equal(a.length,20);
 assert.notDeepEqual(a,b);
 assert.deepEqual([...a].sort((a,b)=>a.id.localeCompare(b.id)),[...b].sort((a,b)=>a.id.localeCompare(b.id)));
 assert.deepEqual(a,getQuestionnaire({mode:'quick',seed:'a'}).questions);
});

test('rejects duplicate IDs, unknown IDs, versions, invalid scale values and malformed metadata', () => {
 for(const val of [0,8,1.5,'4',false,undefined,NaN]){
  const p=input();p.answers[0].value=val;
  assert.throws(()=>scoreAssessment(p), /1.*7|整数|value/);
 }
 let p=input();p.answers.push(p.answers[0]);assert.throws(()=>scoreAssessment(p),/重复/);
 p=input();p.answers[0].id='bogus';assert.throws(()=>scoreAssessment(p),/未知/);
 p=input();p.version='9';assert.throws(()=>scoreAssessment(p),/版本/);
 p=input();p.mode='half';assert.throws(()=>scoreAssessment(p),/mode/);
 p=input();p.metadata={model:42};assert.throws(()=>scoreAssessment(p),/model/);
 p=input();p.metadata={temperature:'0.7'};assert.throws(()=>scoreAssessment(p),/temperature/);
 assert.throws(()=>scoreAssessment(null),/对象/);
});

import {QUESTIONS,AXES} from '../app/lib/bank-data.mjs';

test('canonical extreme vectors map to ESTJ-A and INFP-T with perfect paired agreement', () => {
 for(const direction of [-1,1]){
  const p=input();p.answers=QUESTIONS.map(q=>({id:q.id,value:4+3*q.direction*direction}));
  const r=scoreAssessment(p);
  assert.equal(r.displayType,direction===-1?'ESTJ-A':'INFP-T');
  assert.ok(r.axes.every(a=>a.score===direction*100));
  assert.equal(r.quality.pairConsistency,100);
  const reversed=scoreAssessment({...p,answers:[...p.answers].reverse()});
  assert.deepEqual(reversed.axes,r.axes);
 }
});

test('coverage-gated partial scores do not yield a completed type', () => {
 const p=input();p.answers=QUESTIONS.map(q=>({id:q.id,value:4+2*q.direction}));
 p.answers[0].value=null;
 const r=scoreAssessment(p);
 assert.equal(r.complete,false);
 assert.equal(r.type,'????');
 assert.equal(r.axes.find(a=>a.id==='EI').letter,'I');
 assert.equal(r.provisionalType,'INFP');
});

test('only exact zero signed totals produce X; nearest nonzero scores have a direction', () => {
 for(const mode of ['full','quick']) for(const direction of [-1,1]){
  const p=input(4,mode);
  for(const axis of AXES){
   const q=QUESTIONS.find(q=>q.axis===axis.id&&(mode==='full'||q.quick));
   p.answers.find(a=>a.id===q.id).value=4+direction*q.direction;
  }
  const r=scoreAssessment(p);
  assert.equal(r.displayType,direction===1?'INFP-T':'ESTJ-A');
  assert.ok(r.axes.every(a=>a.status==='clear'&&a.rightPercent!==50));
  assert.equal(r.followup.next,null);
 }
 const tied=input();
 for(const axis of AXES){
  const qs=QUESTIONS.filter(q=>q.axis===axis.id);
  tied.answers.find(a=>a.id===qs[0].id).value=4+qs[0].direction;
  tied.answers.find(a=>a.id===qs[1].id).value=4-qs[1].direction;
 }
 assert.equal(scoreAssessment(tied).displayType,'XXXX-X');
});

test('full and quick banks preserve balance, unique IDs, and opposite-key pairs', () => {
 assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,60);
 for(const mode of ['full','quick']){
  const qs=QUESTIONS.filter(q=>mode==='full'||q.quick);
  for(const axis of AXES){
   const group=qs.filter(q=>q.axis===axis.id);
   assert.equal(group.length,mode==='full'?12:4);
   assert.equal(group.reduce((n,q)=>n+q.direction,0),0);
  }
  for(const pair of new Set(qs.map(q=>q.pair))){
   const items=qs.filter(q=>q.pair===pair);assert.equal(items.length,2);
   assert.equal(items[0].direction,-items[1].direction);
  }
 }
});

import {QUESTIONS as SOURCE_QUESTIONS,AXES as SOURCE_AXES} from '../app/lib/question-bank.ts';
import {getQuestionnaire as downloadableQuestionnaire,scoreAssessment as downloadableScore} from '../public/agent16.mjs';
import {readFile} from 'node:fs/promises';

test('generated bank, downloadable standalone scorer and static questions match source', async () => {
 assert.deepEqual(QUESTIONS,SOURCE_QUESTIONS);assert.deepEqual(AXES,SOURCE_AXES);
 for(const mode of ['full','quick']){
  assert.deepEqual(downloadableQuestionnaire({mode,seed:'same'}),getQuestionnaire({mode,seed:'same'}));
  const saved=JSON.parse(await readFile(new URL(`../public/questions/${mode}.json`,import.meta.url),'utf8'));
  assert.deepEqual(saved,getQuestionnaire({mode,seed:'agent16-v1'}));
 }
 const p=input(4,'quick');
 assert.deepEqual(downloadableScore(p).axes,scoreAssessment(p).axes);
});

test('score export can be imported again without changing scores or original answers',()=>{
 const a=scoreAssessment(input(5));
 const b=scoreAssessment(JSON.parse(JSON.stringify(a)));
 assert.deepEqual(b.axes,a.axes);assert.deepEqual(b.answers,a.answers);
});
