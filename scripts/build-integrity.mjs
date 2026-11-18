import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
export async function walk(folder){
 const result=[];
 for(const entry of await readdir(folder,{withFileTypes:true})){
  const file=path.posix.join(folder,entry.name);
  if(entry.isDirectory())result.push(...await walk(file));
  else if(entry.isFile())result.push(file);
  else throw new Error(`Unexpected non-file artifact: ${file}`);
 }
 return result.sort();
}
export async function sourceFiles(){
 const roots=['index.html','main.tsx','package.json','package-lock.json','tsconfig.json','vite.config.ts'];
 for(const dir of ['app/components','app/lib','public']) roots.push(...await walk(dir));
 roots.push('app/page.tsx','app/globals.css','scripts/export-agent.mjs','scripts/generate-bank.mjs');
 return roots.sort();
}
export async function hashes(files){
 const out={};
 for(const file of files) out[file]=createHash('sha256').update(await readFile(file)).digest('hex');
 return out;
}
