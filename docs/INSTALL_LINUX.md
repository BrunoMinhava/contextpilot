# Linux

Local validation: Linux, Node 24.19.0. Install Node.js 22.13+ and npm, then follow [Quickstart](QUICKSTART.md). The tested automated procedure is `npm run test:package`: pack, install into an empty temporary project, run doctor, reinstall, uninstall and check removal. This does not validate a global npm prefix or a real agent.

Use `contextpilot config` in your target repository, then the client setup guide. Validate with `contextpilot doctor` and the client's MCP status. Updates currently require obtaining a newer reviewed archive and installing its exact filename with npm. See [Uninstall](UNINSTALL.md).
