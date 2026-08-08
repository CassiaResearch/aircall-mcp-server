// Aircall Dialer Campaign Tools
// Power dialer campaigns are per-user: /v1/users/:user_id/dialer_campaign
// A user can have only one active dialer campaign at a time.

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';

// Schema definitions
export const userCampaignSchema = z.object({
  user_id: z.number().describe('The user ID whose dialer campaign to target'),
});

export const createCampaignSchema = z.object({
  user_id: z.number().describe('The user ID to create the campaign for'),
  phone_numbers: z
    .array(z.string())
    .describe('Phone numbers to dial (E.164 format)'),
});

export const getCampaignNumbersSchema = z.object({
  user_id: z.number().describe('The user ID whose campaign numbers to fetch'),
  page: z.number().optional().describe('Page number'),
  per_page: z.number().optional().describe('Results per page'),
});

export const addCampaignNumbersSchema = z.object({
  user_id: z.number().describe('The user ID whose campaign to add numbers to'),
  phone_numbers: z
    .array(z.string())
    .describe('Phone numbers to add (E.164 format)'),
});

export const removeCampaignNumberSchema = z.object({
  user_id: z.number().describe('The user ID whose campaign to modify'),
  phone_number_id: z.number().describe('The phone number ID to remove'),
});

// Tool implementations
export function createDialerTools(client: AircallClient) {
  return {
    aircall_get_campaign: {
      description: "Get a user's active power dialer campaign. Each user has at most one active campaign.",
      parameters: userCampaignSchema,
      execute: async (params: z.infer<typeof userCampaignSchema>) => {
        return client.get<Record<string, unknown>>(
          `/users/${params.user_id}/dialer_campaign`
        );
      },
    },

    aircall_create_campaign: {
      description:
        'Create an active power dialer campaign for a user with a list of phone numbers to dial. A user can have only one active campaign.',
      parameters: createCampaignSchema,
      execute: async (params: z.infer<typeof createCampaignSchema>) => {
        await client.post(`/users/${params.user_id}/dialer_campaign`, {
          phone_numbers: params.phone_numbers,
        });
        return {
          success: true,
          message: `Campaign created with ${params.phone_numbers.length} numbers`,
          user_id: params.user_id,
        };
      },
    },

    aircall_delete_campaign: {
      description: "Delete a user's power dialer campaign.",
      parameters: userCampaignSchema,
      execute: async (params: z.infer<typeof userCampaignSchema>) => {
        await client.delete(`/users/${params.user_id}/dialer_campaign`);
        return {
          success: true,
          message: 'Campaign deleted successfully',
          user_id: params.user_id,
        };
      },
    },

    aircall_get_campaign_numbers: {
      description: "Get the phone numbers in a user's power dialer campaign.",
      parameters: getCampaignNumbersSchema,
      execute: async (params: z.infer<typeof getCampaignNumbersSchema>) => {
        const { user_id, ...queryParams } = params;
        return client.get<Record<string, unknown>>(
          `/users/${user_id}/dialer_campaign/phone_numbers`,
          queryParams
        );
      },
    },

    aircall_add_campaign_numbers: {
      description: "Add phone numbers to a user's power dialer campaign.",
      parameters: addCampaignNumbersSchema,
      execute: async (params: z.infer<typeof addCampaignNumbersSchema>) => {
        await client.post(`/users/${params.user_id}/dialer_campaign/phone_numbers`, {
          phone_numbers: params.phone_numbers,
        });
        return {
          success: true,
          message: `Added ${params.phone_numbers.length} numbers to campaign`,
          user_id: params.user_id,
          numbers_added: params.phone_numbers.length,
        };
      },
    },

    aircall_remove_campaign_number: {
      description: "Remove a phone number from a user's power dialer campaign.",
      parameters: removeCampaignNumberSchema,
      execute: async (params: z.infer<typeof removeCampaignNumberSchema>) => {
        await client.delete(
          `/users/${params.user_id}/dialer_campaign/phone_numbers/${params.phone_number_id}`
        );
        return {
          success: true,
          message: 'Phone number removed from campaign',
          user_id: params.user_id,
          phone_number_id: params.phone_number_id,
        };
      },
    },
  };
}
