import {spawn} from 'node:child_process';
import {compactText} from './compression.js';

/** Explicit backend selection; no invisible fallback to another compressor. */
export function createEngine({backend='native'}={}) {
 if(backend==='native')return {name:'native',async compact(text,{maxChars=8000}={}){return compactText(text,{maxChars});}};
 if(backend!=='headroom')throw Error('Unsupported engine; expected native or headroom');
 return {name:'headroom',async compact(){
  throw Error('Headroom compression API is not configured; use its documented wrap/proxy CLI or native backend');
 }};
}

/** Safely execute a separately installed CLI, never via a shell. */
export async function runHeadroom(args,{binary='headroom',cwd=process.cwd(),env=process.env,timeoutMs=30000}={}) {
 if(!Array.isArray(args)||args.some(x=>typeof x!=='string'||x.includes('\0')))throw TypeError('Invalid arguments');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<100||timeoutMs>120000)throw RangeError('Invalid timeout');
 return new Promise((resolve,reject)=>{
  const child=spawn(binary,args,{cwd,env,stdio:['ignore','pipe','pipe'],shell:false});
  let stdout='',stderr='',settled=false;
  const done=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve(value);};
  const timer=setTimeout(()=>{child.kill();done(Error('Headroom command timed out'));},timeoutMs);
  const capture=(stream,key)=>stream.on('data',chunk=>{
   const current=key==='stdout'?stdout:stderr;
   if(Buffer.byteLength(current)+chunk.length>1000000){child.kill();done(Error('Headroom output limit exceeded'));return;}
   if(key==='stdout')stdout+=chunk.toString();else stderr+=chunk.toString();
  });
  capture(child.stdout,'stdout');capture(child.stderr,'stderr');
  child.once('error',error=>done(error));
  child.once('close',(code,signal)=>done(null,{code,signal,stdout,stderr}));
 });
}
