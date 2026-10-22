import test from 'node:test';
import assert from 'node:assert/strict';
import {compactText} from '../src/compression.js';
test('preserves a critical middle error and surrounding stack trace',()=>{
 const input='INFO heartbeat\n'.repeat(100)+'Error: payment mismatch\n    at charge (src/pay.js:72:9)\n'+'INFO heartbeat\n'.repeat(100);
 const r=compactText(input,{maxChars:200});assert.match(r.text,/Error: payment mismatch\n    at charge \(src\/pay.js:72:9\)/);assert.ok(r.outputChars<input.length);
});
test('unknown source is preserved despite budget pressure',()=>{const s='const unique = '+JSON.stringify('x'.repeat(2000));const r=compactText(s,{maxChars:200});assert.equal(r.text,s);assert.equal(r.budgetExceeded,true)});
test('JSON retains duplicate keys, integer spelling and escaped string whitespace',()=>{
 const s=' { "n": 900719925474099312345, "n": -0, "s": "a  b\\\"  c", "pad": "'+ 'z'.repeat(300)+'" } ';
 const r=compactText(s,{maxChars:200});assert.match(r.text,/900719925474099312345,"n":-0/);assert.match(r.text,/a  b/);assert.deepEqual(JSON.parse(r.text),JSON.parse(s));
});
test('already folded output remains unchanged',()=>{const r=compactText('INFO ok\n'.repeat(500),{maxChars:200});assert.equal(compactText(r.text,{maxChars:200}).text,r.text)});
test('invalid budgets rejected',()=>{for(const n of [0,-1,NaN,Infinity,1.5,'400'])assert.throws(()=>compactText('abc',{maxChars:n}),RangeError)});
test('repeated errors are never folded',()=>{const s='ERROR missing file src/a.js:5\n'.repeat(100);assert.equal(compactText(s,{maxChars:200}).text,s)});
test('adversarial Unicode and JSON corpus retains every value',()=>{
 for(let i=0;i<100;i++){const data={id:i,unicode:'😀 ç 中文\\\"'.repeat(i),values:[null,true,false,-1.5,{nested:'   '}]};const s=JSON.stringify(data,null,4);assert.deepEqual(JSON.parse(compactText(s,{maxChars:200}).text),data)}
});
test('diagnostic text inside INFO logs is not folded',()=>{const input='INFO request failed: src/a.js:4\n'.repeat(100);assert.equal(compactText(input,{maxChars:200}).text,input)});
