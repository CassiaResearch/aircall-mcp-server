// Aircall Numbers Tools
// Phone number management and configuration

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  NumbersListResponse,
  NumberResponse,
  PhoneNumber,
} from '../types/aircall.js';

// Schema definitions
export const listNumbersSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
});

export const getNumberSchema = z.object({
  number_id: z.number().describe('The phone number ID'),
});

export const updateNumberSchema = z.object({
  number_id: z.number().describe('The phone number ID'),
  name: z.string().optional().describe('Display name for the number'),
  time_zone: z.string().optional().describe('Time zone (e.g., America/New_York)'),
  priority: z.number().optional().describe('Priority for call routing'),
});

export const updateMessagesSchema = z.object({
  number_id: z.number().describe('The phone number ID'),
  welcome: z.string().optional().describe('Welcome message URL'),
  waiting: z.string().optional().describe('Waiting music URL'),
  ringing_tone: z.string().optional().describe('Ringing tone URL'),
  unanswered_call: z.string().optional().describe('Unanswered call message URL'),
  after_hours: z.string().optional().describe('After hours message URL'),
  ivr: z.string().optional().describe('IVR message URL'),
  voicemail: z.string().optional().describe('Voicemail greeting URL'),
  closed: z.string().optional().describe('Closed message URL'),
  callback_later: z.string().optional().describe('Callback later message URL'),
  hold_music: z.string().optional().describe('Hold music URL'),
});

// Helper to format number for output
function formatNumber(number: PhoneNumber) {
  return {
    id: number.id,
    direct_link: number.direct_link,
    name: number.name,
    digits: number.digits,
    country: number.country,
    time_zone: number.time_zone,
    open: number.open,
    availability_status: number.availability_status,
    is_ivr: number.is_ivr,
    live_recording_activated: number.live_recording_activated,
    priority: number.priority,
    created_at: toIso(number.created_at),
    users: number.users.map((u) => ({
      id: u.id,
      name: u.name,
      available: u.available,
    })),
    messages: {
      welcome: number.messages.welcome ? 'configured' : null,
      waiting: number.messages.waiting ? 'configured' : null,
      voicemail: number.messages.voicemail ? 'configured' : null,
      after_hours: number.messages.after_hours ? 'configured' : null,
      ivr: number.messages.ivr ? 'configured' : null,
    },
  };
}

// Tool implementations
export function createNumbersTools(client: AircallClient) {
  return {
    aircall_list_numbers: {
      description: 'List all phone numbers in the account with their configuration and assigned users.',
      parameters: listNumbersSchema,
      execute: async (params: z.infer<typeof listNumbersSchema>) => {
        const result = await client.get<NumbersListResponse>('/numbers', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          numbers: result.numbers.map(formatNumber),
        };
      },
    },

    aircall_get_number: {
      description: 'Get detailed information about a specific phone number including users and message configuration.',
      parameters: getNumberSchema,
      execute: async (params: z.infer<typeof getNumberSchema>) => {
        const result = await client.get<NumberResponse>(`/numbers/${params.number_id}`);
        const number = result.number;
        return {
          ...formatNumber(number),
          // Include full message URLs for detailed view
          message_urls: number.messages,
        };
      },
    },

    aircall_update_number: {
      description: 'Update a phone number\'s configuration like name, timezone, or priority.',
      parameters: updateNumberSchema,
      execute: async (params: z.infer<typeof updateNumberSchema>) => {
        const { number_id, ...updateData } = params;
        const result = await client.put<NumberResponse>(`/numbers/${number_id}`, updateData);
        return {
          success: true,
          message: 'Number updated successfully',
          number: formatNumber(result.number),
        };
      },
    },

    aircall_update_messages: {
      description: 'Update audio messages and music for a phone number (welcome, waiting, voicemail, etc.). Provide URLs to audio files.',
      parameters: updateMessagesSchema,
      execute: async (params: z.infer<typeof updateMessagesSchema>) => {
        const { number_id, ...messages } = params;
        // Music & Messages are updated via the same request as updating a Number
        const result = await client.put<NumberResponse>(`/numbers/${number_id}`, { messages });
        return {
          success: true,
          message: 'Messages updated successfully',
          number: formatNumber(result.number),
        };
      },
    },

    aircall_get_registration_status: {
      description: 'Get the registration status for a phone number. Important for compliance in some regions.',
      parameters: getNumberSchema,
      execute: async (params: z.infer<typeof getNumberSchema>) => {
        const result = await client.get<{ status: string; details: Record<string, unknown> }>(
          `/numbers/${params.number_id}/registration_status`
        );
        return {
          number_id: params.number_id,
          status: result.status,
          details: result.details,
        };
      },
    },
  };
}
