import { dolibarrClient } from '../services/dolibarr.js';
import { searchFrenchCompany } from '../services/company-search.js';
import { 
  GetThirdPartyArgsSchema, 
  SearchThirdPartiesArgsSchema,
  CreateThirdPartyArgsSchema,
  UpdateThirdPartyArgsSchema
} from '../types/index.js';

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
