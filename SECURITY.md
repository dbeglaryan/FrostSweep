# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce, if possible
4. Allow reasonable time for a fix before public disclosure

## Scope

FrostSweep is a local desktop application. Security concerns include:
- Path traversal in file operations
- Symlink following during file moves
- Config file injection
- Local API endpoint abuse (the backend only binds to 127.0.0.1)

## Design Decisions

- The Python backend binds exclusively to `127.0.0.1` (localhost), never to `0.0.0.0`
- File operations validate paths before execution
- No external network calls are made
- Config files are JSON with no code execution
