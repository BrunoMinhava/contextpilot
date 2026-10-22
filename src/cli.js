#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
const HELP=`ContextPilot v0.3 — Headroom integration (experimental)
Usage: contextpilot doctor | wrap codex|claude | unwrap codex|claude | proxy | dashboard | perf
Install Headroom separately: uv tool install --python 3.13 'headroom-ai[all]'
Headroom is a separate Apache-2.0 project: https://github.com/headroomlabs-ai/headroom
`;
export function parse(args){
 const [command,...rest]=args;
 if(!command||['help','--help','-h'].includes(command))return {help:true};
 if(['doctor','dashboard','perf'].includes(command)){if(rest.length)throw Error('Unexpected arguments');return {command,args:[]};}
 if(command==='proxy')return {command,args:rest};
 if(['wrap','unwrap'].includes(command)){
  if(!['codex','claude'].includes(rest[0]))throw Error('Specify codex or claude');
  if(command==='unwrap'&&rest.length!==1)throw Error('Unexpected arguments');
  return {command,args:rest};
 }
 throw Error('Unknown command: '+command);
}
export function run(args,spawn=spawnSync,out=process.stdout,err=process.stderr){
 let p;try{p=parse(args)}catch(e){err.write(e.message+'\n'+HELP);return 2}
 if(p.help){out.write(HELP);return 0}
 const r=spawn('headroom',[p.command,...p.args],{stdio:'inherit',shell:false});
 if(r.error){err.write('Headroom unavailable: '+r.error.message+'\nInstall the Headroom CLI first.\n');return 1}
 return r.status??1;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)process.exitCode=run(process.argv.slice(2));
