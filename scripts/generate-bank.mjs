import {writeFile} from 'node:fs/promises';
import {AXES, QUESTIONS} from '../app/lib/question-bank.ts';
await writeFile(new URL('../app/lib/bank-data.mjs', import.meta.url), '// Generated from question-bank.ts. Run npm run generate after edits.\nexport const AXES = '+JSON.stringify(AXES,null,2)+';\nexport const QUESTIONS = '+JSON.stringify(QUESTIONS,null,2)+';\n');
console.log(`Generated ${QUESTIONS.length} original items.`);
