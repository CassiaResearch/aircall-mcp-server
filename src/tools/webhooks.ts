// Aircall Webhooks Tools
// Webhook management for real-time event notifications

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  WebhooksListResponse,
  WebhookResponse,
  Webhook,
  WebhookEvent,
} from '../types/aircall.js';

// Available webhook events
const webhookEvents: WebhookEvent[] = [
  'call.created',
  'call.ringing_on_agent',
  'call.agent_declined',
  'call.answered',
  'call.transferred',
  'call.ended',
  'call.voicemail_left',
  'call.tagged',
  'call.untagged',
  'call.commented',
  'call.archived',
  'call.assigned',
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'user.created',
  'user.updated',
  'user.deleted',
  'user.connected',
  'user.disconnected',
  'user.opened',
  'user.closed',
  'user.wut_started',
  'user.wut_ended',
  'number.created',
  'number.deleted',
  'number.opened',
  'number.closed',
  'message.created',
  'message.received',
];

// Schema definitions
export const listWebhooksSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
});

export const getWebhookSchema = z.object({
  webhook_id: z.string().describe('The webhook ID'),
});

export const createWebhookSchema = z.object({
  url: z.string().url().describe('URL to receive webhook events'),
  events: z
    .array(z.enum(webhookEvents as [WebhookEvent, ...WebhookEvent[]]))
    .describe('List of events to subscribe to'),
});

export const updateWebhookSchema = z.object({
  webhook_id: z.string().describe('The webhook ID'),
  url: z.string().url().optional().describe('New URL'),
  events: z
    .array(z.enum(webhookEvents as [WebhookEvent, ...WebhookEvent[]]))
    .optional()
    .describe('New list of events'),
  active: z.boolean().optional().describe('Enable or disable the webhook'),
});

export const deleteWebhookSchema = z.object({
  webhook_id: z.string().describe('The webhook ID to delete'),
});

// Helper to format webhook for output
function formatWebhook(webhook: Webhook) {
  return {
    id: webhook.webhook_id,
    direct_link: webhook.direct_link,
    url: webhook.url,
    active: webhook.active,
    created_at: toIso(webhook.created_at),
    events: webhook.events,
    event_count: webhook.events.length,
  };
}

// Tool implementations
export function createWebhooksTools(client: AircallClient) {
  return {
    aircall_list_webhooks: {
      description: 'List all configured webhooks. Webhooks send real-time notifications for events like calls, contacts, and user status changes.',
      parameters: listWebhooksSchema,
      execute: async (params: z.infer<typeof listWebhooksSchema>) => {
        const result = await client.get<WebhooksListResponse>('/webhooks', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          webhooks: result.webhooks.map(formatWebhook),
          available_events: webhookEvents,
        };
      },
    },

    aircall_get_webhook: {
      description: 'Get detailed information about a specific webhook including its subscribed events.',
      parameters: getWebhookSchema,
      execute: async (params: z.infer<typeof getWebhookSchema>) => {
        const result = await client.get<WebhookResponse>(`/webhooks/${params.webhook_id}`);
        return formatWebhook(result.webhook);
      },
    },

    aircall_create_webhook: {
      description: 'Create a new webhook to receive real-time event notifications at a URL.',
      parameters: createWebhookSchema,
      execute: async (params: z.infer<typeof createWebhookSchema>) => {
        const result = await client.post<WebhookResponse>('/webhooks', {
          url: params.url,
          events: params.events,
        });
        return {
          success: true,
          message: 'Webhook created successfully',
          webhook: formatWebhook(result.webhook),
          token: result.webhook.token, // Include token for verification
        };
      },
    },

    aircall_update_webhook: {
      description: 'Update a webhook\'s URL, events, or active status.',
      parameters: updateWebhookSchema,
      execute: async (params: z.infer<typeof updateWebhookSchema>) => {
        const { webhook_id, ...updateData } = params;
        const result = await client.put<WebhookResponse>(`/webhooks/${webhook_id}`, updateData);
        return {
          success: true,
          message: 'Webhook updated successfully',
          webhook: formatWebhook(result.webhook),
        };
      },
    },

    aircall_delete_webhook: {
      description: 'Delete a webhook. The URL will no longer receive event notifications.',
      parameters: deleteWebhookSchema,
      execute: async (params: z.infer<typeof deleteWebhookSchema>) => {
        await client.delete(`/webhooks/${params.webhook_id}`);
        return {
          success: true,
          message: 'Webhook deleted successfully',
          webhook_id: params.webhook_id,
        };
      },
    },
  };
}
