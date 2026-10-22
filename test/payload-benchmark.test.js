import test from 'node:test';
import assert from 'node:assert/strict';
import {measurePayloads} from '../src/payload-benchmark.js';

test('real-payload benchmark reports exact character totals and no token claims', () => {
  const input = ['INFO heartbeat\n'.repeat(100), '{"message": "keep  spaces"}', 'ERROR critical\n'.repeat(100)];
  const result = measurePayloads(input, {maxChars: 200, repetitions: 2});
  assert.equal(result.samples, 3);
  assert.equal(result.total.originalChars, input.reduce((n, s) => n + s.length, 0));
  assert.equal(result.total.originalChars - result.total.returnedChars, result.total.omittedChars);
  assert.ok(result.results.every(r => r.averageMilliseconds >= 0));
  assert.match(result.measurement, /NOT tokens/);
  assert.equal(result.results[2].strategy, 'preserve');
  assert.ok(!JSON.stringify(result).includes('heartbeat'));
});

test('benchmark refuses excessive or malformed workloads', () => {
  assert.throws(() => measurePayloads([]), /payloads/);
  assert.throws(() => measurePayloads([12]), /string/);
  assert.throws(() => measurePayloads(['x'], {repetitions: 0}), /repetitions/);
  assert.throws(() => measurePayloads(['x'.repeat(2_000_001)]), /2 MB/);
});
