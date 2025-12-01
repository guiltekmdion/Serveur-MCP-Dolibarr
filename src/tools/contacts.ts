import { z } from 'zod';
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

/**
 * Outil MCP : Mettre à jour un contact
 */
export const updateContactTool = {
  name: 'dolibarr_update_contact',
  description: 'Mettre à jour les informations d\'un contact',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contact' },
      lastname: { type: 'string', description: 'Nom' },
      firstname: { type: 'string', description: 'Prénom' },
      email: { type: 'string', description: 'Email' },
      phone: { type: 'string', description: 'Téléphone' },
    },
    required: ['id'],
  },
};

export async function handleUpdateContact(args: unknown) {
  const schema = z.object({
    id: z.string(),
    lastname: z.string().optional(),
    firstname: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/contacts/${id}`, data);
  return { content: [{ type: 'text', text: `Contact ${id} mis à jour` }] };
}

/**
 * Outil MCP : Supprimer un contact
 */
export const deleteContactTool = {
  name: 'dolibarr_delete_contact',
  description: 'Supprimer un contact',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contact' },
    },
    required: ['id'],
  },
};

export async function handleDeleteContact(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/contacts/${id}`);
  return { content: [{ type: 'text', text: `Contact ${id} supprimé` }] };
}

/**
 * Outil MCP : Rechercher des contacts
 */
export const searchContactsTool = {
  name: 'dolibarr_search_contacts',
  description: 'Rechercher des contacts par nom/email',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Terme de recherche' },
    },
    required: ['query'],
  },
};

export async function handleSearchContacts(args: unknown) {
  const schema = z.object({ query: z.string() });
  const { query } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get('/contacts', {
    params: { sqlfilters: `(t.lastname:like:'%${query}%') OR (t.firstname:like:'%${query}%') OR (t.email:like:'%${query}%')` }
  });
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

/**
 * Outil MCP : Créer un compte utilisateur Dolibarr depuis un contact
 */
export const createUserFromContactTool = {
  name: 'dolibarr_create_user_from_contact',
  description: 'Créer un compte utilisateur (login) à partir d\'un contact existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contact_id: { type: 'string', description: 'ID du contact' },
      login: { type: 'string', description: 'Login utilisateur' },
      password: { type: 'string', description: 'Mot de passe' },
    },
    required: ['contact_id', 'login'],
  },
};

export async function handleCreateUserFromContact(args: unknown) {
  const schema = z.object({ contact_id: z.string(), login: z.string(), password: z.string().optional() });
  const { contact_id, login, password } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post(`/contacts/${contact_id}/createUser`, { login, password });
  return { content: [{ type: 'text', text: `Utilisateur créé ID: ${response.data}` }] };
}

/**
 * Outil MCP : Catégories d'un contact
 */
export const getContactCategoriesTool = {
  name: 'dolibarr_get_contact_categories',
  description: 'Lister les catégories (tags) d\'un contact',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contact' },
    },
    required: ['id'],
  },
};

export async function handleGetContactCategories(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/contacts/${id}/categories`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

/**
 * Outil MCP : Ajouter une catégorie à un contact
 */
export const addContactCategoryTool = {
  name: 'dolibarr_add_contact_category',
  description: 'Ajouter un tag/catégorie à un contact',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contact_id: { type: 'string', description: 'ID du contact' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['contact_id', 'category_id'],
  },
};

export async function handleAddContactCategory(args: unknown) {
  const schema = z.object({ contact_id: z.string(), category_id: z.string() });
  const { contact_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/categories/${category_id}/objects/contact/${contact_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} ajoutée au contact ${contact_id}` }] };
}

/**
 * Outil MCP : Retirer une catégorie d'un contact
 */
export const removeContactCategoryTool = {
  name: 'dolibarr_remove_contact_category',
  description: 'Retirer un tag/catégorie d\'un contact',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contact_id: { type: 'string', description: 'ID du contact' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['contact_id', 'category_id'],
  },
};

export async function handleRemoveContactCategory(args: unknown) {
  const schema = z.object({ contact_id: z.string(), category_id: z.string() });
  const { contact_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/categories/${category_id}/objects/contact/${contact_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} retirée du contact ${contact_id}` }] };
}

/**
 * Outil MCP : Activer le compte utilisateur d'un contact
 */
export const enableContactUserAccountTool = {
  name: 'dolibarr_enable_contact_user_account',
  description: 'Activer le compte utilisateur lié à un contact (si existant)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contact_id: { type: 'string', description: 'ID du contact' },
    },
    required: ['contact_id'],
  },
};

export async function handleEnableContactUserAccount(args: unknown) {
  const schema = z.object({ contact_id: z.string() });
  const { contact_id } = schema.parse(args);
  // Note: On doit d'abord trouver le user lié. C'est complexe via l'API standard.
  // On suppose ici qu'on a un endpoint custom ou on fait une recherche user par fk_socpeople
  // Faute de mieux, on retourne une erreur explicative si pas possible directement
  return { content: [{ type: 'text', text: "Action non supportée directement par l'API standard sans ID utilisateur. Utilisez dolibarr_update_user." }] };
}

/**
 * Outil MCP : Abonnements d'un contact
 */
export const getContactSubscriptionsTool = {
  name: 'dolibarr_get_contact_subscriptions',
  description: 'Lister les adhésions/cotisations liées à un contact (membre)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contact/membre' },
    },
    required: ['id'],
  },
};

export async function handleGetContactSubscriptions(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/subscriptions`, { params: { sqlfilters: `(t.fk_adherent:=:${id})` } });
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}
