# Windows 10/11

**Package tests passed in Windows GitHub Actions on Node 22.13.0 and 24.** [Run](https://github.com/BrunoMinhava/contextpilot/actions/runs/39711271736). Interactive client setup, ACL enforcement and global installation remain unvalidated; the symlink test is skipped on Windows. Requires Node.js 22.13+ with npm and a user-writable package directory. Use PowerShell; `npm.cmd` can be used where execution policy blocks npm.ps1.

The intended archive installation is:

```powershell
npm.cmd install --global .\contextpilot-mcp-0.3.0-alpha.1.tgz
contextpilot.cmd doctor
contextpilot.cmd benchmark
contextpilot.cmd config
```

This candidate has no Windows executable installer. Review cache-directory ACLs: POSIX mode checks do not provide Windows ACL enforcement. Do not store sensitive originals until this meets your requirements. See [Uninstall](UNINSTALL.md).
