# Release gate: BLOCKED — 0.3.0-alpha.1

Validated locally on Linux, Node 24.19.0:

- Unit and subprocess MCP tests, including preservation, persistence, expiry, deduplication, project separation, traversal, symlink rejection and changed-file hash invalidation.
- npm archive installation into an empty temporary project, diagnostic execution, reinstall, uninstall and removal check.
- Four synthetic compression fixtures; raw results in `benchmarks/local-results.json`. These are character counts, not token usage or task success. No competitor was executed.

Not validated: Windows, macOS, minimum Node 22.13 runtime, global installation, Codex CLI/application/VS Code, Claude Code, provider token accounting, live coding task quality, security under hostile filesystem mutation. CI is configured to cover OS/Node/package tests but must actually pass before those are claimed validated.

Outstanding requested product requirements:

- Complete competitive code/test/issue audit and license review.
- AST/LSP semantic repository maps and symbol retrieval.
- Task-adaptive selection, semantic fidelity evaluation and full context budget tracking.
- Automatic integration wizard with consent, backups, rollback and verification.
- `install`, `wrap`, `update`, `uninstall` commands, local dashboard and proxy.
- Session histories, latency/CPU/memory measurements, tokenizer/provider accounting.
- Controlled agent benchmarks versus baseline and Headroom.
- Windows cache ACL validation, independent security review and hardening of filesystem race handling.
- Signed/versioned downloadable release with verified platform instructions.

No stable release should be published from this candidate. Existing character metrics must never be advertised as subscription savings. The installation examples explicitly distinguish tested local packaging from unvalidated platform/client procedures.
