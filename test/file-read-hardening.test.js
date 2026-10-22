import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {readFileSlice} from '../src/core.js';

test('bounded file reads preserve line numbering and hashes', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'contextpilot-read-'));
  try {
    await fs.writeFile(path.join(root, 'notes.txt'), 'first\nsecond\nthird');
    const first = await readFileSlice(root, 'notes.txt', 2, 1);
    assert.equal(first.text, '2: second');
    assert.equal(first.unchanged, false);
    const again = await readFileSlice(root, 'notes.txt', 1, 1, first.hash);
    assert.equal(again.unchanged, true);
    await fs.writeFile(path.join(root, 'notes.txt'), 'updated');
    const changed = await readFileSlice(root, 'notes.txt', 1, 1, first.hash);
    assert.equal(changed.unchanged, false);
    assert.notEqual(changed.hash, first.hash);
  } finally { await fs.rm(root, {recursive: true, force: true}); }
});

test('rejects project escape and files exceeding 2 MB', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'contextpilot-read-'));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'contextpilot-outside-'));
  try {
    await fs.writeFile(path.join(outside, 'secret.txt'), 'secret');
    await assert.rejects(readFileSlice(root, path.join(outside, 'secret.txt')), /Outside project root/);
    await fs.writeFile(path.join(root, 'large.txt'), Buffer.alloc(2_000_001, 65));
    await assert.rejects(readFileSlice(root, 'large.txt'), /max 2MB/);
  } finally {
    await fs.rm(root, {recursive: true, force: true});
    await fs.rm(outside, {recursive: true, force: true});
  }
});
