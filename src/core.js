import fs from 'node:fs/promises';
import path from 'node:path';
export function compactText(text, options = {}) {
  if (typeof text !== 'string') throw new TypeError('Expected text');
  const limit = Math.max(200, Math.min(100000, options.maxChars || 8000));
  if (text.length <= limit) return { text, originalChars: text.length, outputChars: text.length };
  const part = Math.floor((limit - 32) / 2);
  const result = text.slice(0, part) + '\n[... output omitted ...]\n' + text.slice(-part);
  return { text: result, originalChars: text.length, outputChars: result.length };
}
export async function readFileSlice(root, file, startLine = 1, lineCount = 100) {
  const base = await fs.realpath(root);
  const target = await fs.realpath(path.resolve(base, file));
  if (!target.startsWith(base + path.sep)) throw new Error('Outside project root');
  const stat = await fs.stat(target);
  if (!stat.isFile() || stat.size > 2000000) throw new Error('Unsupported file');
  const lines = (await fs.readFile(target, 'utf8')).split(/\r?\n/);
  const start = Math.max(1, Number(startLine) || 1);
  const count = Math.max(1, Math.min(500, Number(lineCount) || 100));
  return { totalLines: lines.length, text: lines.slice(start - 1, start - 1 + count).map((s,i) => (start+i)+': '+s).join('\n') };
}
