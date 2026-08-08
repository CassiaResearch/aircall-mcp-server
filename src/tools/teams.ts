// Aircall Teams Tools
// Team management including user assignments

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  TeamsListResponse,
  TeamResponse,
  Team,
} from '../types/aircall.js';

// Schema definitions
export const listTeamsSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
});

export const getTeamSchema = z.object({
  team_id: z.number().describe('The team ID'),
});

export const createTeamSchema = z.object({
  name: z.string().describe('Team name'),
});

export const deleteTeamSchema = z.object({
  team_id: z.number().describe('The team ID to delete'),
});

export const addUserToTeamSchema = z.object({
  team_id: z.number().describe('The team ID'),
  user_id: z.number().describe('The user ID to add'),
});

export const removeUserFromTeamSchema = z.object({
  team_id: z.number().describe('The team ID'),
  user_id: z.number().describe('The user ID to remove'),
});

// Helper to format team for output
function formatTeam(team: Team) {
  return {
    id: team.id,
    direct_link: team.direct_link,
    name: team.name,
    created_at: toIso(team.created_at),
    users: team.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      available: u.available,
    })),
    numbers: team.numbers.map((n) => ({
      id: n.id,
      name: n.name,
      digits: n.digits,
    })),
    user_count: team.users.length,
    number_count: team.numbers.length,
  };
}

// Tool implementations
export function createTeamsTools(client: AircallClient) {
  return {
    aircall_list_teams: {
      description: 'List all teams with their members and assigned numbers.',
      parameters: listTeamsSchema,
      execute: async (params: z.infer<typeof listTeamsSchema>) => {
        const result = await client.get<TeamsListResponse>('/teams', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          teams: result.teams.map(formatTeam),
        };
      },
    },

    aircall_get_team: {
      description: 'Get detailed information about a specific team including all members and numbers.',
      parameters: getTeamSchema,
      execute: async (params: z.infer<typeof getTeamSchema>) => {
        const result = await client.get<TeamResponse>(`/teams/${params.team_id}`);
        return formatTeam(result.team);
      },
    },

    aircall_create_team: {
      description: 'Create a new team. Teams group users together for call routing and organization.',
      parameters: createTeamSchema,
      execute: async (params: z.infer<typeof createTeamSchema>) => {
        const result = await client.post<TeamResponse>('/teams', {
          name: params.name,
        });
        return {
          success: true,
          message: 'Team created successfully',
          team: formatTeam(result.team),
        };
      },
    },

    aircall_delete_team: {
      description: 'Delete a team. Users in the team will not be deleted.',
      parameters: deleteTeamSchema,
      execute: async (params: z.infer<typeof deleteTeamSchema>) => {
        await client.delete(`/teams/${params.team_id}`);
        return {
          success: true,
          message: 'Team deleted successfully',
          team_id: params.team_id,
        };
      },
    },

    aircall_add_user_to_team: {
      description: 'Add a user to a team. Users can belong to multiple teams.',
      parameters: addUserToTeamSchema,
      execute: async (params: z.infer<typeof addUserToTeamSchema>) => {
        const result = await client.post<TeamResponse>(
          `/teams/${params.team_id}/users/${params.user_id}`
        );
        return {
          success: true,
          message: 'User added to team successfully',
          team: formatTeam(result.team),
        };
      },
    },

    aircall_remove_user_from_team: {
      description: 'Remove a user from a team.',
      parameters: removeUserFromTeamSchema,
      execute: async (params: z.infer<typeof removeUserFromTeamSchema>) => {
        const result = await client.delete<TeamResponse>(
          `/teams/${params.team_id}/users/${params.user_id}`
        );
        return {
          success: true,
          message: 'User removed from team successfully',
          team: formatTeam(result.team),
        };
      },
    },
  };
}
