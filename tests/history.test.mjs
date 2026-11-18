import test from 'node:test';
import assert from 'node:assert/strict';
import {getQuestionnaire,scoreAssessment} from '../app/lib/instrument.mjs';
import {restoreHistory} from '../app/lib/history.mjs';
const run=()=>{const q=getQuestionnaire({mode:'quick'});return scoreAssessment({...q.answerTemplate,answers:q.questions.map(q=>({id:q.id,value:4}))});};

test('history restore recomputes scores but preserves original experiment IDs and dates',()=>{
 const a=run();a.createdAt='2025-01-02T03:04:05.000Z';a.displayType='FAKE-A';
 const restored=restoreHistory([a]);
 assert.equal(restored.length,1);
 assert.equal(restored[0].id,a.id);
 assert.equal(restored[0].createdAt,a.createdAt);
 assert.equal(restored[0].displayType,'XXXX-X');
 assert.deepEqual(restored[0].answers,a.answers);
});

test('malformed history batch fails before any partial restore; duplicate runs collapse',()=>{
 const a=run();assert.throws(()=>restoreHistory([a,{...a,version:'9'}]),/第 2 条/);
 assert.equal(restoreHistory([a,a]).length,1);
 assert.throws(()=>restoreHistory([{...a,createdAt:'not a date'}]),/时间/);
});
