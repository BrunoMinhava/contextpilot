# ContextPilot

**0.3.0-alpha.1 — experimental, not production-ready.** Local MCP tools for conservative context compression and project-isolated recovery. No API key, model download, runtime npm dependencies or telemetry. Requires **Node.js 22.13+** (Node 24 recommended).

## What works

- JSON whitespace removal without rounding large integers or discarding duplicate keys.
- Folding identical consecutive INFO/DEBUG/TRACE log lines, preserving their count and source line range.
- Preserving unknown text, code and diagnostic lines instead of cutting the middle to meet a budget.
- SQLite originals that survive restarts, project-specific IDs, deduplication, expiry and bounded live payload storage.
- File slices with content hashes and opt-in suppression of unchanged reads.
- MCP stdio, CLI diagnostics, offline benchmarks and character metrics that subtract retrieval cost.

These are tool-level optimizations. Agents must choose to use the tools. Sending already-read text to `compact_text` can cost more overall. Use selective reading before loading large files. No claim of lower subscription quota or better task success is made.

## Try from source

```sh
git clone https://github.com/BrunoMinhava/contextpilot.git
cd contextpilot
git checkout feat/conservative-compression
npm test
node src/cli.js doctor
node src/cli.js benchmark
npm run test:package
```

The branch is a review candidate, not a released package. See [quickstart](docs/QUICKSTART.md) for packaging and [release status](docs/RELEASE_STATUS.md) for unmet requirements. Do not install an unrelated package from npm by guessing its name.

## Commands

`contextpilot --help`, `serve`, `config`, `doctor`, `compact`, `retrieve`, `stats`, `benchmark`, `cache-clear --yes`.

Automatic agent configuration, `install`, `wrap`, `update`, `uninstall`, dashboard, proxy, AST/LSP retrieval and token accounting are **not implemented**. npm handles package installation/removal. `config` prints a generic MCP configuration; it does not edit settings.

## Documentation

[Quickstart](docs/QUICKSTART.md) · [Windows](docs/INSTALL_WINDOWS.md) · [macOS](docs/INSTALL_MACOS.md) · [Linux](docs/INSTALL_LINUX.md) · [Codex](docs/CODEX_SETUP.md) · [Claude](docs/CLAUDE_SETUP.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [FAQ](docs/FAQ.md) · [Uninstall](docs/UNINSTALL.md) · [Architecture](docs/ARCHITECTURE.md) · [Research](docs/RESEARCH.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md).

## MCP tools

`compact_text(text, maxChars?)`, `retrieve_context(id, start?, length?)`, `read_file_slice(file, startLine?, lineCount?, knownHash?)`, `contextpilot_stats()`.

`maxChars` is advisory. Content is preserved when the available transformation cannot safely meet it. Reduced representations are not guaranteed to preserve downstream model quality. Recovery works only while originals remain in the cache.

MIT. No competitor source code is bundled.
