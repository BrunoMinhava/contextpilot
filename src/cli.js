#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PersistentCache} from './storage.js';
import {benchmark} from './benchmark.js';
import {measurePayloads} from './payload-benchmark.js';
const args=process.argv.slice(2), command=args.shift()||'help';
const output=value=>console.log(JSON.stringify(value,null,2));
const options={root:process.env.CONTEXTPILOT_ROOT||process.cwd(),...(process.env.CONTEXTPILOT_CACHE_DIR?{directory:process.env.CONTEXTPILOT_CACHE_DIR}:{})};
let cache;
try{
 switch(command){
 case 'serve':await import('./server.js');break;
 case 'benchmark':{const result=benchmark();output(result);if(result.results.some(r=>!r.fixturePassed))process.exitCode=1;break;}
 case 'benchmark-input':{
  // Read a JSON array from stdin. Output contains only numeric measurements.
  // Do not use this command with secrets unless your terminal and shell history are trusted.
  const payloads=JSON.parse(fs.readFileSync(0,'utf8'));
  output(measurePayloads(payloads,{maxChars:args[0]===undefined?8000:Number(args[0])}));
  break;
 }
 case 'doctor':{
  const directory=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'contextpilot-doctor-'));
  try{const first=new PersistentCache({...options,directory});const r=first.put('INFO diagnostic\n'.repeat(100),200);first.close();const second=new PersistentCache({...options,directory});try{if(second.get(r.id,0,100000).text!=='INFO diagnostic\n'.repeat(100))throw Error('Recovery check failed');}finally{second.close()}
   output({ok:true,node:process.version,platform:process.platform,compressionAndRestartRecovery:'passed',agentIntegration:'not checked; use your agent MCP status',telemetry:false});
  }finally{fs.rmSync(directory,{recursive:true,force:true})}break;
 }
 case 'config':output({mcpServers:{contextpilot:{command:process.execPath,args:[fileURLToPath(new URL('./server.js',import.meta.url))],env:{CONTEXTPILOT_ROOT:fs.realpathSync(options.root),...(options.directory?{CONTEXTPILOT_CACHE_DIR:options.directory}:{})}}}});break;
 case 'stats':cache=new PersistentCache(options);output(cache.metrics());break;
 case 'compact':cache=new PersistentCache(options);output(cache.put(fs.readFileSync(0,'utf8'),args[0]===undefined?8000:Number(args[0])));break;
 case 'retrieve':cache=new PersistentCache(options);output(cache.get(args[0],args[1]===undefined?0:Number(args[1]),args[2]===undefined?8000:Number(args[2])));break;
 case 'cache-clear':if(args.length!==1||args[0]!=='--yes')throw Error('Run cache-clear --yes to delete cached originals and metrics for this project');cache=new PersistentCache(options);cache.clear();output({cleared:true,project:options.root});break;
 case 'help':case '--help':console.log(`ContextPilot 0.3.0-alpha.1 — Node.js 22.13+
Commands:
  serve                 Run MCP stdio server
  config                Print MCP config for this project (does not modify settings)
  doctor                Check compression and recovery across a database reopen
  compact [maxChars]    Read stdin; preserve original in project cache
  retrieve ID [start] [length]
  stats                 Show project character metrics, including retrieval cost
  benchmark             Run offline synthetic fixtures, no API required\n  benchmark-input [maxChars] Read JSON string array from stdin; output measurements only
  cache-clear --yes     Delete project cache contents and metrics
Environment: CONTEXTPILOT_ROOT, CONTEXTPILOT_CACHE_DIR
Agent tools must be explicitly used. Automatic interception is not implemented.`);break;
 default:throw Error(`Unknown command: ${command}. Run contextpilot --help.`);
 }
}catch(e){console.error(`ContextPilot: ${e.message}`);process.exitCode=1;}finally{cache?.close()}
