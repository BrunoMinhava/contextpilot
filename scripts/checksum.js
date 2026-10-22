import fs from 'node:fs';
import {createHash} from 'node:crypto';
const files=fs.readdirSync('.').filter(f=>/^contextpilot-mcp-.*\.tgz$/.test(f));
fs.writeFileSync('SHA256SUMS',files.map(f=>`${createHash('sha256').update(fs.readFileSync(f)).digest('hex')}  ${f}\n`).join(''));
