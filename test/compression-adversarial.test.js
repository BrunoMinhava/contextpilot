import test from 'node:test';
import assert from 'node:assert/strict';
import {compactText} from '../src/compression.js';

// Deterministic fuzzing: no external packages or flaky randomness.
function* samples(count = 200) {
  let state = 0x51f15e;
  const alphabet = 'abcXYZ0123 {}[]:,"\\\\\n\t🙂';
  for (let i = 0; i < count; i++) {
    let result = '';
    const length = 300 + i * 7;
    for (let j = 0; j < length; j++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      result += alphabet[Math.abs(state >>> 0) % alphabet.length];
    }
    yield result;
  }
}

test('unknown content never loses information in deterministic fuzz corpus', () => {
  for (const source of samples()) {
    const result = compactText(source, {maxChars: 200});
    assert.equal(result.text, source);
    assert.equal(result.strategy, 'preserve');
    assert.equal(result.originalChars, source.length);
    assert.equal(result.omittedChars, 0);
  }
});

test('diagnostic lines are not folded, including mixed case and assertions', () => {
  for (const prefix of ['ERROR', 'WARN', 'FATAL', 'Exception', 'TRACEBACK', 'INFO ERROR', 'DEBUG assertion failed']) {
    const source = (prefix + ': important detail\n').repeat(150);
    const result = compactText(source, {maxChars: 200});
    assert.equal(result.text, source, prefix);
  }
});

test('JSON whitespace compaction preserves parsed structure and string values', () => {
  const source = JSON.stringify({
    text: '  spaces  \\n \\t \\"quoted\\" ',
    nested: [{value: 'a b'}, {value: '🙂'}],
    number: 9007199254740991,
  }, null, 4).repeat(1);
  const padded = '\n  ' + source + ' \n ';
  const result = compactText(padded, {maxChars: 200});
  assert.deepEqual(JSON.parse(result.text), JSON.parse(padded));
  assert.ok(result.outputChars <= padded.length);
});

test('compaction never pretends to meet a budget when preservation is necessary', () => {
  const source = 'A'.repeat(10000);
  const result = compactText(source, {maxChars: 200});
  assert.equal(result.text, source);
  assert.equal(result.budgetExceeded, true);
  assert.equal(result.units, 'UTF-16 code units; not tokens');
});
