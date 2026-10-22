import test from 'node:test';
import assert from 'node:assert/strict';
import {compactText,readFileSlice,ContextCache} from '../src/core.js';
test('small output unchanged',()=>assert.equal(compactText('hello').text,'hello'));
test('long output bounded',()=>{const r=compactText('a'.repeat(12000),{maxChars:1000});assert.equal(r.outputChars,1000);assert.equal(r.omittedChars,11000)});
test('reversible cache retrieval',()=>{const c=new ContextCache();const input='0123456789'.repeat(1000);const r=c.put(input,300);assert.equal(c.get(r.id,100,50).text,input.slice(100,150));assert.ok(c.metrics().estimatedCharactersAvoided>0)});
test('cache evicts old items',()=>{const c=new ContextCache(1);const first=c.put('hello');c.put('world');assert.throws(()=>c.get(first.id),/not found/)});
test('file slicing',async()=>{const r=await readFileSlice(process.cwd(),'package.json',1,2);assert.match(r.text,/1:/)});
test('reject traversal',async()=>{await assert.rejects(readFileSlice(process.cwd(),'../'),/Outside project root|Unsupported file/)});
