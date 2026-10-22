# Removal

If desired, delete this project's stored originals first, from that project directory:

```sh
contextpilot cache-clear --yes
```

This removes stored rows and metrics and vacuums the SQLite database, but is not a secure erase guarantee for backups, filesystem snapshots or SSD media. Repeat for each project as needed. `contextpilot stats` prints the exact cache path. Default directory: `.contextpilot/cache` under your user home. Stop all ContextPilot processes before removing database files manually.

Remove the MCP registration using the client's own interface. This version never automatically changes agent configuration, so there is no automatic backup or restore operation.

For a global package installation:

```sh
npm uninstall --global contextpilot-mcp
```

For a local package, run `npm uninstall contextpilot-mcp` in that package's parent project. Local installation/removal was tested in a temporary project. Windows/macOS behavior remains pending CI.
