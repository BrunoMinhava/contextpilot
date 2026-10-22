import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const directory=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'contextpilot-install-'));
// npm is invoked through its JS CLI so Windows .cmd shell quoting is unnecessary.
const npm=process.env.npm_execpath || process.env.CONTEXTPILOT_NPM_CLI;
if(!npm)throw Error('Run with npm run test:package');
const run=(args,cwd=directory)=>{const r=spawnSync(process.execPath,[npm,...args],{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);return r.stdout;};
try{
 const packed=JSON.parse(run(['pack','--json'],process.cwd()));
 const archive=path.resolve(packed[0].filename);
 fs.writeFileSync(path.join(directory,'package.json'),'{"private":true}');
 run(['install','--ignore-scripts','--no-audit','--no-fund',archive]);
 const cli=path.join(directory,'node_modules','contextpilot-mcp','src','cli.js');
 const r=spawnSync(process.execPath,[cli,'doctor'],{cwd:directory,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).ok,true);
 run(['install','--ignore-scripts','--no-audit','--no-fund',archive]);
 run(['uninstall','--ignore-scripts','--no-audit','--no-fund','contextpilot-mcp']);
 assert.equal(fs.existsSync(cli),false);
 console.log('Package install, reinstall, doctor and uninstall passed');
}finally{fs.rmSync(directory,{recursive:true,force:true})}
