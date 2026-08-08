# Claude Code Instructions for Aircall MCP Server

## What This Is

An **MCP (Model Context Protocol) server for the Aircall Public API**, maintained by Cassia Research. It provides 83 tools covering calls, transcriptions, AI insights, contacts, SMS, users, teams, numbers, tags, webhooks, dialer campaigns, and company info.

## Architecture

- `src/index.ts` — CLI entry point; parses `--api-id/--api-token/--tools/--read-only` flags and env vars.
- `src/server.ts` — `AircallMCPServer`: tool registration, category filtering, read-only filtering, MCP handlers. Exports `TOOL_CATEGORIES`.
- `src/tools/*.ts` — one file per category; each exports a `create<Category>Tools(client)` factory returning `{ tool_name: { description, parameters (zod), execute } }`.
- `src/types/aircall.ts` — API response types plus the `READ_ONLY_TOOLS` / `WRITE_TOOLS` registries (drive read-only mode and `readOnlyHint` annotations).
- `src/utils/auth.ts` — `AircallClient`: Basic auth, `/v1` base URL (paths starting `/v2/` hit API v2), error handling.
- `src/utils/format.ts` — `toIso()`: safe timestamp conversion (the API mixes UNIX seconds, ISO strings, and absent fields — never do `new Date(x * 1000)` directly).
- `src/utils/rate-limiter.ts` — client-side rate limiting (Aircall allows 60 req/min).
- `scripts/generate-tool-docs.mjs` — regenerates `docs/tools/README.md` from the built server (`npm run docs`).
- `manifest.json` + `.mcpbignore` — Claude Desktop extension packaging (`npm run bundle` → `aircall-mcp.mcpb`).

## Rules for changing tools

1. **Verify every endpoint against the official API reference** (https://developer.aircall.io/api-references/) or the Aircall Postman collection before adding or changing a tool. Earlier iterations of this codebase contained endpoints that never existed — do not trust existing code as documentation; the API reference is the only source of truth.
2. When adding a tool, update ALL of: the tool factory in `src/tools/`, `TOOL_CATEGORIES` in `src/server.ts`, and `READ_ONLY_TOOLS` or `WRITE_TOOLS` in `src/types/aircall.ts`.
3. Timestamps: always format with `toIso()` from `src/utils/format.ts`.
4. After changes: `npm run build && npm run lint && npm run docs`, then bump the version in `package.json`, `manifest.json`, `src/server.ts`, and `src/index.ts` (all four must match) and `npm run bundle`.
5. Tool annotations (`readOnlyHint`, `destructiveHint`, `title`) are computed in `server.ts#buildAnnotations` from the tool name and `READ_ONLY_TOOLS` — destructive means name matches `aircall_(delete|remove|update)_*`.

## Quick Setup for Claude Desktop

Preferred: install the `aircall-mcp.mcpb` extension (built with `npm run bundle`).

Manual config alternative:

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

## Common Use Cases

1. **Yesterday's calls with negative sentiment**: `aircall_list_calls` with from/to timestamps, then `aircall_get_sentiments` per call.
2. **Call review**: `aircall_get_transcript` + `aircall_get_summary` + `aircall_get_action_items` for a call_id.
3. **Connectivity check / troubleshooting**: `aircall_ping`.
4. **Find available agents**: `aircall_list_availabilities`.
5. **Contact from a call**: `aircall_get_call` for caller info, then `aircall_create_contact`.

Note: Conversation Intelligence tools require Aircall AI add-ons on the account; the API returns 403/404 without them.

## API Reference

All tools map to Aircall's REST API: https://developer.aircall.io/api-references/
