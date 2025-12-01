/**
 * Outils MCP pour les Contrats Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
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
      },
      commercial_signature_id: {
        type: 'string',
        description: 'ID du commercial signataire (obligatoire)'
      },
      commercial_suivi_id: {
        type: 'string',
        description: 'ID du commercial de suivi (obligatoire)'
      }
    },
    required: ['socid', 'commercial_signature_id', 'commercial_suivi_id']
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

// === NOUVEAUX OUTILS CONTRATS ===

export const updateContractTool = {
  name: 'dolibarr_update_contract',
  description: 'Mettre à jour un contrat',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du contrat' },
      date_contrat: { type: 'number', description: 'Date du contrat' },
      ref_customer: { type: 'string', description: 'Réf client' },
      note_private: { type: 'string', description: 'Note privée' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['id'],
  },
};

export async function handleUpdateContract(args: unknown) {
  const schema = z.object({
    id: z.string(),
    date_contrat: z.number().optional(),
    ref_customer: z.string().optional(),
    note_private: z.string().optional(),
    note_public: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/contracts/${id}`, data);
  return { content: [{ type: 'text', text: `Contrat ${id} mis à jour` }] };
}

export const deleteContractTool = {
  name: 'dolibarr_delete_contract',
  description: 'Supprimer un contrat',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du contrat' } },
    required: ['id'],
  },
};

export async function handleDeleteContract(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/contracts/${id}`);
  return { content: [{ type: 'text', text: `Contrat ${id} supprimé` }] };
}

export const validateContractTool = {
  name: 'dolibarr_validate_contract',
  description: 'Valider un contrat',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du contrat' } },
    required: ['id'],
  },
};

export async function handleValidateContract(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/contracts/${id}/validate`);
  return { content: [{ type: 'text', text: `Contrat ${id} validé` }] };
}

export const closeContractTool = {
  name: 'dolibarr_close_contract',
  description: 'Clore un contrat',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du contrat' } },
    required: ['id'],
  },
};

export async function handleCloseContract(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/contracts/${id}/close`);
  return { content: [{ type: 'text', text: `Contrat ${id} clos` }] };
}

export const addContractLineTool = {
  name: 'dolibarr_add_contract_line',
  description: 'Ajouter une ligne de service au contrat',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contract_id: { type: 'string', description: 'ID du contrat' },
      product_id: { type: 'string', description: 'ID du produit/service' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire HT' },
      date_start: { type: 'number', description: 'Date début service' },
      date_end: { type: 'number', description: 'Date fin service' },
    },
    required: ['contract_id', 'product_id', 'qty', 'price'],
  },
};

export async function handleAddContractLine(args: unknown) {
  const schema = z.object({
    contract_id: z.string(),
    product_id: z.string(),
    qty: z.number(),
    price: z.number(),
    date_start: z.number().optional(),
    date_end: z.number().optional(),
  });
  const data = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/contracts/${data.contract_id}/lines`, {
    fk_product: data.product_id,
    qty: data.qty,
    subprice: data.price,
    date_start: data.date_start,
    date_end: data.date_end,
  });
  return { content: [{ type: 'text', text: `Ligne ajoutée au contrat ${data.contract_id}` }] };
}

export const updateContractLineTool = {
  name: 'dolibarr_update_contract_line',
  description: 'Mettre à jour une ligne de contrat',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contract_id: { type: 'string', description: 'ID du contrat' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix' },
    },
    required: ['contract_id', 'line_id'],
  },
};

export async function handleUpdateContractLine(args: unknown) {
  const schema = z.object({
    contract_id: z.string(),
    line_id: z.string(),
    qty: z.number().optional(),
    price: z.number().optional(),
  });
  const { contract_id, line_id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/contracts/${contract_id}/lines/${line_id}`, data);
  return { content: [{ type: 'text', text: `Ligne ${line_id} mise à jour` }] };
}

export const deleteContractLineTool = {
  name: 'dolibarr_delete_contract_line',
  description: 'Supprimer une ligne de contrat',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contract_id: { type: 'string', description: 'ID du contrat' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['contract_id', 'line_id'],
  },
};

export async function handleDeleteContractLine(args: unknown) {
  const schema = z.object({ contract_id: z.string(), line_id: z.string() });
  const { contract_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/contracts/${contract_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée du contrat ${contract_id}` }] };
}

export const activateContractLineTool = {
  name: 'dolibarr_activate_contract_line',
  description: 'Activer une ligne de service (Mise en service)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contract_id: { type: 'string', description: 'ID du contrat' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      date_start: { type: 'number', description: 'Date de début' },
      date_end: { type: 'number', description: 'Date de fin prévue' },
    },
    required: ['contract_id', 'line_id', 'date_start'],
  },
};

export async function handleActivateContractLine(args: unknown) {
  const schema = z.object({
    contract_id: z.string(),
    line_id: z.string(),
    date_start: z.number(),
    date_end: z.number().optional(),
  });
  const { contract_id, line_id, ...data } = schema.parse(args);
  // @ts-ignore
  // Note: Activation usually involves updating the line status or specific endpoint.
  // Assuming standard update or specific 'activate' endpoint if available.
  // Often it's just setting dates and status.
  await dolibarrClient['client'].put(`/contracts/${contract_id}/lines/${line_id}`, {
    ...data,
    status: 4 // Active
  });
  return { content: [{ type: 'text', text: `Ligne ${line_id} activée` }] };
}

export const closeContractLineTool = {
  name: 'dolibarr_close_contract_line',
  description: 'Clore une ligne de service (Résiliation)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contract_id: { type: 'string', description: 'ID du contrat' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      date_end: { type: 'number', description: 'Date de fin effective' },
    },
    required: ['contract_id', 'line_id', 'date_end'],
  },
};

export async function handleCloseContractLine(args: unknown) {
  const schema = z.object({
    contract_id: z.string(),
    line_id: z.string(),
    date_end: z.number(),
  });
  const { contract_id, line_id, date_end } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/contracts/${contract_id}/lines/${line_id}`, {
    date_end_real: date_end,
    status: 5 // Closed
  });
  return { content: [{ type: 'text', text: `Ligne ${line_id} close` }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const contractTools = [
  listContractsTool, 
  getContractTool, 
  createContractTool,
  updateContractTool,
  deleteContractTool,
  validateContractTool,
  closeContractTool,
  addContractLineTool,
  updateContractLineTool,
  deleteContractLineTool,
  activateContractLineTool,
  closeContractLineTool
];

