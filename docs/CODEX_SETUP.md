# Codex setup status

The server implements the 2025-03-26 MCP stdio handshake and four tools. A subprocess JSON-RPC integration test passes locally. **No actual Codex CLI, application or VS Code extension was available for this validation.** Protocol tests are not real-agent tests.

Run `contextpilot config` in the repository to generate command, args and environment settings. Use the official MCP setup instructions to register them: https://developers.openai.com/codex/mcp . Preserve any existing configuration before changes. No model or reasoning setting needs to change.

After registration, verify the client sees all four tools, ask it to compact a repeated log, retrieve the returned ID, restart the server and retrieve again. This remains a manual acceptance test. No automatic interception or guaranteed use of MCP tools is claimed.
