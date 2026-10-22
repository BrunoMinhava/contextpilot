# Windows 10/11

**Not locally validated.** Windows CI is configured, not certified. Requires Node.js 22.13+ with npm and a user-writable package directory. Use PowerShell; `npm.cmd` can be used where execution policy blocks npm.ps1.

The intended archive installation is:

```powershell
npm.cmd install --global .\contextpilot-mcp-0.3.0-alpha.1.tgz
contextpilot.cmd doctor
contextpilot.cmd benchmark
contextpilot.cmd config
```

This candidate has no Windows executable installer. Review cache-directory ACLs: POSIX mode checks do not provide Windows ACL enforcement. Do not store sensitive originals until this meets your requirements. See [Uninstall](UNINSTALL.md).
