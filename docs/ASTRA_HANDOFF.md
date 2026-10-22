# Astra handoff — 2026-10-22

This document records independent review work performed while the Codex session was rate-limited. It is **not** a claim that the product is complete.

## Branches and merge order

- PR #3 (`feat/conservative-compression`) remains the alpha foundation. Keep draft.
- PR #4 (`review/mcp-protocol-regression-tests`) targets PR #3, **not main**. It adds MCP subprocess regression tests and adversarial compression preservation tests. Review CI and merge into PR #3 only after inspecting the changes.
- Do not overwrite or reset uncommitted work from the interrupted Codex session. Run `git status` and inspect `git diff` before pulling/cherry-picking.

## Current verified architecture

- Four opt-in MCP tools; no transparent Codex/Claude tool-output interception.
- Conservative JSON-whitespace and repeated INFO/DEBUG/TRACE log-line compaction.
- SQLite persistent originals scoped to project; character accounting is **not** token accounting.
- `doctor` checks storage and restart, not real agent integration.
- CI/package smoke tests are necessary but insufficient for real client compatibility.

## Highest-priority remaining work (do not mark done without evidence)

1. **Recover local work** from the interrupted Codex session. Check branches, worktree, uncommitted files, stash and commits before writing new code.
2. **Prove real client compatibility**. In a controlled temporary project, install supported Codex CLI and Claude Code versions, register ContextPilot through each client's documented supported integration mechanism, invoke tools, capture actual protocol traces and verify teardown. If credentials/executables are unavailable, mark this blocked explicitly; never simulate an agent result.
3. **Choose and validate the automatic integration architecture**. MCP tool registration alone is not automatic interception. Document which output surfaces can be intercepted through officially supported hooks/proxy features; verify against current client documentation and real binaries. If full interception is unsupported, narrow the promise rather than claiming it works.
4. **Safety**: preserve original diagnostics, prevent cache leaks, check file-system race conditions, symlink attacks, project boundaries, SQLite file and WAL permissions (especially Windows), and memory/CPU bounds on large inputs. Test failure paths and recovery.
5. **Honest benchmarks**: compare unmodified baseline, ContextPilot and Headroom on the same coding tasks and model/client settings. Record provider token accounting where available, prompt/response latency, output quality, failures, retrieval overhead and reproducible raw traces. Character reduction is not token or subscription-quota savings.
6. **Installer lifecycle**: explicit consent, configuration backups, idempotent install, version diagnostics, rollback and uninstall; validate each platform and agent. Never silently rewrite user settings.
7. Only then tackle AST/LSP repository memory and dashboard, unless a proven integration blocker requires them sooner.

## Release gate

Stable release is **blocked** until real Codex and Claude Code integrations, reproducible benchmark evidence, security review and a validated installation/uninstallation workflow exist. Keep unverified functionality and platform claims out of the README marketing sections.
