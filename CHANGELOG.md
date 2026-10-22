# Changelog

## 0.3.0-alpha.1 (unreleased)

- Replace head/tail truncation with conservative JSON whitespace and repeated-log transforms.
- Persist project-isolated originals in SQLite, with TTL, deduplication and bounded live payloads.
- Add retrieval-adjusted character metrics, file hashes, CLI checks and offline fixtures.
- Add package installation/reinstallation/removal testing and a cross-platform CI matrix.
- Require Node.js 22.13+ for built-in SQLite.
- Change the `contextpilot` executable to a CLI; use `contextpilot serve` for stdio MCP. Existing direct `node src/server.js` registrations remain valid.
- Keep production release blocked pending real-agent and platform validation and outstanding features.
