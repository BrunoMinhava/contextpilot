# Quickstart (alpha)

Requires Node.js 22.13+ and npm. No API key required. From the checked-out candidate branch:

```sh
npm test
node src/cli.js doctor
node src/cli.js benchmark
npm pack
npm install --global ./contextpilot-mcp-0.3.0-alpha.1.tgz
contextpilot --help
contextpilot doctor
contextpilot benchmark
```

Global installation requires a user-writable npm prefix; do not run with administrator privileges just to bypass permission failures. The automated test uses an isolated local install instead: `npm run test:package`.

From the project you want to work on, run `contextpilot config`. This prints a generic MCP stdio configuration with absolute paths. Register it using your client's official setup interface. It does not edit or overwrite settings.

To see a real local transformation without an agent, from the source checkout:

```sh
node -e "process.stdout.write('INFO heartbeat\n'.repeat(1000))" | node src/cli.js compact 800
node src/cli.js stats
```

The compact command prints an ID. To recover the complete demonstration:

```sh
contextpilot retrieve ID_FROM_OUTPUT 0 20000
```

Use the same project directory, operating-system account and cache directory. Requests are measured in UTF-16 code units, not model tokens. Protocol overhead is excluded. Retrieval can make net savings negative.
