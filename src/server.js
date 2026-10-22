#!/usr/bin/env node
import {readFileSlice,ContextCache} from './core.js';
const root=process.env.CONTEXTPILOT_ROOT||process.cwd();
const cache=new ContextCache();
const tools=[
{name:'compact_text',description:'Compact verbose text and retain full original in local reversible cache. Retrieve by ID.',inputSchema:{type:'object',properties:{text:{type:'string'},maxChars:{type:'integer'}},required:['text']}},
{name:'retrieve_context',description:'Retrieve original cached text by ID and character offset.',inputSchema:{type:'object',properties:{id:{type:'string'},start:{type:'integer'},length:{type:'integer'}},required:['id']}},
{name:'read_file_slice',description:'Read selected lines from a project file (2MB maximum).',inputSchema:{type:'object',properties:{file:{type:'string'},startLine:{type:'integer'},lineCount:{type:'integer'}},required:['file']}},
{name:'contextpilot_stats',description:'Return local character compression statistics (not model token usage).',inputSchema:{type:'object',properties:{}}}
];
function send(id,result){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\n');}
function fail(id,code,message){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,error:{code,message}})+'\n');}
async function handle(msg){
 if(!msg||msg.jsonrpc!=='2.0')return;
 const {id,method,params={}}=msg;
 if(id===undefined)return;
 if(method==='initialize')return send(id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'contextpilot',version:'0.2.0'}});
 if(method==='ping')return send(id,{});
 if(method==='tools/list')return send(id,{tools});
 if(method==='tools/call'){
  try{
   const a=params.arguments||{};let value;
   switch(params.name){
    case 'compact_text':value=cache.put(a.text,a.maxChars);break;
    case 'retrieve_context':value=cache.get(a.id,a.start,a.length);break;
    case 'read_file_slice':value=await readFileSlice(root,a.file,a.startLine,a.lineCount);break;
    case 'contextpilot_stats':value=cache.metrics();break;
    default:return fail(id,-32602,'Unknown tool');
   }
   return send(id,{content:[{type:'text',text:JSON.stringify(value)}]});
  }catch(e){return send(id,{content:[{type:'text',text:e.message}],isError:true});}
 }
 return fail(id,-32601,'Unknown method');
}
let input='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',chunk=>{
 input+=chunk;if(input.length>5000000){process.stderr.write('Input too large\n');process.exit(1);}
 let pos;while((pos=input.indexOf('\n'))>=0){
  const line=input.slice(0,pos);input=input.slice(pos+1);
  if(!line.trim())continue;
  try{void handle(JSON.parse(line));}catch{fail(null,-32700,'Parse error');}
 }
});
