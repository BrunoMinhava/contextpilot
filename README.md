# ContextPilot

Open-source, local-first MCP utilities for selective file reading and compacting noisy output. **Early MVP v0.1.0**.

## Requirements

Node.js 20 or newer. No runtime dependencies or API keys.

## Install

```bash
git clone https://github.com/BrunoMinhava/contextpilot.git
cd contextpilot
npm test
```

## Configure Codex CLI

```bash
codex mcp add contextpilot --env CONTEXTPILOT_ROOT=/absolute/path/to/your/project -- node /absolute/path/contextpilot/src/server.js
```

For other MCP-compatible clients, configure a stdio server with command `node`, argument `/absolute/path/contextpilot/src/server.js`, and environment variable `CONTEXTPILOT_ROOT` pointing to your project.

## Tools

- `compact_text`: keeps the start and end of long text. This **discards** the middle; use for noisy logs, not critical content.
- `read_file_slice`: reads a specified range of lines from a file within the configured project root.

These tools must currently be selected by the agent. This MVP does **not** automatically intercept requests, change model reasoning settings, guarantee subscription quota savings, or measure real token usage. File reading is capped at 2 MB, and the server does not write project files.

## Roadmap

Reversible local cache, token benchmarks, smarter syntax-aware selection, optional agent hooks.

## License

MIT. Contributions welcome.
