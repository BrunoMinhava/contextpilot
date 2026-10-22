# Architecture decision

Retain the existing Node MCP package and tool contracts, while replacing unsafe truncation. Compression is a pure deterministic module. SQLite provides transaction-safe storage across processes with stable project-scoped SHA-256 IDs. Built-in SQLite avoids a native npm build dependency but raises the minimum Node version to 22.13.

Unknown content passes through; budgets do not authorize deletion. JSON token spelling is preserved with a lexical whitespace pass after syntax validation. Log folding retains run counts and line ranges. Semantic model quality remains unmeasured.

File slices are read freshly and hashed. A caller may provide knownHash only when it still has the required content. No stale file-content cache is reused. This is not an AST/LSP symbol index.

MCP stdio remains the existing minimal transport, protocol version 2025-03-26. It requires future SDK/conformance review before broad compatibility claims. There is no proxy, provider authentication handling or request rewriting.
