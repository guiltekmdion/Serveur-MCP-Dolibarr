import { dolibarrClient } from '../services/dolibarr.js';
import { searchFrenchCompany } from '../services/company-search.js';
import { 
  GetThirdPartyArgsSchema, 
  SearchThirdPartiesArgsSchema,
  CreateThirdPartyArgsSchema,
  UpdateThirdPartyArgsSchema
} from '../types/index.js';
import { z } from 'zod';

/**
 * Outil MCP : Récupérer les détails d'un tiers
 */
export const getThirdPartyTool = {
  name: 'dolibarr_get_thirdparty',
  description: 'Récupérer les DÉTAILS COMPLETS d\'un CLIENT/PROSPECT/FOURNISSEUR par son ID (adresse, contacts, etc.)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'L\'ID du client/tiers',
      },
    },
    required: ['id'],
  },
};

export async function handleGetThirdParty(args: unknown) {
  // Validation Zod des arguments
  const validated = GetThirdPartyArgsSchema.parse(args);
  const thirdParty = await dolibarrClient.getThirdParty(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(thirdParty, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Rechercher des tiers
 */
export const searchThirdPartiesTool = {
  name: 'dolibarr_search_thirdparties',
  description: 'Rechercher des CLIENTS, PROSPECTS ou FOURNISSEURS par nom. Pour le TOP clients par CA, utilisez dolibarr_get_stats avec type=topclients.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Nom du client/fournisseur à rechercher',
      },
    },
    required: ['query'],
  },
};

export async function handleSearchThirdParties(args: unknown) {
  const validated = SearchThirdPartiesArgsSchema.parse(args);
  const results = await dolibarrClient.searchThirdParties(validated.query);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un tiers
 */
export const createThirdPartyTool = {
  name: 'dolibarr_create_thirdparty',
  description: 'Créer un nouveau tiers (client/prospect/fournisseur)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'Nom du tiers' },
      code_client: { type: 'string', description: 'Code client (optionnel, -1 pour auto)' },
      client: { type: 'string', description: 'Type: 0=pas client, 1=client, 2=prospect, 3=client+prospect', enum: ['0', '1', '2', '3'] },
      email: { type: 'string', description: 'Email' },
      phone: { type: 'string', description: 'Téléphone' },
      address: { type: 'string', description: 'Adresse' },
      zip: { type: 'string', description: 'Code postal' },
      town: { type: 'string', description: 'Ville' },
      idprof1: { type: 'string', description: 'SIREN (optionnel)' },
      idprof2: { type: 'string', description: 'SIRET (optionnel)' },
      idprof3: { type: 'string', description: 'NAF/APE (optionnel)' },
      idprof4: { type: 'string', description: 'RCS/RM (optionnel)' },
    },
    required: ['name'],
  },
};

export async function handleCreateThirdParty(args: unknown) {
  const validated = CreateThirdPartyArgsSchema.parse(args);

  // Auto-enrichment for French companies if address is missing
  // We assume it's a French company if country_id is '1' or not specified (default behavior for this feature)
  if (!validated.address && (!validated.country_id || validated.country_id === '1')) {
    try {
      const companyInfo = await searchFrenchCompany(validated.name);
      if (companyInfo) {
        validated.address = companyInfo.siege.adresse;
        validated.zip = companyInfo.siege.code_postal;
        validated.town = companyInfo.siege.libelle_commune;
        validated.idprof1 = companyInfo.siren;
        validated.idprof2 = companyInfo.siege.siret;
        validated.idprof3 = companyInfo.activite_principale;
        validated.idprof4 = `RCS ${companyInfo.siege.libelle_commune} ${companyInfo.siren}`;
        validated.country_id = '1'; // Ensure it is set to France
      }
    } catch (e) {
      // Ignore errors, just proceed with what we have
    }
  }

  const id = await dolibarrClient.createThirdParty(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ id, message: 'Tiers créé avec succès' }, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Mettre à jour un tiers
 */
export const updateThirdPartyTool = {
  name: 'dolibarr_update_thirdparty',
  description: 'Modifier les informations d\'un tiers existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers' },
      name: { type: 'string', description: 'Nouveau nom' },
      email: { type: 'string', description: 'Nouvel email' },
      phone: { type: 'string', description: 'Nouveau téléphone' },
      address: { type: 'string', description: 'Nouvelle adresse' },
      zip: { type: 'string', description: 'Nouveau code postal' },
      town: { type: 'string', description: 'Nouvelle ville' },
      status: { type: 'string', description: 'Nouveau statut' },
    },
    required: ['id'],
  },
};

export async function handleUpdateThirdParty(args: unknown) {
  const validated = UpdateThirdPartyArgsSchema.parse(args);
  await dolibarrClient.updateThirdParty(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ message: 'Tiers mis à jour avec succès' }, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Supprimer un tiers
 */
export const deleteThirdPartyTool = {
  name: 'dolibarr_delete_thirdparty',
  description: 'Supprimer un tiers (client/fournisseur)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers à supprimer' },
    },
    required: ['id'],
  },
};

export async function handleDeleteThirdParty(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore - Accès direct à axios pour delete générique si pas de méthode dédiée
  await dolibarrClient['client'].delete(`/thirdparties/${id}`);
  return { content: [{ type: 'text', text: `Tiers ${id} supprimé avec succès` }] };
}

/**
 * Outil MCP : Récupérer les catégories d'un tiers
 */
export const getThirdPartyCategoriesTool = {
  name: 'dolibarr_get_thirdparty_categories',
  description: 'Lister les catégories (tags) d\'un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers' },
    },
    required: ['id'],
  },
};

export async function handleGetThirdPartyCategories(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/thirdparties/${id}/categories`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

/**
 * Outil MCP : Ajouter une catégorie à un tiers
 */
export const addThirdPartyCategoryTool = {
  name: 'dolibarr_add_thirdparty_category',
  description: 'Ajouter un tag/catégorie à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['thirdparty_id', 'category_id'],
  },
};

export async function handleAddThirdPartyCategory(args: unknown) {
  const schema = z.object({ thirdparty_id: z.string(), category_id: z.string() });
  const { thirdparty_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/categories/${category_id}/objects/customer/${thirdparty_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} ajoutée au tiers ${thirdparty_id}` }] };
}

/**
 * Outil MCP : Retirer une catégorie d'un tiers
 */
export const removeThirdPartyCategoryTool = {
  name: 'dolibarr_remove_thirdparty_category',
  description: 'Retirer un tag/catégorie d\'un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['thirdparty_id', 'category_id'],
  },
};

export async function handleRemoveThirdPartyCategory(args: unknown) {
  const schema = z.object({ thirdparty_id: z.string(), category_id: z.string() });
  const { thirdparty_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/categories/${category_id}/objects/customer/${thirdparty_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} retirée du tiers ${thirdparty_id}` }] };
}

/**
 * Outil MCP : Récupérer les comptes bancaires d'un tiers
 */
export const getThirdPartyBankAccountsTool = {
  name: 'dolibarr_get_thirdparty_bank_accounts',
  description: 'Lister les comptes bancaires (RIB) associés à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers' },
    },
    required: ['id'],
  },
};

export async function handleGetThirdPartyBankAccounts(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/thirdparties/${id}/bankaccounts`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

/**
 * Outil MCP : Créer un compte bancaire pour un tiers
 */
export const createThirdPartyBankAccountTool = {
  name: 'dolibarr_create_thirdparty_bank_account',
  description: 'Ajouter un RIB/Compte bancaire à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      label: { type: 'string', description: 'Libellé du compte' },
      bank_name: { type: 'string', description: 'Nom de la banque' },
      iban: { type: 'string', description: 'IBAN' },
      bic: { type: 'string', description: 'BIC' },
    },
    required: ['thirdparty_id', 'label', 'iban'],
  },
};

export async function handleCreateThirdPartyBankAccount(args: unknown) {
  const schema = z.object({ 
    thirdparty_id: z.string(), 
    label: z.string(), 
    bank_name: z.string().optional(), 
    iban: z.string(), 
    bic: z.string().optional() 
  });
  const data = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post(`/thirdparties/${data.thirdparty_id}/bankaccounts`, data);
  return { content: [{ type: 'text', text: `Compte bancaire créé ID: ${response.data}` }] };
}

/**
 * Outil MCP : Factures impayées d'un tiers
 */
export const getThirdPartyOutstandingInvoicesTool = {
  name: 'dolibarr_get_thirdparty_outstanding_invoices',
  description: 'Lister les factures impayées pour un tiers spécifique',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers' },
    },
    required: ['id'],
  },
};

export async function handleGetThirdPartyOutstandingInvoices(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const invoices = await dolibarrClient.listInvoices({ thirdparty_id: id, status: 'unpaid' });
  return { content: [{ type: 'text', text: JSON.stringify(invoices, null, 2) }] };
}

/**
 * Outil MCP : Commerciaux d'un tiers
 */
export const getThirdPartySalesRepresentativesTool = {
  name: 'dolibarr_get_thirdparty_sales_representatives',
  description: 'Lister les commerciaux assignés à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du tiers' },
    },
    required: ['id'],
  },
};

export async function handleGetThirdPartySalesRepresentatives(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/thirdparties/${id}/representatives`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

/**
 * Outil MCP : Ajouter un commercial à un tiers
 */
export const addThirdPartySalesRepresentativeTool = {
  name: 'dolibarr_add_thirdparty_sales_representative',
  description: 'Assigner un commercial à un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur (commercial)' },
    },
    required: ['thirdparty_id', 'user_id'],
  },
};

export async function handleAddThirdPartySalesRepresentative(args: unknown) {
  const schema = z.object({ thirdparty_id: z.string(), user_id: z.string() });
  const { thirdparty_id, user_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/thirdparties/${thirdparty_id}/representatives/${user_id}`);
  return { content: [{ type: 'text', text: `Commercial ${user_id} assigné au tiers ${thirdparty_id}` }] };
}

/**
 * Outil MCP : Retirer un commercial d'un tiers
 */
export const removeThirdPartySalesRepresentativeTool = {
  name: 'dolibarr_remove_thirdparty_sales_representative',
  description: 'Désassigner un commercial d\'un tiers',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur (commercial)' },
    },
    required: ['thirdparty_id', 'user_id'],
  },
};

export async function handleRemoveThirdPartySalesRepresentative(args: unknown) {
  const schema = z.object({ thirdparty_id: z.string(), user_id: z.string() });
  const { thirdparty_id, user_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/thirdparties/${thirdparty_id}/representatives/${user_id}`);
  return { content: [{ type: 'text', text: `Commercial ${user_id} retiré du tiers ${thirdparty_id}` }] };
}
