# Aircall MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

> **MCP server for the Aircall Public API** — 83 tools for calls, transcriptions, AI insights, contacts, SMS, users, teams, and more. Works with Claude Desktop, Claude Code, Cursor, and any MCP-compatible AI assistant. Maintained by [Cassia Research](https://github.com/CassiaResearch).

Every tool is verified against the [official Aircall API reference](https://developer.aircall.io/api-references/). Tools carry MCP annotations (`readOnlyHint`, `destructiveHint`, titles), so clients like Claude Desktop can group read-only tools and gate destructive ones.

**Not an official Aircall product.** This is a community server built and maintained by Cassia Research.

## Installation

### Claude Desktop — one-click extension (recommended)

This is our default integration path. No Node.js or config-file editing required for end users — Claude Desktop runs the server on its own bundled runtime.

**Build the extension:**

```bash
npm install
npm run bundle   # builds TypeScript and packs aircall-mcp.mcpb
```

**Install it:**

1. Share `aircall-mcp.mcpb` with your team (Slack, Drive, or this repo's Releases).
2. Double-click it (or Claude Desktop → Settings → Extensions → Advanced settings → Install extension…).
3. Enter your **Aircall API ID** and **API Token** — created in the Aircall Dashboard under **Integrations & API → API Keys**. The token is stored in your OS keychain.
4. Optionally enable **Read-only mode** to expose only the 36 read tools.

To ship an update: bump the version (see [CLAUDE.md](CLAUDE.md)), run `npm run bundle` again, and have users double-click the new file — it updates in place, keeping their saved credentials.

### Claude Desktop / Cursor — manual config

```json
{
  "mcpServers": {
    "aircall": {
      "command": "npx",
      "args": ["-y", "@cassiaresearch/aircall-mcp-server"],
      "env": {
        "AIRCALL_API_ID": "your_api_id",
        "AIRCALL_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

### CLI

```bash
npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy

# Read-only mode
npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy --read-only

# Only specific categories
npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy --tools=calls,contacts
```

## Tools (83)

| Category | Tools | Highlights |
|----------|-------|------------|
| Calls | 24 | list/search calls, transcription, AI summary, sentiments, topics, action items, predicted CSAT, custom summary, playbook results, evaluations, comments, tags, archive/unarchive, transfer, recording controls, insight cards, AI Voice Agent outbound calls |
| Contacts | 12 | CRUD plus phone number and email management |
| Users | 10 | CRUD, availability, start call, dial, user numbers (API v2) |
| Teams | 6 | CRUD and membership |
| Numbers | 5 | list/get/update, music & messages, A2P registration status |
| Tags | 5 | CRUD |
| Webhooks | 5 | CRUD |
| Messages | 5 | send SMS/MMS, agent-conversation send, number messaging configuration |
| Dialer | 6 | per-user power dialer campaigns |
| Company | 5 | ping (connectivity test), company info, integration enable/disable |

Full per-tool documentation with parameters: [docs/tools/README.md](docs/tools/README.md) (generated from the server itself via `npm run docs`).

## Configuration

| Option | Env var | Description |
|--------|---------|-------------|
| `--api-id` | `AIRCALL_API_ID` | Aircall API ID (required) |
| `--api-token` | `AIRCALL_API_TOKEN` | Aircall API token (required) |
| `--read-only` | `AIRCALL_READ_ONLY=true` | Expose only read tools (36) |
| `--tools=...` | `AIRCALL_TOOLS` | Comma-separated tools or categories; `all` (default) or `read` |

Notes:

- Authentication is HTTP Basic with the org-level `api_id:api_token` pair.
- Requests are rate-limited client-side to respect Aircall's 60 req/min limit.
- Conversation Intelligence tools (transcription, summary, sentiments, topics, action items, CSAT, playbooks, evaluations) require the corresponding Aircall AI add-ons on your account — without them the API returns 403/404.

## Development

```bash
npm install
npm run build        # compile TypeScript to dist/
npm run lint         # eslint
npm run docs         # regenerate docs/tools/README.md from the built server
npm run bundle       # build + pack aircall-mcp.mcpb (Claude Desktop extension)
```

## License

MIT — see [LICENSE](LICENSE).
