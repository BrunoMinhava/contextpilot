# Contributing

Use Node.js 22.13+. Run `npm test`, `npm run test:package`, and `npm run benchmark`. Include a failing regression for changed behavior. Keep stdout clean in MCP mode. Never label characters as tokens or count a mocked provider as a live integration.

Prefer conservative passthrough to guessed semantic fidelity. Document persistence, expiry and configuration changes. Do not add third-party source without reviewing its license and attribution requirements.
