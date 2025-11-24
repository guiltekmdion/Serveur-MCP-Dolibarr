import { dolibarrClient } from '../services/dolibarr.js';
import {
  GetContactArgsSchema,
  ListContactsForThirdPartyArgsSchema,
  CreateContactArgsSchema
} from '../types/index.js';

export const getContactTool = {
  name: 'dolibarr_get_contact',
  description: 'Récupérer les détails d\'un contact par ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contact' },
    },
    required: ['id'],
  },
};

export async function handleGetContact(args: unknown) {
  const validated = GetContactArgsSchema.parse(args);
  const contact = await dolibarrClient.getContact(validated.id);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(contact, null, 2),
    }],
  };
}

export const listContactsForThirdPartyTool = {
  name: 'dolibarr_list_contacts_for_thirdparty',
  description: 'Lister tous les contacts liés à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
    },
    required: ['thirdparty_id'],
  },
};

export async function handleListContactsForThirdParty(args: unknown) {
  const validated = ListContactsForThirdPartyArgsSchema.parse(args);
  const contacts = await dolibarrClient.listContactsForThirdParty(validated.thirdparty_id);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(contacts, null, 2),
    }],
  };
}

export const createContactTool = {
  name: 'dolibarr_create_contact',
  description: 'Créer un nouveau contact rattaché à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: { type: 'string', description: 'ID du tiers' },
      lastname: { type: 'string', description: 'Nom du contact' },
      firstname: { type: 'string', description: 'Prénom du contact' },
      email: { type: 'string', description: 'Email du contact' },
      phone: { type: 'string', description: 'Téléphone du contact' },
    },
    required: ['socid', 'lastname'],
  },
};

export async function handleCreateContact(args: unknown) {
  const validated = CreateContactArgsSchema.parse(args);
  const id = await dolibarrClient.createContact(validated);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ id, message: 'Contact créé avec succès' }, null, 2),
    }],
  };
}
