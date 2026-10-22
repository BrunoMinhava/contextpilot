/** Conservative, deterministic transforms. Budgets are advisory, never truncation. */
export function compactText(text, {maxChars = 8000} = {}) {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  if (!Number.isSafeInteger(maxChars) || maxChars < 200 || maxChars > 100000) {
    throw new RangeError('maxChars must be an integer from 200 to 100000');
  }
  let output = text, strategy = 'preserve';
  if (text.length > maxChars) {
    // Validate JSON but do not serialize parsed numbers: that would round large integers,
    // discard duplicate keys and normalize numeric spellings.
    try {
      JSON.parse(text);
      let quoted = false, escaped = false, candidate = '';
      for (const ch of text) {
        if (quoted) {
          candidate += ch;
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') quoted = false;
        } else if (ch === '"') { quoted = true; candidate += ch; }
        else if (!/[\x20\t\r\n]/.test(ch)) candidate += ch;
      }
      if (candidate.length < text.length) { output = candidate; strategy = 'json-whitespace'; }
    } catch { /* Unknown text is preserved unless exact consecutive repetition exists. */ }
    if (strategy === 'preserve' && !text.includes('[contextpilot:')) {
      const lines = text.split('\n'), result = [];
      for (let i = 0; i < lines.length;) {
        let end = i + 1;
        while (end < lines.length && lines[end] === lines[i]) end++;
        const count = end - i;
        const marker = `[contextpilot: previous line repeated ${count} times total; source lines ${i + 1}-${end}]`;
        // Preserve diagnostics and code-looking content conservatively.
        const safe = /^(?:INFO\b|DEBUG\b|TRACE\b|\[INFO\]|\[DEBUG\])/.test(lines[i]) && !/error|warn|fail|exception|fatal|panic|traceback|assert/i.test(lines[i]);
        if (safe && count > 2 && lines[i].length + marker.length + 1 < (lines[i].length + 1) * count) {
          result.push(lines[i], marker);
        } else { for (let k = i; k < end; k++) result.push(lines[k]); }
        i = end;
      }
      const candidate = result.join('\n');
      if (candidate.length < text.length) { output = candidate; strategy = 'repeated-log-lines'; }
    }
  }
  return {text:output, originalChars:text.length, outputChars:output.length,
    omittedChars:text.length-output.length, strategy, budgetExceeded:output.length > maxChars,
    quality:{policy:'preserve-unknown-and-diagnostics', semanticQualityTested:false},
    units:'UTF-16 code units; not tokens'};
}
