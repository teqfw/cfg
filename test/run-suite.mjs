// @ts-check
// @ts-nocheck
import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
const suite=process.argv[2];const dir=join('test',suite);let files=[];try{files=(await readdir(dir)).filter((name)=>name.endsWith('.test.mjs')).sort().map((name)=>join(dir,name));}catch{files=[];}if(files.length===0){console.log('Skipped '+suite+' suite: no test files.');process.exit(0);}const {spawn} = await import('node:child_process');const child=spawn(process.execPath,['--test',...files],{stdio:'inherit'});child.on('exit',(code,signal)=>process.exit(code??(signal?1:0)));
