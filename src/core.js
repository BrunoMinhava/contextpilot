import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {compactText} from './compression.js';
export {compactText} from './compression.js';
export async function readFileSlice(root,file,startLine=1,lineCount=100,knownHash){
 if(typeof file!=='string'||!file)throw Error('file is required');
 const base=await fs.realpath(root),target=await fs.realpath(path.resolve(base,file));
 if(target!==base&&!target.startsWith(base+path.sep))throw Error('Outside project root');
 // Open the resolved path without following a final symlink on POSIX.
 // Check the opened descriptor, not only a path that could change between calls.
 const flags=constants.O_RDONLY|(process.platform==='win32'?0:constants.O_NOFOLLOW);
 const handle=await fs.open(target,flags);
 let content;
 try{
  const stat=await handle.stat();
  if(!stat.isFile()||stat.size>2000000)throw Error('Unsupported file (max 2MB)');
  const current=await fs.realpath(target);
  if(current!==target)throw Error('File changed during validation');
  const pathStat=await fs.stat(target);
  if(pathStat.dev!==stat.dev||pathStat.ino!==stat.ino)throw Error('File changed during validation');
  const buffer=Buffer.alloc(2000001);
  let total=0;
  while(total<buffer.length){
   const {bytesRead}=await handle.read(buffer,total,buffer.length-total,total);
   if(!bytesRead)break;
   total+=bytesRead;
  }
  if(total>2000000)throw Error('Unsupported file (max 2MB)');
  content=buffer.toString('utf8',0,total);
 }finally{await handle.close();}
 const hash=crypto.createHash('sha256').update(content).digest('hex');
 if(knownHash===hash)return {file:path.relative(base,target),hash,unchanged:true};
 const lines=content.split(/\r?\n/);
 const start=Math.max(1,Math.trunc(Number(startLine)||1)),count=Math.max(1,Math.min(500,Math.trunc(Number(lineCount)||100)));
 return {file:path.relative(base,target),hash,unchanged:false,totalLines:lines.length,startLine:start,text:lines.slice(start-1,start-1+count).map((s,i)=>`${start+i}: ${s}`).join('\n')};
}
export class ContextCache{
 constructor(maxEntries=100,maxBytes=20000000){this.items=new Map();this.maxEntries=maxEntries;this.maxBytes=maxBytes;this.bytes=0;this.stats={originalChars:0,returnedChars:0,operations:0,retrievalChars:0,retrievals:0};}
 put(text,maxChars=8000){
  if(typeof text!=='string')throw TypeError('text must be a string');
  if(Buffer.byteLength(text)>this.maxBytes)throw Error('Item exceeds cache size');
  const id=crypto.createHash('sha256').update(text).digest('hex').slice(0,24),bytes=Buffer.byteLength(text);
  if(this.items.has(id)){this.bytes-=this.items.get(id).bytes;this.items.delete(id);}
  this.items.set(id,{text,bytes});this.bytes+=bytes;
  while(this.items.size>this.maxEntries||this.bytes>this.maxBytes){const key=this.items.keys().next().value;this.bytes-=this.items.get(key).bytes;this.items.delete(key);}
  const compact=compactText(text,{maxChars});
  this.stats.originalChars+=text.length;this.stats.returnedChars+=compact.outputChars;this.stats.operations++;
  return {id,...compact,estimatedCharactersAvoided:compact.omittedChars};
 }
 get(id,start=0,length=8000){
  const item=this.items.get(id);if(!item)throw Error('Context not found (cache may have evicted it)');
  const offset=Math.max(0,Math.trunc(Number(start)||0)),size=Math.max(1,Math.min(100000,Math.trunc(Number(length)||8000)));
  const text=item.text.slice(offset,offset+size);
  this.stats.retrievalChars+=text.length;this.stats.retrievals++;
  return {id,totalChars:item.text.length,start:offset,text};
 }
 metrics(){return {...this.stats,estimatedCharactersAvoided:this.stats.originalChars-this.stats.returnedChars-this.stats.retrievalChars,cacheEntries:this.items.size,cacheBytes:this.bytes,note:'Character counts are not tokenizer counts or subscription quota measurements.'};}
}
