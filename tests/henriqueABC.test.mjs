import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const url = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64');
const catalog = url(readFileSync(new URL('../data/exerciseCatalog.ts', import.meta.url), 'utf8'));
const gifs = url(readFileSync(new URL('../src/utils/exerciseUtils.ts', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../data/henriqueABC.ts', import.meta.url), 'utf8').replace("'./exerciseCatalog'", JSON.stringify(catalog)).replace("'../src/utils/exerciseUtils'", JSON.stringify(gifs));
const { henriqueABC, withHenriqueABC, abcOnDay } = await import(url(source));
test('18 prescriptions have exact sets, repetitions and individual rests', () => {
  assert.deepEqual(henriqueABC.map(w => w.exercises.map(e => [e.sets,e.reps,e.rest])), [
    [[3,'8-10',120],[2,'8-12',90],[3,'12-15',60],[2,'8-12',90],[3,'10-12',60],[2,'12-15',60]],
    [[3,'8-10',120],[3,'8-12',90],[2,'10-12',75],[2,'12-15',60],[3,'8-12',60],[2,'10-12',60]],
    [[3,'8-12',120],[2,'10-15',60],[3,'10-12',60],[2,'8-10',90],[3,'12-15',60],[2,'12-15',60]]
  ]);
  assert.equal(new Set(henriqueABC.flatMap(w => w.exercises.map(e => e.catalogExerciseId))).size,18);
  assert.match(henriqueABC[0].exercises[3].notes, /liberação profissional/);
  assert.match(henriqueABC[1].exercises[2].notes, /por braço/);
});
test('calendar continues ABC across Mondays and repeats after three weeks', () => {
  const days = Array.from({length:28}, (_,i) => new Date(Date.UTC(2026,9,26+i)).toISOString().slice(0,10));
  const weeks = [0,7,14,21].map(offset => days.slice(offset,offset+5).map(d => abcOnDay(d).id.slice(-1)).join(''));
  assert.deepEqual(weeks,['abcab','cabca','bcabc','abcab']);
  for(const offset of [5,6,12,13,19,20]) assert.equal(abcOnDay(days[offset]),null);
});
test('enrollment preserves prior routines, media and repeated enrollment is idempotent', () => {
  const prior = [{id:'old', exercises:[{image:'keep.gif'}]}, {...henriqueABC[0], description:'personalized'}];
  const next = withHenriqueABC(prior);
  assert.equal(next.find(w => w.id === 'old'),prior[0]);
  assert.equal(next.find(w => w.id === henriqueABC[0].id),prior[1]);
  assert.deepEqual(withHenriqueABC(next),next);
});
