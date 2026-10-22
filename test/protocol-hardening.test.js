import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';

const server = fileURLToPath(new URL('../src/server.js', import.meta.url));

function launch() {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'contextpilot-protocol-'));
  const child = spawn(process.execPath, [server], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {...process.env, CONTEXTPILOT_CACHE_DIR: directory},
  });
  let output = '';
  const responses = [];
  const waiters = [];
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    output += chunk;
    let newline;
    while ((newline = output.indexOf('\n')) >= 0) {
      const line = output.slice(0, newline);
      output = output.slice(newline + 1);
      const message = JSON.parse(line);
      const waiter = waiters.shift();
      if (waiter) waiter(message);
      else responses.push(message);
    }
  });
  const receive = () => responses.length ? Promise.resolve(responses.shift()) : new Promise(resolve => waiters.push(resolve));
  const request = async raw => {
    child.stdin.write(raw + '\n');
    return Promise.race([
      receive(),
      new Promise((_, reject) => setTimeout(() => reject(Error('MCP response timeout')), 5000)),
    ]);
  };
  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    fs.rmSync(directory, {recursive: true, force: true});
  };
  return {child, request, stop};
}

test('malformed JSON returns a parse error and the server stays responsive', async () => {
  const agent = launch();
  try {
    const malformed = await agent.request('{"jsonrpc":"2.0",');
    assert.equal(malformed.error.code, -32700);
    const ping = await agent.request(JSON.stringify({jsonrpc: '2.0', id: 10, method: 'ping'}));
    assert.equal(ping.id, 10);
    assert.deepEqual(ping.result, {});
  } finally { await agent.stop(); }
});

test('null and array params are rejected without terminating the server', async () => {
  const agent = launch();
  try {
    for (const [id, params] of [[11, null], [12, []]]) {
      const response = await agent.request(JSON.stringify({jsonrpc: '2.0', id, method: 'tools/list', params}));
      assert.equal(response.id, id);
      assert.equal(response.error.code, -32602);
    }
    const ping = await agent.request(JSON.stringify({jsonrpc: '2.0', id: 13, method: 'ping'}));
    assert.deepEqual(ping.result, {});
  } finally { await agent.stop(); }
});

test('oversized unterminated input is rejected with a nonzero exit', async () => {
  const agent = launch();
  try {
    const exited = once(agent.child, 'exit');
    agent.child.stdin.on('error', () => {}); // EPIPE is expected on input rejection.
    agent.child.stdin.write('x'.repeat(5_000_001));
    const [code] = await Promise.race([
      exited,
      new Promise((_, reject) => setTimeout(() => reject(Error('Oversized input was not rejected')), 5000)),
    ]);
    assert.notEqual(code, 0);
  } finally { await agent.stop(); }
});
