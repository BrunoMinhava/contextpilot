import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));

test('benchmark-input accepts JSON arrays and does not echo user content', () => {
  const secret = 'PRIVATE_FIXTURE_DO_NOT_PRINT';
  const run = spawnSync(process.execPath, [cli, 'benchmark-input', '200'], {
    input: JSON.stringify([secret.repeat(20)]), encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  const report = JSON.parse(run.stdout);
  assert.equal(report.samples, 1);
  assert.equal(report.total.originalChars, secret.length * 20);
  assert.ok(!run.stdout.includes(secret));
});

test('benchmark-input rejects malformed input with a nonzero status', () => {
  const run = spawnSync(process.execPath, [cli, 'benchmark-input'], {
    input: '{"not":"an array"}', encoding: 'utf8',
  });
  assert.notEqual(run.status, 0);
});
