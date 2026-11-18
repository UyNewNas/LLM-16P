import {writeFile} from 'node:fs/promises';
import {walk,sourceFiles,hashes} from './build-integrity.mjs';
const artifacts=(await walk('dist')).filter(f=>f!=='dist/build-manifest.json');
const manifest={version:1,source:await hashes(await sourceFiles()),artifacts:await hashes(artifacts)};
await writeFile('dist/build-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Stamped ${Object.keys(manifest.source).length} sources and ${artifacts.length} static artifacts.`);
