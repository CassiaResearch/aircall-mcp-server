// Aircall Tags Tools
// Tag management for categorizing calls

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  TagsListResponse,
  TagResponse,
  Tag,
} from '../types/aircall.js';

// Schema definitions
export const listTagsSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
});

export const getTagSchema = z.object({
  tag_id: z.number().describe('The tag ID'),
});

export const createTagSchema = z.object({
  name: z.string().describe('Tag name'),
  color: z.string().optional().describe('Tag color (hex code, e.g., #FF5733)'),
  description: z.string().optional().describe('Tag description'),
});

export const updateTagSchema = z.object({
  tag_id: z.number().describe('The tag ID'),
  name: z.string().optional().describe('New tag name'),
  color: z.string().optional().describe('New tag color (hex code)'),
  description: z.string().optional().describe('New tag description'),
});

export const deleteTagSchema = z.object({
  tag_id: z.number().describe('The tag ID to delete'),
});

// Helper to format tag for output
function formatTag(tag: Tag) {
  return {
    id: tag.id,
    direct_link: tag.direct_link,
    name: tag.name,
    color: tag.color,
    description: tag.description,
    created_at: toIso(tag.created_at),
  };
}

// Tool implementations
export function createTagsTools(client: AircallClient) {
  return {
    aircall_list_tags: {
      description: 'List all tags available for categorizing calls.',
      parameters: listTagsSchema,
      execute: async (params: z.infer<typeof listTagsSchema>) => {
        const result = await client.get<TagsListResponse>('/tags', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          tags: result.tags.map(formatTag),
        };
      },
    },

    aircall_get_tag: {
      description: 'Get detailed information about a specific tag.',
      parameters: getTagSchema,
      execute: async (params: z.infer<typeof getTagSchema>) => {
        const result = await client.get<TagResponse>(`/tags/${params.tag_id}`);
        return formatTag(result.tag);
      },
    },

    aircall_create_tag: {
      description: 'Create a new tag for categorizing calls.',
      parameters: createTagSchema,
      execute: async (params: z.infer<typeof createTagSchema>) => {
        const result = await client.post<TagResponse>('/tags', {
          name: params.name,
          color: params.color,
          description: params.description,
        });
        return {
          success: true,
          message: 'Tag created successfully',
          tag: formatTag(result.tag),
        };
      },
    },

    aircall_update_tag: {
      description: 'Update an existing tag.',
      parameters: updateTagSchema,
      execute: async (params: z.infer<typeof updateTagSchema>) => {
        const { tag_id, ...updateData } = params;
        const result = await client.put<TagResponse>(`/tags/${tag_id}`, updateData);
        return {
          success: true,
          message: 'Tag updated successfully',
          tag: formatTag(result.tag),
        };
      },
    },

    aircall_delete_tag: {
      description: 'Delete a tag. Existing calls with this tag will lose it.',
      parameters: deleteTagSchema,
      execute: async (params: z.infer<typeof deleteTagSchema>) => {
        await client.delete(`/tags/${params.tag_id}`);
        return {
          success: true,
          message: 'Tag deleted successfully',
          tag_id: params.tag_id,
        };
      },
    },
  };
}
