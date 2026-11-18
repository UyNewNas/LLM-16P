await import('./generate-bank.mjs');
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {AXES,QUESTIONS} from '../app/lib/question-bank.ts';
const {getQuestionnaire,getMethodology} = await import('../app/lib/instrument.mjs');
const root=new URL('../public/',import.meta.url);
for(const dir of ['questions','schemas','.well-known']) await mkdir(new URL(dir+'/',root),{recursive:true});
for(const mode of ['full','quick']){
 const q=getQuestionnaire({mode,seed:'agent16-v1'});
 await writeFile(new URL(`questions/${mode}.json`,root),JSON.stringify(q,null,2)+'\n');
 await writeFile(new URL(`questions/${mode}-answers.json`,root),JSON.stringify(q.answerTemplate,null,2)+'\n');
}
await writeFile(new URL('methodology.json',root),JSON.stringify(getMethodology(),null,2)+'\n');
let source=await readFile(new URL('../app/lib/instrument.mjs',import.meta.url),'utf8');
source=source.replace("import { AXES, QUESTIONS } from './bank-data.mjs';",'const AXES = '+JSON.stringify(AXES)+';\nconst QUESTIONS = '+JSON.stringify(QUESTIONS)+';');
source+='\n'+`// Optional Node CLI. Importing this module never starts a test or sends data.\nif (typeof process !== 'undefined' && process.versions?.node && process.argv[1]) {\n  const {pathToFileURL} = await import('node:url');\n  if (import.meta.url === pathToFileURL(process.argv[1]).href) {\n    try {\n      const [command, fileOrMode, seed] = process.argv.slice(2);\n      let result;\n      if (command === 'questionnaire') result = getQuestionnaire({mode:fileOrMode || 'full',seed:seed || DEFAULT_SEED});\n      else if (command === 'methodology') result = getMethodology();\n      else if (command === 'score' && fileOrMode) {\n        const {readFile} = await import('node:fs/promises');\n        result = scoreAssessment(JSON.parse(await readFile(fileOrMode, 'utf8')));\n      } else throw new Error('Usage: node agent16.mjs questionnaire [full|quick] [seed] | score answers.json | methodology');\n      process.stdout.write(JSON.stringify(result,null,2)+'\\n');\n    } catch(error) { process.stderr.write(error.message+'\\n'); process.exitCode=1; }\n  }\n}\n`;
await writeFile(new URL('agent16.mjs',root),source);
const schema={
 $schema:'https://json-schema.org/draft/2020-12/schema',
 $id:'https://uynewnas.github.io/LLM-16P/schemas/answers.schema.json',
 title:'Agent16 1.0.0 Answers',type:'object',required:['instrument','version','mode','seed','answers'],
 properties:{instrument:{const:'agent-mbti'},version:{const:'1.0.0'},mode:{enum:['full','quick']},seed:{type:'string',maxLength:128},
  metadata:{type:'object',properties:{model:{type:'string',maxLength:300},provider:{type:'string',maxLength:300},modelVersion:{type:'string',maxLength:300},temperature:{type:['number','null'],minimum:0,maximum:100},topP:{type:['number','null'],minimum:0,maximum:1},systemPrompt:{type:'string',maxLength:10000},runLabel:{type:'string',maxLength:300},administration:{type:'string',maxLength:300},contextNotes:{type:'string',maxLength:10000},promptVersion:{type:'string',maxLength:300},language:{type:'string',maxLength:300},answerSource:{type:'string',maxLength:300}}},
  answers:{type:'array',maxItems:60,uniqueItems:true,description:'Each ID at most once; scorer additionally checks ID uniqueness. Missing items remain missing; null means skipped.',items:{type:'object',required:['id','value'],properties:{id:{type:'string',pattern:'^q(0[1-9]|[1-5][0-9]|60)$'},value:{type:['integer','null'],minimum:1,maximum:7}}}}},
 allOf: [{
  if: { properties: { mode: { const: 'quick' } } },
  then: { properties: { answers: { maxItems: 20, items: { properties: { id: { pattern: '^q(0[1-9]|1[0-9]|20)$' } } } } } }
 }],
};
await writeFile(new URL('schemas/answers.schema.json',root),JSON.stringify(schema,null,2)+'\n');
await writeFile(new URL('.well-known/agent.json',root),JSON.stringify({name:'Agent16',version:'1.0.0',description:'Original exploratory LLM response-style questionnaire. Static files; no HTTP POST API or model calls.',instructions:'../llms.txt',questionnaires:{full:'../questions/full.json',quick:'../questions/quick.json'},answerSchema:'../schemas/answers.schema.json',scorer:'../agent16.mjs',methodology:'../methodology.json',repository:'https://github.com/UyNewNas/LLM-16P'},null,2)+'\n');
await writeFile(new URL('.nojekyll',root),'');
console.log('Exported static questionnaires, answer templates, JSON Schema, methodology and standalone scorer.');
