import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
const files = readdirSync(new URL('../src/assets/Gif/', import.meta.url)).filter(file => file.endsWith('.gif'));
const source = readFileSync(new URL('../src/utils/abcGifs.ts', import.meta.url), 'utf8').replace(/^const gifs = .*$/m, `const gifs = ${JSON.stringify(Object.fromEntries(files.map(file=>['../assets/Gif/'+file,file])))};`);
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { abcGifFiles, getABCExerciseGif } = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('18 distinct named assets exist and all are GIF files with infinite loop metadata',()=>{
 assert.equal(Object.keys(abcGifFiles).length,18);assert.equal(new Set(Object.values(abcGifFiles)).size,18);
 assert.deepEqual([...Object.values(abcGifFiles)].sort(),files.sort());
 for(const file of files){const bytes=readFileSync(new URL('../src/assets/Gif/'+file,import.meta.url));assert.match(bytes.subarray(0,6).toString(),/^GIF8[79]a$/);const at=bytes.indexOf(Buffer.from('NETSCAPE2.0'));assert.ok(at>=0,file);assert.deepEqual([...bytes.subarray(at+11,at+16)],[3,1,0,0,0],file);}
});
test('only Henrique ABC uses the explicit mapping; missing identities never select a nearby filename',()=>{
 for(const [catalogExerciseId,file] of Object.entries(abcGifFiles)){
  assert.equal(getABCExerciseGif('henrique',{id:'henrique-abc-v1-a'},{catalogExerciseId}),file);
  assert.equal(getABCExerciseGif('jessica',{id:'henrique-abc-v1-a'},{catalogExerciseId}),undefined);
  assert.equal(getABCExerciseGif('henrique',{id:'h-a'},{catalogExerciseId}),undefined);
 }
 assert.equal(getABCExerciseGif('henrique',{id:'henrique-abc-v1-a'},{catalogExerciseId:'unknown'}),undefined);
 assert.equal(getABCExerciseGif('henrique',{id:'henrique-abc-v1-a'},{}),undefined);
});
