/**
 * Outils MCP pour les Tickets Support Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
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

// Export des outils pour l'enregistrement dans server.ts
export const ticketTools = [listTicketsTool, getTicketTool, createTicketTool];

