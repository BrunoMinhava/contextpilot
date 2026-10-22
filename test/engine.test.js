import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine,runHeadroom} from '../src/engine.js';

test('native engine preserves unknown text',async()=>{
 const engine=createEngine();
 const text='unknown input '.repeat(100);
 assert.equal((await engine.compact(text,{maxChars:200})).text,text);
});
test('headroom engine never silently falls back',async()=>{
 await assert.rejects(createEngine({backend:'headroom'}).compact('test'),/not configured/);
 assert.throws(()=>createEngine({backend:'other'}),/Unsupported/);
});
test('subprocess bridge captures output and exit status without shell',async()=>{
 const r=await runHeadroom(['-e','process.stdout.write("ok")'],{binary:process.execPath});
 assert.equal(r.code,0);assert.equal(r.stdout,'ok');
});
test('subprocess bridge rejects NUL arguments',async()=>{
 await assert.rejects(runHeadroom(['hello\0world']),/Invalid arguments/);
});
