import { dolibarrClient } from '../services/dolibarr.js';
import { 
  ListPaymentsArgsSchema,
  CreatePaymentArgsSchema,
  ValidateProposalArgsSchema,
  CloseProposalArgsSchema,
  ValidateOrderArgsSchema,
  CloseOrderArgsSchema,
  ShipOrderArgsSchema,
  AssignTaskArgsSchema,
  ListMembersArgsSchema,
  CreateMemberArgsSchema,
  GetStatsArgsSchema
} from '../types/index.js';

// === PAIEMENTS ===
export const listPaymentsTool = {
  name: 'dolibarr_list_payments',
  description: 'Liste les paiements reçus. Peut filtrer par facture ou client.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListPayments(args: unknown) {
  const validated = ListPaymentsArgsSchema.parse(args);
  const payments = await dolibarrClient.listPayments(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payments, null, 2),
      },
    ],
  };
}

export const createPaymentTool = {
  name: 'dolibarr_create_payment',
  description: 'Enregistre un paiement sur une facture. Modes: LIQ (Espèces), CHQ (Chèque), CB (Carte), VIR (Virement), etc.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      datepaye: { type: 'number', description: 'Date du paiement (timestamp)' },
      amount: { type: 'number', description: 'Montant du paiement' },
      paiementcode: { type: 'string', description: 'Mode: LIQ, CHQ, CB, VIR' },
      num_payment: { type: 'string', description: 'Numéro de chèque/virement' },
      comment: { type: 'string', description: 'Commentaire' },
      accountid: { type: 'string', description: 'ID du compte bancaire' },
    },
    required: ['invoice_id', 'datepaye', 'amount'],
  },
};

export async function handleCreatePayment(args: unknown) {
  const validated = CreatePaymentArgsSchema.parse(args);
  const id = await dolibarrClient.createPayment(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Paiement enregistré avec succès. ID: ${id}`,
      },
    ],
  };
}

// === PROPOSITIONS AVANCÉES ===
export const validateProposalTool = {
  name: 'dolibarr_validate_proposal',
  description: 'Valide une proposition commerciale (passe du statut "Brouillon" à "Validée").',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la proposition' },
      notrigger: { type: 'number', description: 'Désactiver les triggers (0/1)' },
    },
    required: ['id'],
  },
};

export async function handleValidateProposal(args: unknown) {
  const validated = ValidateProposalArgsSchema.parse(args);
  await dolibarrClient.validateProposal(validated.id, validated.notrigger);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Proposition validée avec succès.',
      },
    ],
  };
}

export const closeProposalTool = {
  name: 'dolibarr_close_proposal',
  description: 'Clôture une proposition. Statut: 2=Signée/Acceptée, 3=Refusée.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la proposition' },
      status: { type: 'string', description: '2=Acceptée, 3=Refusée' },
      note: { type: 'string', description: 'Note de clôture' },
    },
    required: ['id', 'status'],
  },
};

export async function handleCloseProposal(args: unknown) {
  const validated = CloseProposalArgsSchema.parse(args);
  await dolibarrClient.closeProposal(validated.id, validated.status, validated.note);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Proposition ${validated.status === '2' ? 'acceptée' : 'refusée'} avec succès.`,
      },
    ],
  };
}

// === COMMANDES AVANCÉES ===
export const validateOrderTool = {
  name: 'dolibarr_validate_order',
  description: 'Valide une commande (passe du statut "Brouillon" à "Validée").',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la commande' },
      idwarehouse: { type: 'string', description: 'ID de l\'entrepôt' },
      notrigger: { type: 'number', description: 'Désactiver triggers' },
    },
    required: ['id'],
  },
};

export async function handleValidateOrder(args: unknown) {
  const validated = ValidateOrderArgsSchema.parse(args);
  await dolibarrClient.validateOrder(validated.id, validated.idwarehouse, validated.notrigger);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Commande validée avec succès.',
      },
    ],
  };
}

export const closeOrderTool = {
  name: 'dolibarr_close_order',
  description: 'Clôture une commande (toutes les lignes sont livrées).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la commande' },
      note: { type: 'string', description: 'Note de clôture' },
    },
    required: ['id'],
  },
};

export async function handleCloseOrder(args: unknown) {
  const validated = CloseOrderArgsSchema.parse(args);
  await dolibarrClient.closeOrder(validated.id, validated.note);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Commande clôturée avec succès.',
      },
    ],
  };
}

export const shipOrderTool = {
  name: 'dolibarr_ship_order',
  description: 'Crée une expédition pour une commande.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      order_id: { type: 'string', description: 'ID de la commande' },
      date_delivery: { type: 'number', description: 'Date de livraison (timestamp)' },
    },
    required: ['order_id'],
  },
};

export async function handleShipOrder(args: unknown) {
  const validated = ShipOrderArgsSchema.parse(args);
  const id = await dolibarrClient.shipOrder(validated.order_id, validated.date_delivery);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Expédition créée avec succès. ID: ${id}`,
      },
    ],
  };
}

// === TÂCHES AVANCÉES ===
export const assignTaskTool = {
  name: 'dolibarr_assign_task',
  description: 'Affecte un utilisateur à une tâche avec un pourcentage d\'affectation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      task_id: { type: 'string', description: 'ID de la tâche' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
      percentage: { type: 'number', description: 'Pourcentage d\'affectation (0-100)' },
    },
    required: ['task_id', 'user_id'],
  },
};

export async function handleAssignTask(args: unknown) {
  const validated = AssignTaskArgsSchema.parse(args);
  await dolibarrClient.assignTaskToUser(validated.task_id, validated.user_id, validated.percentage);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Utilisateur affecté à la tâche avec succès.',
      },
    ],
  };
}

// === MEMBRES ===
export const listMembersTool = {
  name: 'dolibarr_list_members',
  description: 'Liste les adhérents/membres (pour associations). Statut: -1=Brouillon, 1=Actif, 0=Résilié.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: { type: 'string', description: 'Filtrer par statut' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListMembers(args: unknown) {
  const validated = ListMembersArgsSchema.parse(args);
  const members = await dolibarrClient.listMembers(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(members, null, 2),
      },
    ],
  };
}

export const createMemberTool = {
  name: 'dolibarr_create_member',
  description: 'Crée un nouveau membre/adhérent. morphy: phy=Personne physique, mor=Personne morale.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      firstname: { type: 'string', description: 'Prénom' },
      lastname: { type: 'string', description: 'Nom' },
      email: { type: 'string', description: 'Email' },
      morphy: { type: 'string', description: 'phy ou mor' },
      typeid: { type: 'string', description: 'ID du type d\'adhérent' },
      civility_code: { type: 'string', description: 'Civilité (MR, MME...)' },
    },
    required: ['firstname', 'lastname'],
  },
};

export async function handleCreateMember(args: unknown) {
  const validated = CreateMemberArgsSchema.parse(args);
  const id = await dolibarrClient.createMember(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Membre créé avec succès. ID: ${id}`,
      },
    ],
  };
}

// === STATISTIQUES ===
export const getStatsTool = {
  name: 'dolibarr_get_stats',
  description: 'Obtient des statistiques. Types: ca (Chiffre d\'affaires), topclients (Top clients), proposals (Propositions par statut), payments (Paiements par mois).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      type: { type: 'string', description: 'Type de stats: ca, topclients, proposals, payments' },
      year: { type: 'number', description: 'Année' },
      month: { type: 'number', description: 'Mois (1-12)' },
    },
    required: ['type'],
  },
};

export async function handleGetStats(args: unknown) {
  const validated = GetStatsArgsSchema.parse(args);
  const stats = await dolibarrClient.getStats(validated.type, validated.year, validated.month);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}

export const advancedTools = [
  listPaymentsTool,
  createPaymentTool,
  validateProposalTool,
  closeProposalTool,
  validateOrderTool,
  closeOrderTool,
  shipOrderTool,
  assignTaskTool,
  listMembersTool,
  createMemberTool,
  getStatsTool,
];
