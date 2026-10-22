import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,run} from '../src/cli.js';
test('Codex delegation',()=>assert.deepEqual(parse(['wrap','codex']),{command:'wrap',args:['codex']}));
test('Claude delegation',()=>assert.deepEqual(parse(['wrap','claude']),{command:'wrap',args:['claude']}));
test('reject unknown agent',()=>assert.throws(()=>parse(['wrap','other'])));
test('reject unknown command',()=>assert.throws(()=>parse(['wrong'])));
test('no shell execution',()=>{let actual;const result=run(['wrap','codex'],(cmd,args,opts)=>{actual={cmd,args,opts};return {status:0}},{write(){}},{write(){}});assert.equal(result,0);assert.equal(actual.cmd,'headroom');assert.equal(actual.opts.shell,false)});
test('missing dependency',()=>{let message='';assert.equal(run(['doctor'],()=>({error:new Error('ENOENT')}),{write(){}},{write:s=>message+=s}),1);assert.match(message,/Install the Headroom CLI/)});
