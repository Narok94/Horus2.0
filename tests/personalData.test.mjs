import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/personalData.ts', import.meta.url),'utf8').replace(/import .*? from 'react';/, 'const useEffect = () => {}; const useState = initial => [typeof initial === "function" ? initial() : initial, () => {}];');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }}).outputText;
const { usePersonalAgenda, usePersonalDiet, localDay, isPersonalUser } = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
let storage;
beforeEach(() => { storage = new Map(); globalThis.localStorage = {getItem:key => storage.get(key) ?? null, setItem:(key,value) => storage.set(key,value)}; globalThis.window = new EventTarget(); });
test('new modules start empty without importing or changing existing storage', () => {
 storage.set('tatugym_user_profile_henrique', '{"history":[{"id":"existing"}]}'); storage.set('old_agenda','[{"title":"old"}]');
 assert.deepEqual(usePersonalAgenda()[0], []); const [diet] = usePersonalDiet(); assert.equal(diet.meals.length,6); assert.ok(diet.meals.every(m => !m.description && !m.note)); assert.deepEqual(diet.completed,{}); assert.equal(storage.size,2);
});
test('agenda changes persist and deletion survives reloading', () => {
 const item={id:'test',title:'Teste',date:'2026-10-18',time:'09:00',description:'',category:'Pessoal'};
 assert.equal(usePersonalAgenda()[1]([item]),true); assert.deepEqual(usePersonalAgenda()[0],[item]);
 usePersonalAgenda()[1]([{...item,title:'Editado'}]); assert.equal(usePersonalAgenda()[0][0].title,'Editado');
 usePersonalAgenda()[1]([]); assert.deepEqual(usePersonalAgenda()[0],[]);
});
test('meal edits and completion persist independently for each day', () => {
 const [diet,save]=usePersonalDiet(); diet.meals[0].description='Alimentos de teste'; diet.completed['2026-10-18']=[diet.meals[0].id]; save(diet);
 const [reloaded]=usePersonalDiet(); assert.equal(reloaded.meals[0].description,'Alimentos de teste'); assert.equal(reloaded.completed['2026-10-18'].length,1); assert.deepEqual(reloaded.completed['2026-10-19'] || [],[]);
 reloaded.completed['2026-10-18']=[]; usePersonalDiet()[1](reloaded); assert.deepEqual(usePersonalDiet()[0].completed['2026-10-18'],[]);
});
test('invalid stored data does not crash or overwrite the original', () => {
 storage.set('horus_agenda_henrique','broken'); storage.set('horus_diet_henrique','{"meals":[],"completed":{"day":false}}');
 assert.deepEqual(usePersonalAgenda()[0],[]); assert.equal(usePersonalDiet()[0].meals.length,6); assert.equal(storage.get('horus_agenda_henrique'),'broken');
});
test('failed storage writes report failure', () => { localStorage.setItem=()=>{throw Error('full')}; assert.equal(usePersonalAgenda()[1]([]),false); });
test('personal access is exclusive and dates use local calendar boundaries', () => { assert.equal(isPersonalUser('henrique'),true); assert.equal(isPersonalUser('Henrique'),true); assert.equal(isPersonalUser('jessica'),false); assert.equal(isPersonalUser(undefined),false); assert.equal(localDay(new Date(2026,9,18,0,1)),'2026-10-18'); assert.equal(localDay(new Date(2026,9,18,23,59)),'2026-10-18'); });
