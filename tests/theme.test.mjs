import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/utils/theme.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {resolveTheme,validThemePreference}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('automatic theme follows system; explicit themes stay fixed',()=>{
 assert.equal(resolveTheme('auto',true),'dark');assert.equal(resolveTheme('auto',false),'light');
 assert.equal(resolveTheme('light',true),'light');assert.equal(resolveTheme('dark',false),'dark');
});
test('existing theme preferences survive; absent preferences use automatic mode',()=>{
 assert.equal(validThemePreference('light'),'light');assert.equal(validThemePreference('dark'),'dark');
 for(const value of [null,'auto','unknown'])assert.equal(validThemePreference(value),'auto');
});
