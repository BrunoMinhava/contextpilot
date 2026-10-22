#!/usr/bin/env node
import { compactText, readFileSlice } from './core.js';
const root = process.env.CONTEXTPILOT_ROOT || process.cwd();
const tools = [
 {name:'compact_text',description:'Compact verbose text, keeping beginning and end',inputSchema:{type:'object',properties:{text:{type:'string'},maxChars:{type:'integer'}},required:['text']}},
 {name:'read_file_slice',description:'Read selected lines from a file in project root',inputSchema:{type:'object',properties:{file:{type:'string'},startLine:{type:'integer'},lineCount:{type:'integer'}},required:['file']}}
];
function send(id,result){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\n');}
async function handle(msg){
 const {id,method,params={}}=msg;
 if(id===undefined)return;
 if(method==='initialize')return send(id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'contextpilot',version:'0.1.0'}});
 if(method==='ping')return send(id,{});
 if(method==='tools/list')return send(id,{tools});
 if(method==='tools/call'){
  try{
   const a=params.arguments||{};
   const value=params.name==='compact_text'?compactText(a.text,a):params.name==='read_file_slice'?await readFileSlice(root,a.file,a.startLine,a.lineCount):null;
   if(value===null)throw Error('Unknown tool');
   return send(id,{content:[{type:'text',text:JSON.stringify(value)}]});
  }catch(e){return send(id,{content:[{type:'text',text:e.message}],isError:true});}
 }
 process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,error:{code:-32601,message:'Unknown method'}})+'\n');
}
let input='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',chunk=>{
 input+=chunk;
 if(input.length>5000000)process.exit(1);
 let pos;
 while((pos=input.indexOf('\n'))>=0){
  const line=input.slice(0,pos);input=input.slice(pos+1);
  if(!line.trim())continue;
  try{handle(JSON.parse(line));}catch{process.stderr.write('Invalid JSON\n');}
 }
});
