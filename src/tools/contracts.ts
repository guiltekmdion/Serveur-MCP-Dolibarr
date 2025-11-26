/**
 * Outils MCP pour les Contrats Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListContractsArgsSchema, GetContractArgsSchema, CreateContractArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les contrats
 */
export const listContractsTool = {
  name: 'dolibarr_list_contracts',
  description: 'Liste les contrats. Peut être filtré par tiers ou statut. Retourne la référence, le tiers et la date de contrat.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: {
        type: 'string',
        description: 'ID du tiers pour filtrer les contrats'
      },
      status: {
        type: 'string',
        description: 'Statut pour filtrer (0=brouillon, 1=validé, etc.)'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum de contrats à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListContracts(args: unknown) {
  const validated = ListContractsArgsSchema.parse(args);
  const contracts = await dolibarrClient.listContracts(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(contracts, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer un contrat
 */
export const getContractTool = {
  name: 'dolibarr_get_contract',
  description: 'Récupère les détails complets d\'un contrat par son ID. Inclut toutes les lignes de service et conditions.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID du contrat à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetContract(args: unknown) {
  const validated = GetContractArgsSchema.parse(args);
  const contract = await dolibarrClient.getContract(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(contract, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un contrat
 */
export const createContractTool = {
  name: 'dolibarr_create_contract',
  description: 'Crée un nouveau contrat pour un tiers. Le contrat peut ensuite recevoir des lignes de services.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: {
        type: 'string',
        description: 'ID du tiers client'
      },
      date_contrat: {
        type: 'number',
        description: 'Date du contrat (timestamp Unix)'
      },
      ref: {
        type: 'string',
        description: 'Référence personnalisée du contrat'
      }
    },
    required: ['socid']
  }
};

export async function handleCreateContract(args: unknown) {
  const validated = CreateContractArgsSchema.parse(args);
  const contract = await dolibarrClient.createContract(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(contract, null, 2),
      },
    ],
  };
}

// Export des outils pour l'enregistrement dans server.ts
export const contractTools = [listContractsTool, getContractTool, createContractTool];

