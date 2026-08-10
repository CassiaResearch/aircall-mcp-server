# Aircall MCP Server

**Type**: Single-package TypeScript MCP server (stdio transport)
**Framework**: `@modelcontextprotocol/sdk` + zod, compiled with TypeScript 6.0 (NodeNext ESM)
**Purpose**: Exposes the Aircall Public API as 83 MCP tools, distributed to non-technical users as a one-click Claude Desktop extension (`.mcpb`)

## Overview

Maintained by Cassia Research. Wraps `https://api.aircall.io/v1` (and selected `/v2` endpoints) with Basic auth, client-side rate limiting, and per-tool MCP annotations so clients like Claude Desktop can group read-only tools (36) apart from write tools (47) and gate destructive ones.

## Commands

```bash
npm install            # install all deps (dev included)
npm run build          # tsc -> dist/
npm run dev            # tsc --watch
npm start              # run the built server (needs AIRCALL_API_ID/AIRCALL_API_TOKEN)
npm run lint           # eslint src (flat config, eslint 10) — 2 no-console warnings in
                       # src/index.ts are EXPECTED (intentional CLI output); do not "fix" them
npm run lint:fix       # eslint with autofix
npm run typecheck      # tsc --noEmit
npm run docs           # regenerate docs/tools/README.md from the BUILT server (build first)
npm run bundle         # full pipeline: install -> build -> prune prod -> pack aircall-mcp.mcpb (~2.7MB) -> reinstall dev deps
```

There is NO test suite (`npm test` does not exist). Verification is the stdio smoke test below —
expect an initialize response naming `aircall-mcp-server` and a tools/list of 83 tools (36 in
read-only mode with `AIRCALL_READ_ONLY=true`):

```bash
(printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 2) \
  | AIRCALL_API_ID=test AIRCALL_API_TOKEN=test node dist/index.js
```

## Directory Structure

```
src/
  index.ts             CLI entry: --api-id/--api-token/--tools/--read-only flags + env fallbacks
  server.ts            AircallMCPServer: registration, category/read-only filtering, MCP handlers,
                       buildAnnotations(); exports TOOL_CATEGORIES
  tools/
    calls.ts           24 tools incl. transcription + all Conversation Intelligence endpoints
    contacts.ts        12 tools (CRUD + phone/email management)
    users.ts           10 tools (CRUD, availability, start_call, dial, v2 user numbers)
    teams.ts           6 tools
    numbers.ts         5 tools (update_messages goes through PUT /numbers/:id)
    tags.ts            5 tools
    webhooks.ts        5 tools
    messages.ts        5 tools (send via /numbers/:id/messages/send + configuration)
    dialer.ts          6 tools (campaigns are PER-USER: /users/:user_id/dialer_campaign)
    company.ts         5 tools (ping, company, integration enable/disable)
  types/aircall.ts     API response types + READ_ONLY_TOOLS / WRITE_TOOLS registries
  utils/
    auth.ts            AircallClient: Basic auth, /v1 base ('/v2/...' paths hit v2), error handling
    format.ts          toIso(): safe timestamp conversion
    rate-limiter.ts    client-side limiter (Aircall allows 60 req/min)
scripts/
  generate-tool-docs.mjs   spawns dist/index.js, dumps tools/list into docs/tools/README.md
docs/                  guides + generated tool reference
manifest.json          MCPB extension manifest (user_config form, env mapping)
.mcpbignore            what stays out of the .mcpb bundle
.github/workflows/release.yml   tag-triggered release (builds + attaches .mcpb)
```

## Key Patterns

Every tool lives in a category factory and returns `{ description, parameters (zod), execute }`:

```typescript
// src/tools/<category>.ts
export function createCallsTools(client: AircallClient) {
  return {
    aircall_get_summary: {
      description: 'Get the AI-generated summary of a call.',
      parameters: getCallSchema, // zod schema, converted via toJsonSchemaCompat
      execute: async (params: z.infer<typeof getCallSchema>) => {
        const result = await client.get<{ summary: CallSummary }>(
          `/calls/${params.call_id}/summary`
        );
        return { call_id: result.summary.call_id, summary: result.summary.content };
      },
    },
  };
}
```

Adding a tool touches THREE places or it silently won't register / won't annotate:
1. The factory in `src/tools/<category>.ts`
2. `TOOL_CATEGORIES` in `src/server.ts`
3. `READ_ONLY_TOOLS` or `WRITE_TOOLS` in `src/types/aircall.ts`

Annotations are derived, not declared: `server.ts#buildAnnotations` marks tools read-only via
`READ_ONLY_TOOLS` membership and destructive when the name matches `aircall_(delete|remove|update)_*`.

## Gotchas / Non-obvious Patterns

- **Never trust existing code as API documentation.** Earlier iterations of this codebase contained ~20 endpoints that never existed. Verify every path, method, and response shape against the official reference (https://developer.aircall.io/api-references/ — Slate HTML; there is NO published OpenAPI spec) or the official Aircall Postman workspace (https://www.postman.com/aircall-tech-partnerships-team/aircall-api/overview).
- **Aircall returns 403 (not 401) for bad credentials.** An all-tools-403 report almost always means wrong/stale credentials, not permissions. The server pings `/v1/ping` at startup and logs a verdict.
- **Credentials are read only at process launch.** Changing them in Claude Desktop's extension settings does nothing until Claude Desktop is fully quit and reopened. This is written on the config form — keep it there.
- **Claude Desktop stores `sensitive` user_config values encrypted** (`__encrypted_...` prefix) in `~/Library/Application Support/Claude/Claude Extensions Settings/<ext>.json`. Never edit that file's token by hand; it must go through the UI.
- **Timestamps are inconsistent across the API** (UNIX seconds, ISO strings, or absent — e.g. `/company` has no `created_at`). Always convert with `toIso()`; never `new Date(x * 1000)` directly.
- **Contact update is `POST /contacts/:id`, not PUT.** Dialer campaigns are per-user singletons. "Update Music and Messages" is `PUT /numbers/:id` with a `messages` body. Update-contact-style quirks are the norm, not the exception.
- **Conversation Intelligence endpoints are entitlement-gated**: transcription/summary/topics/sentiments/action items need the AI Assist add-on; custom summary/playbook results/realtime transcription need AI Assist Pro. Without them the API returns 403 (or 404 when a resource simply wasn't generated). Transcripts only exist for recorded calls with an external participant, and transcription must be enabled per phone number.
- **`zod` is a v4 direct dependency** — `z.record()` requires explicit key and value types.
- **TypeScript is pinned `<6.1`** because typescript-eslint doesn't support TS 7 (no stable compiler API until 7.1). `tsconfig.json` sets `"types": ["node"]` explicitly — required by TS 6+ and TS 7's defaults.
- **The version lives in FOUR files** that must stay in sync: `package.json`, `manifest.json`, `src/server.ts`, `src/index.ts`. The release workflow fails the build on mismatch.
- **`docs/tools/README.md` is generated** — never hand-edit it; change the tools and run `npm run docs`.

## Dos and Don'ts

**Do:**
- Run `npm run build && npm run lint && npm run docs` after any tool change
- Bump all four version locations together, then `npm run bundle`
- Release via tag: commit, `git tag vX.Y.Z && git push origin main vX.Y.Z` — CI builds and attaches the `.mcpb` to a GitHub Release
- Keep `manifest.json` `user_config` descriptions accurate — they are the only UI text users see
- Use `client.get/post/put/delete` from `AircallClient`; prefix `/v2/` for v2 endpoints

**Don't:**
- Don't add an endpoint without verifying it in the official API reference first
- Don't hand-edit `docs/tools/README.md` or the `aircall-mcp.mcpb` contents
- Don't run destructive API calls (delete/update/send/call) when testing against real credentials — test with read-only endpoints (`/ping`, `/company`, `/calls`)
- Don't put real credentials in code, tests, or commits — env vars only
- Don't rename existing tools casually: users' saved tool permissions in Claude Desktop are keyed by tool name

## End-user setup (for reference)

Preferred: install the `aircall-mcp.mcpb` extension from GitHub Releases (built with `npm run bundle`). Credentials come from Aircall Dashboard → Integrations & API → API Keys (copy ID and token from the same key; token is 32-char lowercase hex, shown once). After any credential change: fully quit and reopen Claude Desktop.

Manual MCP config alternative:

```json
{
  "mcpServers": {
    "aircall": {
      "command": "npx",
      "args": ["-y", "@cassiaresearch/aircall-mcp-server"],
      "env": { "AIRCALL_API_ID": "...", "AIRCALL_API_TOKEN": "..." }
    }
  }
}
```

## Related

- Official API reference: https://developer.aircall.io/api-references/
- Official Postman workspace: https://www.postman.com/aircall-tech-partnerships-team/aircall-api/overview
- Developer guides index: https://developer.aircall.io/llms.txt
- Generated tool reference: docs/tools/README.md
- Getting started guide: docs/guides/getting-started.md
- Release workflow: .github/workflows/release.yml

**Last Verified**: 2026-08-10
