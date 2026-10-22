import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const server = fileURLToPath(new URL('../src/server.js', import.meta.url));
test('MCP initialize, list and call', async () => {
 const child=spawn(process.execPath,[server],{stdio:['pipe','pipe','pipe']});
 let buffer='';const pending=new Map();
 child.stdout.on('data',chunk=>{buffer+=chunk.toString();let i;while((i=buffer.indexOf('\n'))>=0){const message=JSON.parse(buffer.slice(0,i));buffer=buffer.slice(i+1);pending.get(message.id)?.(message);pending.delete(message.id);}});
 const request=(id,method,params={})=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('timeout')),3000);pending.set(id,m=>{clearTimeout(timeout);resolve(m)});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
 try{
  const init=await request(1,'initialize');assert.equal(init.result.serverInfo.name,'contextpilot');
  const list=await request(2,'tools/list');assert.equal(list.result.tools.length,2);
  const compact=await request(3,'tools/call',{name:'compact_text',arguments:{text:'abc'}});
  assert.equal(JSON.parse(compact.result.content[0].text).text,'abc');
  const slice=await request(4,'tools/call',{name:'read_file_slice',arguments:{file:'package.json',lineCount:1}});
  assert.match(slice.result.content[0].text,/totalLines/);
  const missing=await request(5,'tools/call',{name:'bad',arguments:{}});
  assert.equal(missing.result.isError,true);
 }finally{child.kill();}
});
