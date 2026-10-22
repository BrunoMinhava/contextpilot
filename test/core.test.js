import test from 'node:test';
import assert from 'node:assert/strict';
import { compactText, readFileSlice } from '../src/core.js';
test('small output unchanged', () => { assert.equal(compactText('hello').text, 'hello'); });
test('long output truncated', () => { const r = compactText(Array.from({length:100},(_,i)=>String(i)).join('\n'), {maxLines:10}); assert.match(r.text,/omitted/); assert.ok(r.outputChars < r.originalChars); });
test('read bounded source file', async () => { const r = await readFileSlice(process.cwd(),'package.json',1,2); assert.match(r.text,/1:/); });
test('reject traversal', async () => { await assert.rejects(readFileSlice(process.cwd(),'../'), /outside allowed root|regular/); });
