import test from 'node:test';
import assert from 'node:assert/strict';
import { compactText, readFileSlice } from '../src/core.js';
test('small output unchanged', () => assert.equal(compactText('hello').text, 'hello'));
test('long output compacted', () => {
 const input = 'a'.repeat(12000);
 const result = compactText(input, {maxChars:1000});
 assert.ok(result.outputChars < result.originalChars);
 assert.match(result.text,/omitted/);
});
test('read project file lines', async () => {
 const result = await readFileSlice(process.cwd(),'package.json',1,2);
 assert.match(result.text,/1:/);
});
test('reject outside project root', async () => {
 await assert.rejects(readFileSlice(process.cwd(),'../package.json'), /Outside project root|ENOENT/);
});
