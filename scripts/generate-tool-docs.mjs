#!/usr/bin/env node
// Generates docs/tools/README.md from the built server's tools/list output.
// Run: npm run docs (requires npm run build first)

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { TOOL_CATEGORIES } from '../dist/server.js';

const CATEGORY_META = {
  calls: ['Calls', 'Call history, transcriptions, AI insights, and in-call actions'],
  contacts: ['Contacts', 'Contact directory CRUD, phone numbers, and emails'],
  users: ['Users', 'User management, availability, and outbound calling'],
  teams: ['Teams', 'Team management and membership'],
  numbers: ['Numbers', 'Phone number configuration and compliance'],
  tags: ['Tags', 'Call tagging'],
  webhooks: ['Webhooks', 'Real-time event notifications'],
  messages: ['Messages', 'SMS/MMS sending and number messaging configuration'],
  dialer: ['Dialer', 'Per-user power dialer campaigns'],
  company: ['Company', 'Connectivity, account info, and integration state'],
};

function listTools() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js'], {
      env: { ...process.env, AIRCALL_API_ID: 'docs', AIRCALL_API_TOKEN: 'docs' },
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    let buf = '';
    proc.stdout.on('data', (d) => {
      buf += d;
      for (const line of buf.split('\n')) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id === 2) {
            proc.kill();
            resolve(msg.result.tools);
            return;
          }
        } catch { /* partial line */ }
      }
    });
    proc.on('error', reject);
    setTimeout(() => { proc.kill(); reject(new Error('timeout')); }, 10000);
    proc.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'docs', version: '1.0' } } }) + '\n' +
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n' +
      JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n'
    );
  });
}

function paramLines(schema) {
  const props = schema?.properties ?? {};
  const required = new Set(schema?.required ?? []);
  return Object.entries(props).map(([name, p]) => {
    const type = p.type ?? (p.anyOf ? 'mixed' : 'object');
    const req = required.has(name) ? 'required' : 'optional';
    const desc = p.description ? ` - ${p.description}` : '';
    return `- \`${name}\` (${type}, ${req})${desc}`;
  });
}

const tools = await listTools();
const byName = new Map(tools.map((t) => [t.name, t]));

let md = `# Aircall MCP Server - Tool Reference

Complete reference for all ${tools.length} tools. This file is generated from the
server itself - regenerate with \`npm run docs\` after changing any tool.

## Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
`;

const sections = [];
for (const [key, names] of Object.entries(TOOL_CATEGORIES)) {
  if (key === 'integrations') continue; // alias of company subset
  const [title, desc] = CATEGORY_META[key];
  const present = names.filter((n) => byName.has(n));
  md += `| [${title}](#${title.toLowerCase()}) | ${present.length} | ${desc} |\n`;

  let sec = `\n---\n\n## ${title}\n`;
  for (const name of present) {
    const t = byName.get(name);
    const a = t.annotations ?? {};
    const badges = [a.readOnlyHint ? 'read-only' : 'write', a.destructiveHint ? 'destructive' : null]
      .filter(Boolean)
      .join(', ');
    sec += `\n### ${name}\n\n${t.description}\n\n*${badges}*\n`;
    const params = paramLines(t.inputSchema);
    sec += params.length
      ? `\n**Parameters:**\n${params.join('\n')}\n`
      : '\n**Parameters:** none\n';
  }
  sections.push(sec);
}

md += sections.join('');
writeFileSync('docs/tools/README.md', md);
console.log(`docs/tools/README.md generated (${tools.length} tools)`);
