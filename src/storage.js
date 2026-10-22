import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {compactText} from './compression.js';

const hash = value => createHash('sha256').update(value).digest('hex');
function positive(value, name) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer`);
  return value;
}
function privateDirectory(directory) {
  // Reject existing symlink components, including custom storage roots.
  let current = path.parse(directory).root;
  for (const part of directory.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try { if (fs.lstatSync(current).isSymbolicLink()) throw Error('Cache directory must not contain symlinks'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; fs.mkdirSync(current,{mode:0o700}); }
  }
  if (process.platform !== 'win32') {
    const stat = fs.statSync(directory);
    if (stat.uid !== process.getuid() || (stat.mode & 0o077)) throw Error('Cache directory must be owned by you with mode 0700');
  }
}
export class PersistentCache {
  constructor({root=process.cwd(), directory=path.join(os.homedir(),'.contextpilot','cache'), maxEntries=1000, maxBytes=20000000, ttlMs=86400000, now=Date.now}={}) {
    this.project=hash(fs.realpathSync(root));
    this.directory=path.resolve(directory);
    this.maxEntries=positive(maxEntries,'maxEntries');this.maxBytes=positive(maxBytes,'maxBytes');this.ttlMs=positive(ttlMs,'ttlMs');this.now=now;
    privateDirectory(this.directory);
    this.file=path.join(this.directory,`${this.project}.sqlite`);
    try { const s=fs.lstatSync(this.file);if(!s.isFile()||s.nlink!==1)throw Error('Unsafe cache file'); }
    catch(e){if(e.code!=='ENOENT')throw e;const fd=fs.openSync(this.file,'wx',0o600);fs.closeSync(fd);}
    if(process.platform!=='win32') fs.chmodSync(this.file,0o600);
    this.db=new DatabaseSync(this.file);
    this.db.exec(`PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS entries(id TEXT PRIMARY KEY, text TEXT NOT NULL, bytes INTEGER NOT NULL, expires INTEGER NOT NULL, touched INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS metrics(name TEXT PRIMARY KEY, value INTEGER NOT NULL);`);
    this.cleanup();
  }
  transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const value=fn();this.db.exec('COMMIT');return value;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  count(name,n=1){this.db.prepare('INSERT INTO metrics VALUES (?,?) ON CONFLICT(name) DO UPDATE SET value=value+excluded.value').run(name,n);}
  cleanup(){this.db.prepare('DELETE FROM entries WHERE expires<=?').run(this.now());}
  put(text,maxChars=8000){
    const result=compactText(text,{maxChars});
    const bytes=Buffer.byteLength(text);if(bytes>this.maxBytes)throw Error('Item exceeds cache size');
    const id=hash(this.project+'\0'+text), now=this.now();
    this.transaction(()=>{
      this.cleanup();
      const exists=this.db.prepare('SELECT 1 FROM entries WHERE id=?').get(id);
      this.count(exists?'cacheHits':'cacheMisses');
      this.db.prepare('INSERT OR REPLACE INTO entries VALUES (?,?,?,?,?)').run(id,text,bytes,now+this.ttlMs,now);
      while(true){
        const size=this.db.prepare('SELECT count(*) AS n,coalesce(sum(bytes),0) AS bytes FROM entries').get();
        if(size.n<=this.maxEntries&&size.bytes<=this.maxBytes)break;
        this.db.prepare('DELETE FROM entries WHERE id=(SELECT id FROM entries WHERE id<>? ORDER BY touched,id LIMIT 1)').run(id);
        this.count('evictions');
      }
      this.count('operations');this.count('originalChars',text.length);this.count('returnedChars',result.outputChars);
    });
    return {id,...result,expiresAt:now+this.ttlMs};
  }
  get(id,start=0,length=8000){
    if(typeof id!=='string'||! /^[a-f0-9]{64}$/.test(id))throw Error('Invalid context ID');
    if(!Number.isSafeInteger(start)||start<0)throw Error('start must be a nonnegative integer');
    if(!Number.isSafeInteger(length)||length<1||length>100000)throw Error('length must be between 1 and 100000');
    return this.transaction(()=>{
      this.cleanup();
      const row=this.db.prepare('SELECT text FROM entries WHERE id=?').get(id);
      if(!row) return null;
      const text=row.text.slice(start,start+length);
      this.count('retrievals');this.count('retrievalChars',text.length);
      this.db.prepare('UPDATE entries SET touched=? WHERE id=?').run(this.now(),id);
      return {id,totalChars:row.text.length,start,text};
    }) ?? (()=>{throw Error('Context not found (expired, evicted, or different project)');})();
  }
  metrics(){
    this.cleanup();const values=Object.fromEntries(this.db.prepare('SELECT * FROM metrics').all().map(r=>[r.name,r.value]));
    const size=this.db.prepare('SELECT count(*) AS cacheEntries,coalesce(sum(bytes),0) AS cacheBytes FROM entries').get();
    return {...values,...size,netCharactersAvoided:(values.originalChars||0)-(values.returnedChars||0)-(values.retrievalChars||0),
      note:'Payload UTF-16 code units only; excludes protocol overhead. Not tokens, billing or subscription quota.', cachePath:this.file};
  }
  clear(){this.transaction(()=>{this.db.exec('DELETE FROM entries; DELETE FROM metrics;');});this.db.exec('VACUUM');}
  close(){this.db.close();}
}
