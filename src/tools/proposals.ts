import { z } from 'zod';
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
  description: 'Ajouter une ligne à un devis existant (produit/service)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      proposal_id: { type: 'string', description: 'ID du devis' },
      fk_product: { type: 'string', description: 'ID du produit/service (optionnel si desc fourni)' },
      product_id: { type: 'string', description: 'Alias pour fk_product - ID du produit/service' },
      desc: { type: 'string', description: 'Description de la ligne (utilisée si fk_product non fourni)' },
      qty: { type: 'number', description: 'Quantité (défaut: 1)' },
      subprice: { type: 'number', description: 'Prix unitaire HT' },
      price: { type: 'number', description: 'Alias pour subprice - Prix unitaire HT' },
      tva_tx: { type: 'number', description: 'Taux de TVA en % (ex: 20 pour 20%)' },
      product_type: { type: 'number', description: 'Type: 0=produit physique, 1=service (défaut: 1)' },
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
      subprice: { type: 'number', description: 'Nouveau prix unitaire HT' },
      price: { type: 'number', description: 'Alias pour subprice - Nouveau prix unitaire HT' },
      tva_tx: { type: 'number', description: 'Nouveau taux de TVA en %' },
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

// === NOUVEAUX OUTILS PROPOSITIONS ===

export const closeProposalTool = {
  name: 'dolibarr_close_proposal',
  description: 'Clore une proposition (Acceptée/Refusée) avec une note',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la proposition' },
      status: { type: 'string', description: 'Statut: signed (signée) ou refused (refusée)', enum: ['signed', 'refused'] },
      note: { type: 'string', description: 'Note de fermeture (optionnel)' },
    },
    required: ['id', 'status'],
  },
};

export async function handleCloseProposal(args: unknown) {
  const schema = z.object({ id: z.string(), status: z.enum(['signed', 'refused']), note: z.string().optional() });
  const { id, status, note } = schema.parse(args);
  await dolibarrClient.closeProposal(id, status, note);
  return { content: [{ type: 'text', text: `Proposition ${id} fermée avec statut ${status}` }] };
}

export const reopenProposalTool = {
  name: 'dolibarr_reopen_proposal',
  description: 'Rouvrir une proposition (remettre en brouillon)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la proposition' } },
    required: ['id'],
  },
};

export async function handleReopenProposal(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/proposals/${id}/reopen`);
  return { content: [{ type: 'text', text: `Proposition ${id} rouverte (brouillon)` }] };
}

export const cloneProposalTool = {
  name: 'dolibarr_clone_proposal',
  description: 'Cloner une proposition existante',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la proposition source' },
      socid: { type: 'string', description: 'ID du tiers cible (optionnel, sinon même tiers)' },
    },
    required: ['id'],
  },
};

export async function handleCloneProposal(args: unknown) {
  const schema = z.object({ id: z.string(), socid: z.string().optional() });
  const { id, socid } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post(`/proposals/${id}/clone`, { socid });
  return { content: [{ type: 'text', text: `Proposition clonée ID: ${response.data}` }] };
}

export const createOrderFromProposalTool = {
  name: 'dolibarr_create_order_from_proposal',
  description: 'Créer une commande à partir d\'une proposition signée',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la proposition' } },
    required: ['id'],
  },
};

export async function handleCreateOrderFromProposal(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post(`/orders/createfromproposal/${id}`);
  return { content: [{ type: 'text', text: `Commande créée ID: ${response.data}` }] };
}

export const getProposalContactsTool = {
  name: 'dolibarr_get_proposal_contacts',
  description: 'Lister les contacts associés à une proposition',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la proposition' } },
    required: ['id'],
  },
};

export async function handleGetProposalContacts(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/proposals/${id}/contacts`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const addProposalContactTool = {
  name: 'dolibarr_add_proposal_contact',
  description: 'Ajouter un contact à une proposition',
  inputSchema: {
    type: 'object' as const,
    properties: {
      proposal_id: { type: 'string', description: 'ID de la proposition' },
      contact_id: { type: 'string', description: 'ID du contact' },
      type: { type: 'string', description: 'Type de contact (ex: BILLING, SHIPPING, SERVICE)' },
    },
    required: ['proposal_id', 'contact_id', 'type'],
  },
};

export async function handleAddProposalContact(args: unknown) {
  const schema = z.object({ proposal_id: z.string(), contact_id: z.string(), type: z.string() });
  const { proposal_id, contact_id, type } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/proposals/${proposal_id}/contacts/${contact_id}/${type}`);
  return { content: [{ type: 'text', text: `Contact ${contact_id} ajouté à la proposition ${proposal_id}` }] };
}

export const deleteProposalContactTool = {
  name: 'dolibarr_delete_proposal_contact',
  description: 'Retirer un contact d\'une proposition',
  inputSchema: {
    type: 'object' as const,
    properties: {
      proposal_id: { type: 'string', description: 'ID de la proposition' },
      contact_id: { type: 'string', description: 'ID du contact' },
      type: { type: 'string', description: 'Type de contact' },
    },
    required: ['proposal_id', 'contact_id', 'type'],
  },
};

export async function handleDeleteProposalContact(args: unknown) {
  const schema = z.object({ proposal_id: z.string(), contact_id: z.string(), type: z.string() });
  const { proposal_id, contact_id, type } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/proposals/${proposal_id}/contacts/${contact_id}/${type}`);
  return { content: [{ type: 'text', text: `Contact ${contact_id} retiré de la proposition ${proposal_id}` }] };
}

export const deleteProposalTool = {
  name: 'dolibarr_delete_proposal',
  description: 'Supprimer une proposition (si brouillon)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la proposition' } },
    required: ['id'],
  },
};

export async function handleDeleteProposal(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/proposals/${id}`);
  return { content: [{ type: 'text', text: `Proposition ${id} supprimée` }] };
}

export const getProposalDocumentsTool = {
  name: 'dolibarr_get_proposal_documents',
  description: 'Lister les documents d\'une proposition',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la proposition' } },
    required: ['id'],
  },
};

export async function handleGetProposalDocuments(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const docs = await dolibarrClient.listDocumentsForObject('propal', id);
  return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
}

export const sendProposalEmailTool = {
  name: 'dolibarr_send_proposal_email',
  description: 'Envoyer une proposition par email',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la proposition' },
      email: { type: 'string', description: 'Email destinataire' },
    },
    required: ['id', 'email'],
  },
};

export async function handleSendProposalEmail(args: unknown) {
  const schema = z.object({ id: z.string(), email: z.string() });
  const { id, email } = schema.parse(args);
  await dolibarrClient.sendDocumentByEmail('propal', id, email);
  return { content: [{ type: 'text', text: `Proposition ${id} envoyée à ${email}` }] };
}
