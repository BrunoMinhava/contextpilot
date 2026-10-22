# ContextPilot v0.2.0

Local-first MCP tools for selective file reading, reversible compaction of verbose output, and character-count metrics. Node.js 20+; no dependencies or API key.

## Installation

```bash
git clone https://github.com/BrunoMinhava/contextpilot.git
cd contextpilot
npm test
```

Register in Codex CLI (replace absolute paths):

```bash
codex mcp add contextpilot --env CONTEXTPILOT_ROOT=/absolute/path/to/project -- node /absolute/path/to/contextpilot/src/server.js
```

For other MCP stdio clients, configure command `node`, argument `/absolute/path/to/contextpilot/src/server.js`, and environment variable `CONTEXTPILOT_ROOT`.

## MCP tools

- `compact_text(text, maxChars?)`: compact long text and keep original in local in-memory cache (up to 100 entries / 20 MB).
- `retrieve_context(id, start?, length?)`: recover any part of the original while the server is running.
- `read_file_slice(file, startLine?, lineCount?)`: read a selected range of project file lines.
- `contextpilot_stats()`: character-count metrics.

## Limitations

Agents must choose to call these tools. This release does not automatically intercept requests, change model reasoning levels, guarantee subscription quota savings, or measure actual model tokens. Character counts are not token counts. Cache is cleared on server restart. Be careful when handling secrets or confidential files.

## Tests

`npm test` runs unit and MCP stdio integration tests. GitHub Actions also runs tests. For real-world savings, compare identical coding tasks with and without the tool.

## License

MIT. Contributions welcome.
