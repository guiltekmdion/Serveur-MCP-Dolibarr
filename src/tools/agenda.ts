/**
 * Outils MCP pour l'Agenda Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListAgendaEventsArgsSchema, GetAgendaEventArgsSchema, CreateAgendaEventArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les événements agenda
 */
export const listAgendaEventsTool = {
  name: 'dolibarr_list_agenda_events',
  description: 'Liste les événements de l\'agenda. Peut être filtré par tiers ou utilisateur. Retourne le libellé, les dates et le type.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: {
        type: 'string',
        description: 'ID du tiers pour filtrer les événements'
      },
      user_id: {
        type: 'string',
        description: 'ID de l\'utilisateur propriétaire pour filtrer'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum d\'événements à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListAgendaEvents(args: unknown) {
  const validated = ListAgendaEventsArgsSchema.parse(args);
  const events = await dolibarrClient.listAgendaEvents(
    validated.thirdparty_id,
    validated.user_id,
    validated.limit
  );
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(events, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer un événement agenda
 */
export const getAgendaEventTool = {
  name: 'dolibarr_get_agenda_event',
  description: 'Récupère les détails complets d\'un événement agenda par son ID. Inclut le libellé, les dates, le type et les participants.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID de l\'événement à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetAgendaEvent(args: unknown) {
  const validated = GetAgendaEventArgsSchema.parse(args);
  const event = await dolibarrClient.getAgendaEvent(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(event, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un événement agenda
 */
export const createAgendaEventTool = {
  name: 'dolibarr_create_agenda_event',
  description: 'Crée un nouvel événement dans l\'agenda. Types: AC_TEL (appel), AC_RDV (rdv), AC_EMAIL (email), AC_FAX, AC_OTH (autre).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      label: {
        type: 'string',
        description: 'Libellé de l\'événement'
      },
      type_code: {
        type: 'string',
        description: 'Type d\'événement: AC_TEL, AC_RDV, AC_EMAIL, AC_FAX, AC_OTH'
      },
      datep: {
        type: 'number',
        description: 'Date/heure de début (timestamp Unix)'
      },
      datef: {
        type: 'number',
        description: 'Date/heure de fin (timestamp Unix, optionnel)'
      },
      socid: {
        type: 'string',
        description: 'ID du tiers associé (optionnel)'
      },
      contactid: {
        type: 'string',
        description: 'ID du contact associé (optionnel)'
      },
      userownerid: {
        type: 'string',
        description: 'ID de l\'utilisateur propriétaire (optionnel)'
      }
    },
    required: ['label', 'type_code', 'datep']
  }
};

export async function handleCreateAgendaEvent(args: unknown) {
  const validated = CreateAgendaEventArgsSchema.parse(args);
  const event = await dolibarrClient.createAgendaEvent(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(event, null, 2),
      },
    ],
  };
}

// Export des outils pour l'enregistrement dans server.ts
export const agendaTools = [listAgendaEventsTool, getAgendaEventTool, createAgendaEventTool];

