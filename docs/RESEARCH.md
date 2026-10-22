# Preliminary research — 2026-10-22

This is a targeted source inspection, **not the full competitive audit requested for release**. No source from the following projects was copied into ContextPilot. No head-to-head execution or novelty claim is supported.

| Project | Evidence inspected | Decision |
| --- | --- | --- |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | `headroom/transforms/content_router.py`, `crates/headroom-core/src/ccr/backends/sqlite.rs`, `tests/test_content_router_token_units.py`, LICENSE (Apache-2.0) | Routing, persistent reversible caching, expiry and metric-unit discipline already exist. Do not claim these as differentiators. |
| [Serena](https://github.com/oraios/serena) | `src/serena/tools/symbol_tools.py`, including GPL-3.0-or-later SPDX header | LSP symbol navigation is established; do not copy GPL code into this MIT package. Full license review pending. |
| [LLMLingua](https://github.com/microsoft/LLMLingua) | `llmlingua/prompt_compressor.py` (MIT header) | Learned compression adds model/runtime dependencies and requires quality evaluation; not included. |
| [Aider](https://github.com/Aider-AI/aider) | `aider/repomap.py`; repository metadata Apache-2.0 | Tree-sitter tags, cached maps and model-aware budgets are established. Full code/license review pending. |
| [Continue](https://github.com/continuedev/continue) | `core/indexing/CodeSnippetsIndex.ts`; metadata Apache-2.0 | Symbol snippets already have SQLite cache keys and source ranges; full index invalidation review pending. |
| [MCP Servers](https://github.com/modelcontextprotocol/servers) | `src/filesystem/index.ts` | Canonical paths and protocol-era compatibility need careful handling. Full license/SDK migration review pending. |
| Agent Browser | Requested `stackblitz-labs/agent-browser` returned GitHub 404 | Do not silently substitute an unverified repository. |

Headroom source inspection was at tree `fetched main on 2026-10-22`; not all reference files were pinned to commit IDs. Reproducible competitor experiments must pin versions before any comparison.

## Candidate improvements and measurement

1. **Evidence-preserving transformations:** exact JSON token spelling and counted repeated log runs. Low runtime cost; risks include changed model interpretation. Implemented fixture checks; task success still unmeasured. Not claimed novel.
2. **Retrieval-adjusted accounting:** gross compression can hide recovery cost. Implemented net payload character accounting. Requires tokenizer, tool-envelope and provider usage reconciliation before token claims.
3. **Change-aware reads:** full-content hashes avoid stale unchanged responses. Implemented optional knownHash. Only safe when the caller retains the relevant content; does not supply long-term semantic memory.
4. **Conservative fallback:** retain unknown content despite budget pressure. Implemented, with explicit budgetExceeded. Tradeoff is less compression, measured in the unique-code fixture.

Next research gate: inspect competitor regression suites/issues in depth, run equivalent task corpora under baseline/Headroom/ContextPilot, record model/version/settings, seed where supported, provider usage, latency, recovery frequency and independent task tests. No such run has occurred here.
