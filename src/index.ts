#!/usr/bin/env node

// Aircall MCP Server - CLI Entry Point
// Maintained by Cassia Research: https://github.com/CassiaResearch/aircall-mcp-server
// Usage: npx @cassiaresearch/aircall-mcp-server --api-id=ID --api-token=TOKEN

import { AircallMCPServer, type AircallMCPConfig } from './server.js';

// Parse command line arguments
function parseArgs(): AircallMCPConfig {
  const args = process.argv.slice(2);
  const config: AircallMCPConfig = {};

  for (const arg of args) {
    if (arg.startsWith('--api-id=')) {
      config.apiId = arg.slice('--api-id='.length);
    } else if (arg.startsWith('--api-token=')) {
      config.apiToken = arg.slice('--api-token='.length);
    } else if (arg.startsWith('--tools=')) {
      config.tools = arg.slice('--tools='.length);
    } else if (arg === '--read-only') {
      config.readOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log('aircall-mcp-server v2.0.2');
      process.exit(0);
    }
  }

  // Check environment variables as fallback
  if (!config.apiId) {
    config.apiId = process.env.AIRCALL_API_ID;
  }
  if (!config.apiToken) {
    config.apiToken = process.env.AIRCALL_API_TOKEN;
  }
  if (!config.tools && process.env.AIRCALL_TOOLS) {
    config.tools = process.env.AIRCALL_TOOLS;
  }
  if (process.env.AIRCALL_READ_ONLY === 'true') {
    config.readOnly = true;
  }

  return config;
}

function printHelp(): void {
  console.log(`
Aircall MCP Server
MCP server for the Aircall Public API, maintained by Cassia Research.

USAGE:
  npx @cassiaresearch/aircall-mcp-server [OPTIONS]

OPTIONS:
  --api-id=ID         Aircall API ID (or set AIRCALL_API_ID env var)
  --api-token=TOKEN   Aircall API Token (or set AIRCALL_API_TOKEN env var)
  --tools=TOOLS       Comma-separated list of tools or categories to enable
                      Special values: "all" (default), "read" (read-only tools)
                      Categories: calls, contacts, users, teams, numbers,
                                 tags, webhooks, messages, dialer, company
  --read-only         Enable read-only mode (disable all write operations)
  --help, -h          Show this help message
  --version, -v       Show version

EXAMPLES:
  # All tools
  npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy

  # Read-only mode
  npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy --read-only

  # Specific categories
  npx @cassiaresearch/aircall-mcp-server --api-id=xxx --api-token=yyy --tools=calls,contacts

  # Using environment variables
  AIRCALL_API_ID=xxx AIRCALL_API_TOKEN=yyy npx @cassiaresearch/aircall-mcp-server

AVAILABLE TOOLS (83):
  Calls:       list, get, search, transcript, realtime_transcript, summary,
               sentiments, topics, action_items, predicted_csat, custom_summary,
               playbook_result, evaluations, add_comment, add_tags, archive,
               unarchive, transfer, pause/resume_recording, delete_recording,
               delete_voicemail, push_insight_card, trigger_agent_call
  Contacts:    list, search, get, create, update, delete, add/update/delete_phone,
               add/update/delete_email
  Users:       list, get, create, update, delete, check_availability,
               list_availabilities, start_call, dial, get_user_numbers
  Teams:       list, get, create, delete, add_user, remove_user
  Numbers:     list, get, update, update_messages, get_registration_status
  Tags:        list, get, create, update, delete
  Webhooks:    list, get, create, update, delete
  Messages:    send, send_agent, create_config, get_config, delete_config
  Dialer:      get_campaign, create_campaign, delete_campaign,
               get_campaign_numbers, add_campaign_numbers, remove_campaign_number
  Company:     ping, get_company, get_integration, enable_integration,
               disable_integration

DOCUMENTATION:
  https://github.com/CassiaResearch/aircall-mcp-server
`);
}

async function main(): Promise<void> {
  const config = parseArgs();

  if (!config.apiId || !config.apiToken) {
    console.error('Error: Aircall API credentials required.');
    console.error('Set AIRCALL_API_ID and AIRCALL_API_TOKEN environment variables');
    console.error('or use --api-id and --api-token flags.');
    console.error('Run with --help for more information.');
    process.exit(1);
  }

  try {
    const server = new AircallMCPServer(config);
    console.error(`Aircall MCP Server initialized with ${server.getToolCount()} tools`);

    if (config.readOnly) {
      console.error('Running in read-only mode');
    }

    await server.run();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
