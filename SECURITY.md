# Security (alpha)

Threat model: a trusted local account and trusted repository directory, accessed by an explicitly configured MCP client. This is not a sandbox for hostile local processes that can concurrently replace path components.

Original text is persisted in plaintext SQLite. POSIX cache directories must be owned by the user and mode 0700; database files use 0600. Existing cache symlinks and hardlinked database files are rejected. Windows ACL enforcement is not implemented. Cache defaults are 1000 entries, 20 MB of live UTF-8 payload, and 24-hour absolute TTL. These limits do not bound database/journal file size. Cleanup occurs on open and cache operations, not while the program is stopped. Metrics retain aggregate counters, not original text.

File reading checks canonical root containment and a 2 MB size limit. Same-user concurrent filesystem mutation remains a TOCTOU risk. Sensitive files under an explicitly allowed root can be returned: no secret detector is claimed. Configure only repositories you trust and do not send secrets to the compaction tool.

No telemetry or outbound requests are implemented. Agent/model behavior is outside this package. Content is untrusted tool data, not instructions. Prompt injection detection is not implemented.

Security tests cover traversal rejection, project isolation, invalid cache IDs and cache symlink refusal. This is not an independent security audit. Do not post secrets in public issues; report a minimal sanitized reproduction through the repository's available private vulnerability-reporting channel, if enabled.
