import {performance} from 'node:perf_hooks';
import {compactText} from './compression.js';

/**
 * Repeatable, input-driven benchmark harness.
 * Caller supplies real captured payloads; this does not call a model or claim token savings.
 * No prompt content is persisted or logged.
 */
export function measurePayloads(payloads, {maxChars = 8000, repetitions = 5} = {}) {
  if (!Array.isArray(payloads) || payloads.length === 0 || payloads.length > 1000) {
    throw new RangeError('payloads must be a nonempty array of at most 1000 strings');
  }
  if (!Number.isSafeInteger(repetitions) || repetitions < 1 || repetitions > 100) {
    throw new RangeError('repetitions must be between 1 and 100');
  }
  const results = payloads.map((text, index) => {
    if (typeof text !== 'string' || Buffer.byteLength(text) > 2_000_000) {
      throw new TypeError('each payload must be a string of at most 2 MB');
    }
    let compact;
    const start = performance.now();
    for (let i = 0; i < repetitions; i++) compact = compactText(text, {maxChars});
    const elapsed = performance.now() - start;
    return {
      index,
      strategy: compact.strategy,
      originalChars: compact.originalChars,
      returnedChars: compact.outputChars,
      omittedChars: compact.omittedChars,
      budgetExceeded: compact.budgetExceeded,
      averageMilliseconds: Number((elapsed / repetitions).toFixed(4)),
    };
  });
  const total = results.reduce((a, r) => ({
    originalChars: a.originalChars + r.originalChars,
    returnedChars: a.returnedChars + r.returnedChars,
    omittedChars: a.omittedChars + r.omittedChars,
  }), {originalChars: 0, returnedChars: 0, omittedChars: 0});
  return {
    schemaVersion: 1,
    engine: 'contextpilot-native',
    samples: results.length,
    repetitions,
    total,
    results,
    measurement: 'UTF-16 character counts and local wall-clock time; NOT tokens, cost, or agent quality',
    caveat: 'Caller must independently assess semantic fidelity and real-agent performance.',
  };
}
