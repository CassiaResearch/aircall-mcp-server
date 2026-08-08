// Aircall Company & Integrations Tools
// Company info and integration management

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import type { CompanyResponse } from '../types/aircall.js';

// Tool implementations
export function createCompanyTools(client: AircallClient) {
  return {
    aircall_ping: {
      description: 'Test connectivity and credentials against the Aircall API. Use this to troubleshoot the connection.',
      parameters: z.object({}),
      execute: async () => {
        return client.get<Record<string, unknown>>('/ping');
      },
    },

    aircall_get_company: {
      description: 'Get information about the Aircall company account including user and number counts.',
      parameters: z.object({}),
      execute: async () => {
        const result = await client.get<CompanyResponse>('/company');
        return {
          name: result.company.name,
          users_count: result.company.users_count,
          numbers_count: result.company.numbers_count,
        };
      },
    },

    aircall_get_integration: {
      description:
        'Get information about the integration associated with the current API credentials (only available for OAuth or Aircall-built integrations).',
      parameters: z.object({}),
      execute: async () => {
        return client.get<Record<string, unknown>>('/integrations/me');
      },
    },

    aircall_enable_integration: {
      description: 'Enable the integration associated with the current API credentials.',
      parameters: z.object({}),
      execute: async () => {
        await client.post('/integrations/enable');
        return { success: true, message: 'Integration enabled successfully' };
      },
    },

    aircall_disable_integration: {
      description: 'Disable the integration associated with the current API credentials.',
      parameters: z.object({}),
      execute: async () => {
        await client.post('/integrations/disable');
        return { success: true, message: 'Integration disabled successfully' };
      },
    },
  };
}
