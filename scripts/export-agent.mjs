await import('./generate-bank.mjs');
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {AXES,QUESTIONS} from '../app/lib/question-bank.ts';
import {FOLLOWUP_QUESTIONS,FOLLOWUP_VERSION,MAX_FOLLOWUP_ROUNDS} from '../app/lib/followup-bank.ts';
const {getQuestionnaire,getMethodology,SCORING_VERSION} = await import('../app/lib/instrument.mjs');
const root=new URL('../public/',import.meta.url);
for(const dir of ['questions','schemas','.well-known']) await mkdir(new URL(dir+'/',root),{recursive:true});
for(const mode of ['full','quick']){
 const q=getQuestionnaire({mode,seed:'agent16-v1'});
 await writeFile(new URL(`questions/${mode}.json`,root),JSON.stringify(q,null,2)+'\n');
 await writeFile(new URL(`questions/${mode}-answers.json`,root),JSON.stringify(q.answerTemplate,null,2)+'\n');
}
await writeFile(new URL('questions/followup.json',root),JSON.stringify({instrument:'agent-mbti',version:'1.0.0',
 followupVersion:FOLLOWUP_VERSION,scoringVersion:SCORING_VERSION,maxRounds:MAX_FOLLOWUP_ROUNDS,
 description:'40 original supplemental items. Do not answer the entire bank. Use result.followup.next or getFollowupQuestionnaire(result) to select four items per exactly tied (50/50) axis, for at most two rounds.',
 questions:FOLLOWUP_QUESTIONS.map(({id,text})=>({id,text}))},null,2)+'\n');
await writeFile(new URL('methodology.json',root),JSON.stringify(getMethodology(),null,2)+'\n');
let source=await readFile(new URL('../app/lib/instrument.mjs',import.meta.url),'utf8');
source=source.replace("import { AXES, QUESTIONS, FOLLOWUP_QUESTIONS, FOLLOWUP_VERSION, MAX_FOLLOWUP_ROUNDS } from './bank-data.mjs';",'const AXES = '+JSON.stringify(AXES)+';\nconst QUESTIONS = '+JSON.stringify(QUESTIONS)+';\nconst FOLLOWUP_QUESTIONS = '+JSON.stringify(FOLLOWUP_QUESTIONS)+';\nconst FOLLOWUP_VERSION = '+JSON.stringify(FOLLOWUP_VERSION)+';\nconst MAX_FOLLOWUP_ROUNDS = '+MAX_FOLLOWUP_ROUNDS+';');
source+='\n'+`// Optional Node CLI. Importing this module never starts a test or sends data.\nif (typeof process !== 'undefined' && process.versions?.node && process.argv[1]) {\n  const {pathToFileURL} = await import('node:url');\n  if (import.meta.url === pathToFileURL(process.argv[1]).href) {\n    try {\n      const [command, fileOrMode, seed] = process.argv.slice(2);\n      let result;\n      if (command === 'questionnaire') result = getQuestionnaire({mode:fileOrMode || 'full',seed:seed || DEFAULT_SEED});\n      else if (command === 'methodology') result = getMethodology();\n      else if ((command === 'score' || command === 'followup') && fileOrMode) {\n        const {readFile} = await import('node:fs/promises');\n        const payload = JSON.parse(await readFile(fileOrMode, 'utf8'));\n        result = command === 'followup' ? getFollowupQuestionnaire(payload) : scoreAssessment(payload);\n      } else throw new Error('Usage: node agent16.mjs questionnaire [full|quick] [seed] | score answers.json | followup result.json | methodology');\n      process.stdout.write(JSON.stringify(result,null,2)+'\\n');\n    } catch(error) { process.stderr.write(error.message+'\\n'); process.exitCode=1; }\n  }\n}\n`;
await writeFile(new URL('agent16.mjs',root),source);
const schema={
 $schema:'https://json-schema.org/draft/2020-12/schema',
 $id:'https://uynewnas.github.io/LLM-16P/schemas/answers.schema.json',
 title:'Agent16 1.0.0 Answers with optional targeted follow-up',type:'object',required:['instrument','version','mode','seed','answers'],
 properties:{instrument:{const:'agent-mbti'},version:{const:'1.0.0'},mode:{enum:['full','quick']},seed:{type:'string',maxLength:128},
  metadata:{type:'object',properties:{model:{type:'string',maxLength:300},provider:{type:'string',maxLength:300},modelVersion:{type:'string',maxLength:300},temperature:{type:['number','null'],minimum:0,maximum:100},topP:{type:['number','null'],minimum:0,maximum:1},systemPrompt:{type:'string',maxLength:10000},runLabel:{type:'string',maxLength:300},administration:{type:'string',maxLength:300},contextNotes:{type:'string',maxLength:10000},promptVersion:{type:'string',maxLength:300},language:{type:'string',maxLength:300},answerSource:{type:'string',maxLength:300}}},
  origin:{type:'object',required:['id','createdAt'],properties:{id:{type:'string',minLength:1,maxLength:200},createdAt:{type:'string',format:'date-time'}}},
  followups:{type:'array',maxItems:MAX_FOLLOWUP_ROUNDS,description:'Ordered rounds. The scorer recomputes exact eligible axes and question IDs from prior raw answers. Every preceding stage must be complete.',items:{type:'object',required:['version','round','axes','answers'],properties:{
   version:{enum:['1.0.0',FOLLOWUP_VERSION],description:'1.0.0: retained legacy 40–60 assignments; 1.1.0: exact 50/50 selection. New rounds always use 1.1.0; version downgrade is rejected by the scorer.'},round:{enum:[1,2]},axes:{type:'array',minItems:1,maxItems:5,uniqueItems:true,items:{enum:['EI','SN','TF','JP','AT']}},
   answers:{type:'array',maxItems:20,uniqueItems:true,items:{type:'object',required:['id','value'],properties:{id:{type:'string',pattern:'^f(0[1-9]|[1-3][0-9]|40)$'},value:{type:['integer','null'],minimum:1,maximum:7}}}}
  },allOf:[1,2].map(round=>({
    if:{properties:{round:{const:round}}},
    then:{properties:{answers:{items:{properties:{id:{pattern:round===1?'^f(0[1-9]|1[0-9]|20)$':'^f(2[1-9]|3[0-9]|40)$'}}}}}},
  }))}},
  answers:{type:'array',maxItems:60,uniqueItems:true,description:'Original base answers, unchanged by follow-up. Each ID at most once; scorer additionally checks ID uniqueness. Missing items remain missing; null means skipped.',items:{type:'object',required:['id','value'],properties:{id:{type:'string',pattern:'^q(0[1-9]|[1-5][0-9]|60)$'},value:{type:['integer','null'],minimum:1,maximum:7}}}}},
 allOf: [{
  if: { properties: { mode: { const: 'quick' } } },
  then: { properties: { answers: { maxItems: 20, items: { properties: { id: { pattern: '^q(0[1-9]|1[0-9]|20)$' } } } } } }
 }],
};
await writeFile(new URL('schemas/answers.schema.json',root),JSON.stringify(schema,null,2)+'\n');
await writeFile(new URL('.well-known/agent.json',root),JSON.stringify({name:'Agent16',version:SCORING_VERSION,instrumentVersion:'1.0.0',scoringVersion:SCORING_VERSION,description:'Original exploratory LLM response-style questionnaire with bounded targeted follow-up only for exactly tied 50/50 dimensions. Static files; no HTTP POST API or model calls.',instructions:'../llms.txt',questionnaires:{full:'../questions/full.json',quick:'../questions/quick.json'},followup:{bank:'../questions/followup.json',version:FOLLOWUP_VERSION,maxRounds:MAX_FOLLOWUP_ROUNDS,selection:'scoreAssessment(payload).followup.next or getFollowupQuestionnaire(payload); null when no further round is available'},answerSchema:'../schemas/answers.schema.json',scorer:'../agent16.mjs',methodology:'../methodology.json',repository:'https://github.com/UyNewNas/LLM-16P'},null,2)+'\n');
await writeFile(new URL('.nojekyll',root),'');
console.log('Exported questionnaires, targeted follow-up bank, answer schema, methodology and standalone scorer.');
