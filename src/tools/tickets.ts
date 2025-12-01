/**
 * Outils MCP pour les Tickets Support Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
import { ListTicketsArgsSchema, GetTicketArgsSchema, CreateTicketArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les tickets
 */
export const listTicketsTool = {
  name: 'dolibarr_list_tickets',
  description: 'Liste les tickets de support. Peut être filtré par tiers ou statut. Retourne le sujet, le track_id et le statut.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: {
        type: 'string',
        description: 'ID du tiers pour filtrer les tickets'
      },
      status: {
        type: 'string',
        description: 'Statut pour filtrer (0=nouveau, 1=lu, 2=assigné, etc.)'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum de tickets à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListTickets(args: unknown) {
  const validated = ListTicketsArgsSchema.parse(args);
  const tickets = await dolibarrClient.listTickets(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(tickets, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer un ticket
 */
export const getTicketTool = {
  name: 'dolibarr_get_ticket',
  description: 'Récupère les détails complets d\'un ticket par son ID. Inclut le sujet, le message, le type et la sévérité.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID du ticket à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetTicket(args: unknown) {
  const validated = GetTicketArgsSchema.parse(args);
  const ticket = await dolibarrClient.getTicket(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(ticket, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un ticket
 */
export const createTicketTool = {
  name: 'dolibarr_create_ticket',
  description: 'Crée un nouveau ticket de support. Nécessite un sujet et un message. Peut être associé à un tiers.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      subject: {
        type: 'string',
        description: 'Sujet du ticket'
      },
      message: {
        type: 'string',
        description: 'Message/description du problème'
      },
      fk_soc: {
        type: 'string',
        description: 'ID du tiers concerné (optionnel)'
      },
      type_code: {
        type: 'string',
        description: 'Code type du ticket (ex: COM, HELP, ISSUE)'
      },
      severity_code: {
        type: 'string',
        description: 'Code sévérité (ex: LOW, MEDIUM, HIGH, CRITICAL)'
      }
    },
    required: ['subject', 'message']
  }
};

export async function handleCreateTicket(args: unknown) {
  const validated = CreateTicketArgsSchema.parse(args);
  const ticket = await dolibarrClient.createTicket(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(ticket, null, 2),
      },
    ],
  };
}

// === NOUVEAUX OUTILS TICKETS ===

export const updateTicketTool = {
  name: 'dolibarr_update_ticket',
  description: 'Mettre à jour un ticket',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du ticket' },
      subject: { type: 'string', description: 'Sujet' },
      message: { type: 'string', description: 'Message' },
      status: { type: 'string', description: 'Statut' },
    },
    required: ['id'],
  },
};

export async function handleUpdateTicket(args: unknown) {
  const schema = z.object({
    id: z.string(),
    subject: z.string().optional(),
    message: z.string().optional(),
    status: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/tickets/${id}`, data);
  return { content: [{ type: 'text', text: `Ticket ${id} mis à jour` }] };
}

export const deleteTicketTool = {
  name: 'dolibarr_delete_ticket',
  description: 'Supprimer un ticket',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du ticket' } },
    required: ['id'],
  },
};

export async function handleDeleteTicket(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/tickets/${id}`);
  return { content: [{ type: 'text', text: `Ticket ${id} supprimé` }] };
}

export const addTicketMessageTool = {
  name: 'dolibarr_add_ticket_message',
  description: 'Ajouter un message à un ticket',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du ticket' },
      message: { type: 'string', description: 'Contenu du message' },
    },
    required: ['id', 'message'],
  },
};

export async function handleAddTicketMessage(args: unknown) {
  const schema = z.object({ id: z.string(), message: z.string() });
  const { id, message } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/tickets/${id}/messages`, { message });
  return { content: [{ type: 'text', text: `Message ajouté au ticket ${id}` }] };
}

export const getTicketMessagesTool = {
  name: 'dolibarr_get_ticket_messages',
  description: 'Lister les messages d\'un ticket',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du ticket' } },
    required: ['id'],
  },
};

export async function handleGetTicketMessages(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/tickets/${id}/messages`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const assignTicketTool = {
  name: 'dolibarr_assign_ticket',
  description: 'Assigner un ticket à un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du ticket' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
    },
    required: ['id', 'user_id'],
  },
};

export async function handleAssignTicket(args: unknown) {
  const schema = z.object({ id: z.string(), user_id: z.string() });
  const { id, user_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/tickets/${id}`, { fk_user_assign: user_id });
  return { content: [{ type: 'text', text: `Ticket ${id} assigné à l'utilisateur ${user_id}` }] };
}

export const closeTicketTool = {
  name: 'dolibarr_close_ticket',
  description: 'Clore un ticket',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du ticket' } },
    required: ['id'],
  },
};

export async function handleCloseTicket(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/tickets/${id}/close`);
  return { content: [{ type: 'text', text: `Ticket ${id} clos` }] };
}

export const getTicketCategoriesTool = {
  name: 'dolibarr_get_ticket_categories',
  description: 'Lister les catégories de tickets',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

export async function handleGetTicketCategories(args: unknown) {
  // @ts-ignore
  const response = await dolibarrClient['client'].get('/setup/dictionary/ticket_categories');
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const ticketTools = [
  listTicketsTool, 
  getTicketTool, 
  createTicketTool,
  updateTicketTool,
  deleteTicketTool,
  addTicketMessageTool,
  getTicketMessagesTool,
  assignTicketTool,
  closeTicketTool,
  getTicketCategoriesTool
];

