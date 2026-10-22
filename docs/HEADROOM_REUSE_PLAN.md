# Headroom reuse decision (technical review, 2026-10-22)

Upstream: https://github.com/headroomlabs-ai/headroom (Apache-2.0).
Relevant upstream documentation:
- https://github.com/headroomlabs-ai/headroom/blob/main/README.md
- https://github.com/headroomlabs-ai/headroom/blob/main/docs/content/docs/proxy.mdx
- https://github.com/headroomlabs-ai/headroom/blob/main/wiki/cli.md

## What to reuse and what NOT to copy blindly

Headroom already exposes Python/TypeScript libraries, an HTTP proxy, MCP tools and wrappers for Codex/Claude. The crucial distinction: an **MCP compression tool is opt-in**; automatic request modification requires an approved client hook, wrapper, middleware or a correctly routed proxy.

Do not paste the whole Headroom Python implementation into ContextPilot's Node.js runtime. That introduces a large runtime/dependency and security surface, may make our own product a repackaging, and does not itself establish compatibility. Prefer one of two clearly labelled options:

1. **Optional Headroom engine adapter** (quick compatibility path): install Headroom separately, check its exact CLI version and capabilities, delegate compression/proxy operation to it with explicit user consent, report the backend as `headroom`, preserve its notices and Apache-2.0 license. PR #2 explored this; evaluate it before rewriting. No claims of proprietary original engine.
2. **Original ContextPilot engine** (independent path): port specific algorithms or patterns only after reviewing their exact source, attribution requirements, third-party dependencies, API shape, test coverage and benchmark fixtures. Keep upstream NOTICE/attribution as required. Document every ported file and provenance in a dedicated THIRD_PARTY_NOTICES file.

A proxy MUST NOT be claimed safe simply because it starts. Test HTTP request and response schema preservation, streaming SSE, cancellation, authentication headers, provider selection, tool-call structure, timeout/retries, cost accounting, client rollback, and protection from credential leakage. Do not default to sending provider credentials to a different provider endpoint.

## Concrete architectural gap

The current `src/server.js` is a JSON-RPC-over-stdio MCP server, and `compact_text` receives text only if the agent chooses to call it. It does not intercept the model's own file reads or tool output. The current `doctor` reports agent integration as untested.

Headroom's documentation describes `wrap codex` using per-process CLI configuration overrides and `wrap claude` through proxy routing. Client compatibility can change by version and authentication mode. Implement and test a **real** client-specific adapter before promising transparent operation. In particular, distinguish Codex CLI from VS Code extension and API-key routing from subscription login; never assume they share identical interception paths.

## Recommended sequence

- First inspect PR #2's delegated Headroom wrapper. Decide whether it provides an honest, useful optional engine without obscuring provenance.
- Create a small adapter interface (`compress`, `retrieve`, `stats`, `health`) with explicit `engine: native|headroom`; fail closed if the selected backend is unavailable.
- Implement a mock-upstream integration test harness with deterministic streaming and tool-call payloads before touching real credentials. Mock tests alone are not a release gate.
- Validate on installed real Codex CLI and Claude Code binaries with recorded versions and reproducible traces. Verify token measurements with provider accounting, not UTF-16 character counts.
- Compare native ContextPilot vs delegated Headroom vs unmodified agent on the same tasks. Report the backend used for every measurement.

## License / attribution reminder

Apache-2.0 generally permits adaptation and redistribution with conditions, including preserving required license, copyright and NOTICE information, and marking modified files. Confirm the actual source files and dependency licenses before importing code. This is a technical planning note, not legal advice.
