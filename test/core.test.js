import test from 'node:test';
import assert from 'node:assert/strict';
import {compactText,readFileSlice,ContextCache} from '../src/core.js';
test('small output unchanged',()=>assert.equal(compactText('hello').text,'hello'));
test('unknown output preserved',()=>{const r=compactText('a'.repeat(12000),{maxChars:1000});assert.equal(r.outputChars,12000);assert.equal(r.omittedChars,0)});
test('reversible cache retrieval',()=>{const c=new ContextCache();const input='INFO heartbeat\n'.repeat(1000);const r=c.put(input,300);assert.equal(c.get(r.id,100,50).text,input.slice(100,150));assert.ok(c.metrics().estimatedCharactersAvoided>0)});
test('cache evicts old items',()=>{const c=new ContextCache(1);const first=c.put('hello');c.put('world');assert.throws(()=>c.get(first.id),/not found/)});
test('file slicing',async()=>{const r=await readFileSlice(process.cwd(),'package.json',1,2);assert.match(r.text,/1:/)});
test('reject traversal',async()=>{await assert.rejects(readFileSlice(process.cwd(),'../'),/Outside project root|Unsupported file/)});
test('known hash suppresses unchanged reads but invalidates after edits',async()=>{
 const fs=await import('node:fs/promises');const os=await import('node:os');const path=await import('node:path');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'contextpilot-read-'));
 try{await fs.writeFile(path.join(dir,'file.txt'),'first');const a=await readFileSlice(dir,'file.txt');assert.equal((await readFileSlice(dir,'file.txt',1,100,a.hash)).unchanged,true);await fs.writeFile(path.join(dir,'file.txt'),'second');const b=await readFileSlice(dir,'file.txt',1,100,a.hash);assert.equal(b.unchanged,false);assert.match(b.text,/second/)}finally{await fs.rm(dir,{recursive:true,force:true})}
});
