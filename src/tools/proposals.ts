import { dolibarrClient } from '../services/dolibarr.js';
import {
  CreateProposalArgsSchema,
  GetProposalArgsSchema,
  ListProposalsArgsSchema,
  AddProposalLineArgsSchema,
  UpdateProposalLineArgsSchema,
  DeleteProposalLineArgsSchema,
  ChangeProposalStatusArgsSchema
} from '../types/index.js';

/**
 * Outil MCP : Créer une proposition commerciale
 */
export const createProposalTool = {
  name: 'dolibarr_create_proposal',
  description: 'Créer une nouvelle proposition commerciale',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: {
        type: 'string',
        description: 'L\'ID du tiers',
      },
      date: {
        type: 'number',
        description: 'Date de la proposition (timestamp Unix)',
      },
      ref: {
        type: 'string',
        description: 'Référence de la proposition (optionnel, auto-généré si vide)',
      },
    },
    required: ['socid', 'date'],
  },
};

export async function handleCreateProposal(args: unknown) {
  const validated = CreateProposalArgsSchema.parse(args);
  const id = await dolibarrClient.createProposal(validated);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ id, message: 'Proposition créée avec succès' }, null, 2),
    }],
  };
}

export const getProposalTool = {
  name: 'dolibarr_get_proposal',
  description: 'Récupérer les détails d\'un devis par ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du devis' },
    },
    required: ['id'],
  },
};

export async function handleGetProposal(args: unknown) {
  const validated = GetProposalArgsSchema.parse(args);
  const proposal = await dolibarrClient.getProposal(validated.id);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(proposal, null, 2),
    }],
  };
}

export const listProposalsTool = {
  name: 'dolibarr_list_proposals',
  description: 'Lister et filtrer les devis',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'Filtrer par ID tiers' },
      status: { type: 'string', description: 'Filtrer par statut' },
      limit: { type: 'number', description: 'Nombre maximum de résultats' },
    },
  },
};

export async function handleListProposals(args: unknown) {
  const validated = ListProposalsArgsSchema.parse(args);
  const proposals = await dolibarrClient.listProposals(validated);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(proposals, null, 2),
    }],
  };
}

export const addProposalLineTool = {
  name: 'dolibarr_add_proposal_line',
  description: 'Ajouter une ligne à un devis existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      proposal_id: { type: 'string', description: 'ID du devis' },
      product_id: { type: 'string', description: 'ID du produit/service' },
      desc: { type: 'string', description: 'Description de la ligne' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire' },
      tva_tx: { type: 'number', description: 'Taux de TVA' },
    },
    required: ['proposal_id'],
  },
};

export async function handleAddProposalLine(args: unknown) {
  const validated = AddProposalLineArgsSchema.parse(args);
  const id = await dolibarrClient.addProposalLine(validated);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ id, message: 'Ligne ajoutée avec succès' }, null, 2),
    }],
  };
}

export const updateProposalLineTool = {
  name: 'dolibarr_update_proposal_line',
  description: 'Modifier une ligne de devis existante',
  inputSchema: {
    type: 'object' as const,
    properties: {
      line_id: { type: 'string', description: 'ID de la ligne' },
      desc: { type: 'string', description: 'Nouvelle description' },
      qty: { type: 'number', description: 'Nouvelle quantité' },
      price: { type: 'number', description: 'Nouveau prix unitaire' },
    },
    required: ['line_id'],
  },
};

export async function handleUpdateProposalLine(args: unknown) {
  const validated = UpdateProposalLineArgsSchema.parse(args);
  await dolibarrClient.updateProposalLine(validated);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ message: 'Ligne mise à jour avec succès' }, null, 2),
    }],
  };
}

export const deleteProposalLineTool = {
  name: 'dolibarr_delete_proposal_line',
  description: 'Supprimer une ligne de devis',
  inputSchema: {
    type: 'object' as const,
    properties: {
      line_id: { type: 'string', description: 'ID de la ligne à supprimer' },
    },
    required: ['line_id'],
  },
};

export async function handleDeleteProposalLine(args: unknown) {
  const validated = DeleteProposalLineArgsSchema.parse(args);
  await dolibarrClient.deleteProposalLine(validated.line_id);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ message: 'Ligne supprimée avec succès' }, null, 2),
    }],
  };
}

export const changeProposalStatusTool = {
  name: 'dolibarr_change_proposal_status',
  description: 'Changer le statut d\'un devis (valider, signer, clore, refuser)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du devis' },
      status: { type: 'string', description: 'Nouveau statut', enum: ['validate', 'close', 'refuse', 'sign'] },
    },
    required: ['id', 'status'],
  },
};

export async function handleChangeProposalStatus(args: unknown) {
  const validated = ChangeProposalStatusArgsSchema.parse(args);
  await dolibarrClient.changeProposalStatus(validated.id, validated.status);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ message: `Statut du devis changé en ${validated.status}` }, null, 2),
    }],
  };
}
