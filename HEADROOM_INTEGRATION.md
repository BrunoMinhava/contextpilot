# ContextPilot / Headroom integration (experimental)

ContextPilot delegates agent wrapping to the **separately installed** [Headroom](https://github.com/headroomlabs-ai/headroom) CLI. Headroom is licensed Apache-2.0. ContextPilot does not copy, bundle, or relicense Headroom source. This integration is a wrapper, not a competing compression engine.

## Install

Requires Node.js 20+, Python 3.13 with uv, Headroom, and Codex CLI or Claude Code.

```bash
uv tool install --python 3.13 'headroom-ai[all]'
headroom doctor
npm install -g .
contextpilot doctor
contextpilot wrap codex
# or
contextpilot wrap claude
```

To undo, run `contextpilot unwrap codex` or `contextpilot unwrap claude`, as supported by the installed Headroom version.

## Verification

Run `npm test`. Tests cover the local MCP and CLI argument delegation. **Live Headroom + Codex/Claude compatibility is not yet verified** and requires real agent smoke tests. The compression/auto-wrapping behavior is provided by Headroom, not by ContextPilot's own MCP server.

No guaranteed subscription quota savings. Review Headroom's privacy and proxy behavior before using confidential code.
