// Aircall Messages/SMS Tools
// SMS & WhatsApp messaging via /v1/numbers/:id/messages/*

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';

// Schema definitions
export const sendMessageSchema = z.object({
  number_id: z.number().describe('Aircall number ID to send from (must have messaging enabled)'),
  to: z.string().describe('Phone number to send to (E.164 format)'),
  body: z.string().describe('Message content (max 1600 characters)'),
  media_url: z
    .array(z.string())
    .optional()
    .describe('Optional media URLs to attach (MMS)'),
});

export const sendAgentMessageSchema = z.object({
  number_id: z.number().describe('Aircall number ID the conversation belongs to'),
  to: z.string().describe('Phone number of the conversation participant (E.164 format)'),
  body: z.string().describe('Message content'),
});

export const createConfigSchema = z.object({
  number_id: z.number().describe('The Aircall number ID'),
  callback_url: z
    .string()
    .url()
    .optional()
    .describe('URL that receives message.received / message.status_updated callbacks'),
});

export const getConfigSchema = z.object({
  number_id: z.number().describe('The Aircall number ID'),
});

export const deleteConfigSchema = z.object({
  number_id: z.number().describe('The Aircall number ID'),
});

// Tool implementations
export function createMessagesTools(client: AircallClient) {
  return {
    aircall_send_message: {
      description:
        'Send an SMS/MMS from an Aircall number, bypassing the Aircall Inbox. The number must have messaging configured.',
      parameters: sendMessageSchema,
      execute: async (params: z.infer<typeof sendMessageSchema>) => {
        if (params.body.length > 1600) {
          throw new Error('Message body cannot exceed 1600 characters');
        }

        const result = await client.post<Record<string, unknown>>(
          `/numbers/${params.number_id}/messages/send`,
          {
            to: params.to,
            body: params.body,
            ...(params.media_url ? { media_url: params.media_url } : {}),
          }
        );

        return { success: true, message: 'Message sent', result };
      },
    },

    aircall_send_agent_message: {
      description:
        'Send a message in an existing agent conversation thread (appears in the Aircall Inbox). Use this to reply to ongoing conversations.',
      parameters: sendAgentMessageSchema,
      execute: async (params: z.infer<typeof sendAgentMessageSchema>) => {
        const result = await client.post<Record<string, unknown>>(
          `/numbers/${params.number_id}/messages/native/send`,
          {
            to: params.to,
            body: params.body,
          }
        );

        return { success: true, message: 'Message sent in conversation', result };
      },
    },

    aircall_create_config: {
      description:
        'Create the messaging configuration for an Aircall number, optionally setting a callback URL for incoming message events.',
      parameters: createConfigSchema,
      execute: async (params: z.infer<typeof createConfigSchema>) => {
        const result = await client.post<Record<string, unknown>>(
          `/numbers/${params.number_id}/messages/configuration`,
          params.callback_url ? { callbackUrl: params.callback_url } : {}
        );

        return { success: true, message: 'Messaging configuration created', result };
      },
    },

    aircall_get_config: {
      description: 'Get the messaging configuration for an Aircall number.',
      parameters: getConfigSchema,
      execute: async (params: z.infer<typeof getConfigSchema>) => {
        return client.get<Record<string, unknown>>(
          `/numbers/${params.number_id}/messages/configuration`
        );
      },
    },

    aircall_delete_config: {
      description: 'Delete the messaging configuration for an Aircall number.',
      parameters: deleteConfigSchema,
      execute: async (params: z.infer<typeof deleteConfigSchema>) => {
        await client.delete(`/numbers/${params.number_id}/messages/configuration`);

        return {
          success: true,
          message: 'Messaging configuration deleted',
          number_id: params.number_id,
        };
      },
    },
  };
}
