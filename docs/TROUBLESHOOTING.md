# Troubleshooting

- `node:sqlite` unavailable: use Node.js 22.13 or newer. Some Node releases print an experimental SQLite warning on stderr.
- Cache permissions error: use an existing user-owned directory with mode 0700, or let ContextPilot create a dedicated new directory. Symlink components are rejected. On macOS use the canonical path if a temporary location includes `/var` or `/tmp` symlinks.
- Context not found: verify project root, account and cache directory; entries expire after 24 hours or can be evicted by limits.
- No apparent savings: unknown content is preserved; unique code is not compressed. This is intentional.
- Negative net characters avoided: retrieved originals cost additional context. Metrics explicitly subtract these payloads.
- MCP stdout cannot be parsed: use `serve` (or `src/server.js`) as the server command, not the default CLI help command.
- Agent ignores the tools: tools are opt-in; no automatic interception exists.
