// Aircall Users Tools
// User management including availability and call operations

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  UsersListResponse,
  UserResponse,
  User,
  UserAvailability,
} from '../types/aircall.js';

// Schema definitions
export const listUsersSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
});

export const getUserSchema = z.object({
  user_id: z.number().describe('The user ID'),
});

export const createUserSchema = z.object({
  email: z.string().email().describe('User email address'),
  first_name: z.string().describe('First name'),
  last_name: z.string().describe('Last name'),
  role_id: z.string().optional().describe('Role ID to assign'),
  is_admin: z.boolean().optional().describe('Whether user should be an admin'),
});

export const updateUserSchema = z.object({
  user_id: z.number().describe('The user ID'),
  first_name: z.string().optional().describe('First name'),
  last_name: z.string().optional().describe('Last name'),
  role_id: z.string().optional().describe('Role ID'),
  wrap_up_time: z.number().optional().describe('Wrap-up time in seconds'),
});

export const deleteUserSchema = z.object({
  user_id: z.number().describe('The user ID to delete'),
});

export const startCallSchema = z.object({
  user_id: z.number().describe('The user ID who will make the call'),
  number_id: z.number().describe('The Aircall number ID to call from'),
  to: z.string().describe('Phone number to call'),
});

export const dialSchema = z.object({
  user_id: z.number().describe('The user ID'),
  to: z.string().describe('Phone number to dial (opens in Aircall phone)'),
});

// Helper to format user for output
function formatUser(user: User) {
  return {
    id: user.id,
    direct_link: user.direct_link,
    name: user.name,
    email: user.email,
    available: user.available,
    availability_status: user.availability_status,
    time_zone: user.time_zone,
    language: user.language,
    wrap_up_time: user.wrap_up_time,
    created_at: toIso(user.created_at),
    numbers: user.numbers.map((n) => ({
      id: n.id,
      name: n.name,
      digits: n.digits,
    })),
  };
}

// Tool implementations
export function createUsersTools(client: AircallClient) {
  return {
    aircall_list_users: {
      description: 'List all users in the Aircall account with their availability status and assigned numbers.',
      parameters: listUsersSchema,
      execute: async (params: z.infer<typeof listUsersSchema>) => {
        const result = await client.get<UsersListResponse>('/users', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          users: result.users.map(formatUser),
        };
      },
    },

    aircall_get_user: {
      description: 'Get detailed information about a specific user including their numbers and availability.',
      parameters: getUserSchema,
      execute: async (params: z.infer<typeof getUserSchema>) => {
        const result = await client.get<UserResponse>(`/users/${params.user_id}`);
        return formatUser(result.user);
      },
    },

    aircall_create_user: {
      description: 'Create a new user in Aircall. An invitation email will be sent.',
      parameters: createUserSchema,
      execute: async (params: z.infer<typeof createUserSchema>) => {
        const result = await client.post<UserResponse>('/users', {
          email: params.email,
          first_name: params.first_name,
          last_name: params.last_name,
          role_id: params.role_id,
          is_admin: params.is_admin,
        });
        return {
          success: true,
          message: 'User created successfully. Invitation email sent.',
          user: formatUser(result.user),
        };
      },
    },

    aircall_update_user: {
      description: 'Update a user\'s profile information.',
      parameters: updateUserSchema,
      execute: async (params: z.infer<typeof updateUserSchema>) => {
        const { user_id, ...updateData } = params;
        const result = await client.put<UserResponse>(`/users/${user_id}`, updateData);
        return {
          success: true,
          message: 'User updated successfully',
          user: formatUser(result.user),
        };
      },
    },

    aircall_delete_user: {
      description: 'Delete a user from Aircall. This action cannot be undone.',
      parameters: deleteUserSchema,
      execute: async (params: z.infer<typeof deleteUserSchema>) => {
        await client.delete(`/users/${params.user_id}`);
        return {
          success: true,
          message: 'User deleted successfully',
          user_id: params.user_id,
        };
      },
    },

    aircall_check_availability: {
      description: 'Check if a specific user is currently available to take calls.',
      parameters: getUserSchema,
      execute: async (params: z.infer<typeof getUserSchema>) => {
        const result = await client.get<{ availability: UserAvailability }>(
          `/users/${params.user_id}/availability`
        );
        return {
          user_id: result.availability.user_id,
          available: result.availability.available,
          status: result.availability.availability_status,
          custom_status: result.availability.custom_status,
        };
      },
    },

    aircall_list_availabilities: {
      description: 'Get availability status for all users. Useful for routing calls or finding available agents.',
      parameters: z.object({}),
      execute: async () => {
        const result = await client.get<{ availabilities: UserAvailability[] }>(
          '/users/availabilities'
        );
        return {
          users: result.availabilities.map((a) => ({
            user_id: a.user_id,
            available: a.available,
            status: a.availability_status,
            custom_status: a.custom_status,
          })),
          summary: {
            total: result.availabilities.length,
            available: result.availabilities.filter((a) => a.available).length,
            unavailable: result.availabilities.filter((a) => !a.available).length,
          },
        };
      },
    },

    aircall_start_call: {
      description: 'Initiate an outbound call on behalf of a user. The user\'s phone will ring first, then connect to the destination.',
      parameters: startCallSchema,
      execute: async (params: z.infer<typeof startCallSchema>) => {
        await client.post(`/users/${params.user_id}/calls`, {
          number_id: params.number_id,
          to: params.to,
        });
        return {
          success: true,
          message: `Call initiated to ${params.to}`,
          user_id: params.user_id,
          number_id: params.number_id,
          destination: params.to,
        };
      },
    },

    aircall_dial: {
      description: 'Open the Aircall phone app with a number pre-dialed. The user can then initiate the call manually.',
      parameters: dialSchema,
      execute: async (params: z.infer<typeof dialSchema>) => {
        await client.post(`/users/${params.user_id}/dial`, {
          to: params.to,
        });
        return {
          success: true,
          message: `Dialer opened with ${params.to}`,
          user_id: params.user_id,
          destination: params.to,
        };
      },
    },

    aircall_get_user_numbers: {
      description: 'Get all phone numbers assigned to a specific user (API v2).',
      parameters: getUserSchema,
      execute: async (params: z.infer<typeof getUserSchema>) => {
        const result = await client.get<Record<string, unknown>>(
          `/v2/users/${params.user_id}/numbers`
        );
        return { user_id: params.user_id, ...result };
      },
    },
  };
}
