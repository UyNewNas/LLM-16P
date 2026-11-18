import {writeFile} from 'node:fs/promises';
import {AXES, QUESTIONS} from '../app/lib/question-bank.ts';
import {FOLLOWUP_QUESTIONS,FOLLOWUP_VERSION,MAX_FOLLOWUP_ROUNDS} from '../app/lib/followup-bank.ts';
await writeFile(new URL('../app/lib/bank-data.mjs', import.meta.url), '// Generated from question-bank.ts and followup-bank.ts. Run npm run generate after edits.\nexport const AXES = '+JSON.stringify(AXES,null,2)+';\nexport const QUESTIONS = '+JSON.stringify(QUESTIONS,null,2)+';\nexport const FOLLOWUP_QUESTIONS = '+JSON.stringify(FOLLOWUP_QUESTIONS,null,2)+';\nexport const FOLLOWUP_VERSION = '+JSON.stringify(FOLLOWUP_VERSION)+';\nexport const MAX_FOLLOWUP_ROUNDS = '+MAX_FOLLOWUP_ROUNDS+';\n');
console.log(`Generated ${QUESTIONS.length} original items and ${FOLLOWUP_QUESTIONS.length} follow-up items.`);
