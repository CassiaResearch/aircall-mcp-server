// Aircall Contacts Tools
// Full contact management including phone numbers and emails

import { z } from 'zod';
import type { AircallClient } from '../utils/auth.js';
import { toIso } from '../utils/format.js';
import type {
  ContactsListResponse,
  ContactResponse,
  Contact,
} from '../types/aircall.js';

// Schema definitions
export const listContactsSchema = z.object({
  page: z.number().optional().describe('Page number (default: 1)'),
  per_page: z.number().optional().describe('Results per page (default: 20, max: 50)'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  from: z.number().optional().describe('Filter contacts created from this Unix timestamp'),
  to: z.number().optional().describe('Filter contacts created to this Unix timestamp'),
});

export const searchContactsSchema = z.object({
  phone_number: z.string().optional().describe('Search by phone number'),
  email: z.string().optional().describe('Search by email'),
});

export const getContactSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
});

export const createContactSchema = z.object({
  first_name: z.string().optional().describe('First name'),
  last_name: z.string().optional().describe('Last name'),
  company_name: z.string().optional().describe('Company name'),
  information: z.string().optional().describe('Additional notes about the contact'),
  phone_numbers: z
    .array(
      z.object({
        label: z.string().describe('Label (e.g., Work, Mobile, Home)'),
        value: z.string().describe('Phone number'),
      })
    )
    .optional()
    .describe('Phone numbers to add'),
  emails: z
    .array(
      z.object({
        label: z.string().describe('Label (e.g., Work, Personal)'),
        value: z.string().describe('Email address'),
      })
    )
    .optional()
    .describe('Email addresses to add'),
});

export const updateContactSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  first_name: z.string().optional().describe('First name'),
  last_name: z.string().optional().describe('Last name'),
  company_name: z.string().optional().describe('Company name'),
  information: z.string().optional().describe('Additional notes'),
});

export const deleteContactSchema = z.object({
  contact_id: z.number().describe('The contact ID to delete'),
});

export const addPhoneSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  label: z.string().describe('Label (e.g., Work, Mobile, Home)'),
  value: z.string().describe('Phone number'),
});

export const updatePhoneSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  phone_id: z.number().describe('The phone number ID'),
  label: z.string().optional().describe('New label'),
  value: z.string().optional().describe('New phone number'),
});

export const deletePhoneSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  phone_id: z.number().describe('The phone number ID to delete'),
});

export const updateEmailSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  email_id: z.number().describe('The email ID to update'),
  label: z.string().optional().describe('Email label (e.g. Work, Personal)'),
  value: z.string().optional().describe('The email address'),
});

export const addEmailSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  label: z.string().describe('Label (e.g., Work, Personal)'),
  value: z.string().describe('Email address'),
});

export const deleteEmailSchema = z.object({
  contact_id: z.number().describe('The contact ID'),
  email_id: z.number().describe('The email ID to delete'),
});

// Helper to format contact for output
function formatContact(contact: Contact) {
  return {
    id: contact.id,
    direct_link: contact.direct_link,
    first_name: contact.first_name,
    last_name: contact.last_name,
    full_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || null,
    company_name: contact.company_name,
    information: contact.information,
    is_shared: contact.is_shared,
    created_at: toIso(contact.created_at),
    updated_at: toIso(contact.updated_at),
    phone_numbers: contact.phone_numbers.map((p) => ({
      id: p.id,
      label: p.label,
      value: p.value,
    })),
    emails: contact.emails.map((e) => ({
      id: e.id,
      label: e.label,
      value: e.value,
    })),
  };
}

// Tool implementations
export function createContactsTools(client: AircallClient) {
  return {
    aircall_list_contacts: {
      description: 'List all contacts with pagination. Returns contact details including phone numbers and emails.',
      parameters: listContactsSchema,
      execute: async (params: z.infer<typeof listContactsSchema>) => {
        const result = await client.get<ContactsListResponse>('/contacts', params);
        return {
          total: result.meta.total,
          page: result.meta.current_page,
          per_page: result.meta.per_page,
          contacts: result.contacts.map(formatContact),
        };
      },
    },

    aircall_search_contacts: {
      description: 'Search contacts by phone number or email. Returns matching contacts.',
      parameters: searchContactsSchema,
      execute: async (params: z.infer<typeof searchContactsSchema>) => {
        const searchParams: Record<string, string | undefined> = {};

        if (params.phone_number) {
          searchParams.phone_number = params.phone_number;
        }
        if (params.email) {
          searchParams.email = params.email;
        }

        const result = await client.get<ContactsListResponse>('/contacts/search', searchParams);
        return {
          found: result.contacts.length,
          contacts: result.contacts.map(formatContact),
        };
      },
    },

    aircall_get_contact: {
      description: 'Get detailed information about a specific contact.',
      parameters: getContactSchema,
      execute: async (params: z.infer<typeof getContactSchema>) => {
        const result = await client.get<ContactResponse>(`/contacts/${params.contact_id}`);
        return formatContact(result.contact);
      },
    },

    aircall_create_contact: {
      description: 'Create a new contact with optional phone numbers and emails.',
      parameters: createContactSchema,
      execute: async (params: z.infer<typeof createContactSchema>) => {
        const result = await client.post<ContactResponse>('/contacts', {
          first_name: params.first_name,
          last_name: params.last_name,
          company_name: params.company_name,
          information: params.information,
          phone_numbers: params.phone_numbers,
          emails: params.emails,
        });
        return {
          success: true,
          message: 'Contact created successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_update_contact: {
      description: 'Update an existing contact\'s basic information.',
      parameters: updateContactSchema,
      execute: async (params: z.infer<typeof updateContactSchema>) => {
        const { contact_id, ...updateData } = params;
        // Note: the Aircall API uses POST (not PUT) to update a contact
        const result = await client.post<ContactResponse>(`/contacts/${contact_id}`, updateData);
        return {
          success: true,
          message: 'Contact updated successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_delete_contact: {
      description: 'Delete a contact. This action cannot be undone.',
      parameters: deleteContactSchema,
      execute: async (params: z.infer<typeof deleteContactSchema>) => {
        await client.delete(`/contacts/${params.contact_id}`);
        return {
          success: true,
          message: 'Contact deleted successfully',
          contact_id: params.contact_id,
        };
      },
    },

    aircall_add_phone: {
      description: 'Add a phone number to an existing contact.',
      parameters: addPhoneSchema,
      execute: async (params: z.infer<typeof addPhoneSchema>) => {
        const result = await client.post<ContactResponse>(
          `/contacts/${params.contact_id}/phone_details`,
          {
            label: params.label,
            value: params.value,
          }
        );
        return {
          success: true,
          message: 'Phone number added successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_update_phone: {
      description: 'Update a phone number on a contact.',
      parameters: updatePhoneSchema,
      execute: async (params: z.infer<typeof updatePhoneSchema>) => {
        const { contact_id, phone_id, ...updateData } = params;
        const result = await client.put<ContactResponse>(
          `/contacts/${contact_id}/phone_details/${phone_id}`,
          updateData
        );
        return {
          success: true,
          message: 'Phone number updated successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_delete_phone: {
      description: 'Delete a phone number from a contact.',
      parameters: deletePhoneSchema,
      execute: async (params: z.infer<typeof deletePhoneSchema>) => {
        await client.delete(
          `/contacts/${params.contact_id}/phone_details/${params.phone_id}`
        );
        return {
          success: true,
          message: 'Phone number deleted successfully',
          contact_id: params.contact_id,
          phone_id: params.phone_id,
        };
      },
    },

    aircall_add_email: {
      description: 'Add an email address to an existing contact.',
      parameters: addEmailSchema,
      execute: async (params: z.infer<typeof addEmailSchema>) => {
        const result = await client.post<ContactResponse>(
          `/contacts/${params.contact_id}/email_details`,
          {
            label: params.label,
            value: params.value,
          }
        );
        return {
          success: true,
          message: 'Email added successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_update_email: {
      description: 'Update an email address on a contact.',
      parameters: updateEmailSchema,
      execute: async (params: z.infer<typeof updateEmailSchema>) => {
        const { contact_id, email_id, ...updateData } = params;
        const result = await client.put<ContactResponse>(
          `/contacts/${contact_id}/email_details/${email_id}`,
          updateData
        );
        return {
          success: true,
          message: 'Email updated successfully',
          contact: formatContact(result.contact),
        };
      },
    },

    aircall_delete_email: {
      description: 'Delete an email address from a contact.',
      parameters: deleteEmailSchema,
      execute: async (params: z.infer<typeof deleteEmailSchema>) => {
        const result = await client.delete<ContactResponse>(
          `/contacts/${params.contact_id}/email_details/${params.email_id}`
        );
        return {
          success: true,
          message: 'Email deleted successfully',
          contact: formatContact(result.contact),
        };
      },
    },
  };
}
