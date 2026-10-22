import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const server=fileURLToPath(new URL('../src/server.js',import.meta.url));
test('MCP handshake, cache, retrieval, stats and errors',async()=>{
 const child=spawn(process.execPath,[server],{stdio:['pipe','pipe','pipe']});
 let buffer='';const pending=new Map();
 child.stdout.on('data',chunk=>{buffer+=chunk.toString();let i;while((i=buffer.indexOf('\n'))>=0){const msg=JSON.parse(buffer.slice(0,i));buffer=buffer.slice(i+1);pending.get(msg.id)?.(msg);pending.delete(msg.id);}});
 const request=(id,method,params={})=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('MCP timeout')),3000);pending.set(id,msg=>{clearTimeout(timeout);resolve(msg)});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
 try{
  assert.equal((await request(1,'initialize')).result.serverInfo.name,'contextpilot');
  assert.equal((await request(2,'tools/list')).result.tools.length,4);
  const input='x'.repeat(10000);
  const response=await request(3,'tools/call',{name:'compact_text',arguments:{text:input,maxChars:500}});
  const compact=JSON.parse(response.result.content[0].text);assert.equal(compact.outputChars,500);
  const retrieved=await request(4,'tools/call',{name:'retrieve_context',arguments:{id:compact.id,start:0,length:10000}});
  assert.equal(JSON.parse(retrieved.result.content[0].text).text,input);
  const stats=await request(5,'tools/call',{name:'contextpilot_stats',arguments:{}});
  assert.ok(JSON.parse(stats.result.content[0].text).estimatedCharactersAvoided>0);
  const unknown=await request(6,'tools/call',{name:'invalid',arguments:{}});
  assert.equal(unknown.error.code,-32602);
 }finally{child.kill();}
});
