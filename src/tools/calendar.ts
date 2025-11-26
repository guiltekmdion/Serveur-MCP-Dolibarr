/**
 * Outils MCP : Calendrier, Absences & Planning
 * Gestion des congés, absences, réservations de ressources
 */

import { 
  ListHolidaysArgsSchema,
  CreateHolidayArgsSchema,
  ValidateHolidayArgsSchema,
  CreateResourceBookingArgsSchema,
} from '../types/index.js';

export const calendarTools = [
  {
    name: 'dolibarr_list_holidays',
    description: 'Liste les demandes de congés/absences. Peut filtrer par utilisateur, statut ou année.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'Filtrer par ID utilisateur',
        },
        status: {
          type: 'string',
          description: 'Statut : 1=Brouillon, 2=Validée, 3=Approuvée, 4=Refusée, 5=Annulée',
        },
        year: {
          type: 'number',
          description: 'Année (ex: 2024)',
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum de résultats',
        },
      },
    },
  },
  {
    name: 'dolibarr_get_holiday',
    description: 'Récupère les détails d\'une demande de congé spécifique.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de la demande de congé',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_create_holiday',
    description: 'Crée une nouvelle demande de congé pour un utilisateur.',
    inputSchema: {
      type: 'object',
      properties: {
        fk_user: {
          type: 'string',
          description: 'ID de l\'utilisateur qui demande le congé',
        },
        date_debut: {
          type: 'number',
          description: 'Timestamp UNIX de début du congé',
        },
        date_fin: {
          type: 'number',
          description: 'Timestamp UNIX de fin du congé',
        },
        halfday: {
          type: 'string',
          enum: ['0', '1', '2'],
          description: '0=Journée entière, 1=Matin seulement, 2=Après-midi seulement',
        },
        fk_type: {
          type: 'string',
          description: 'ID du type de congé (CP, RTT, Maladie, etc.)',
        },
        description: {
          type: 'string',
          description: 'Motif ou commentaire',
        },
      },
      required: ['fk_user', 'date_debut', 'date_fin'],
    },
  },
  {
    name: 'dolibarr_validate_holiday',
    description: 'Approuve ou refuse une demande de congé.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de la demande de congé',
        },
        approve: {
          type: 'boolean',
          description: 'true=Approuver, false=Refuser',
        },
      },
      required: ['id', 'approve'],
    },
  },
  {
    name: 'dolibarr_delete_holiday',
    description: 'Supprime une demande de congé.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de la demande à supprimer',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_create_resource_booking',
    description: 'Réserve une ressource (salle, véhicule, équipement) pour un utilisateur sur une période.',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: {
          type: 'string',
          description: 'ID de la ressource à réserver',
        },
        user_id: {
          type: 'string',
          description: 'ID de l\'utilisateur qui effectue la réservation',
        },
        date_start: {
          type: 'number',
          description: 'Timestamp UNIX de début de réservation',
        },
        date_end: {
          type: 'number',
          description: 'Timestamp UNIX de fin de réservation',
        },
        note: {
          type: 'string',
          description: 'Note ou description de la réservation',
        },
      },
      required: ['resource_id', 'user_id', 'date_start', 'date_end'],
    },
  },
  {
    name: 'dolibarr_list_resource_bookings',
    description: 'Liste les réservations de ressources. Peut filtrer par ressource ou utilisateur.',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: {
          type: 'string',
          description: 'Filtrer par ID de ressource',
        },
        user_id: {
          type: 'string',
          description: 'Filtrer par ID utilisateur',
        },
      },
    },
  },
];

export async function handleCalendarRequest(name: string, args: any, dolibarrClient: any): Promise<any> {
  switch (name) {
    case 'dolibarr_list_holidays': {
      const validated = ListHolidaysArgsSchema.parse(args);
      return await dolibarrClient.listHolidays(
        validated.user_id,
        validated.status,
        validated.year,
        validated.limit
      );
    }
    case 'dolibarr_get_holiday': {
      const { id } = args;
      return await dolibarrClient.getHoliday(id);
    }
    case 'dolibarr_create_holiday': {
      const validated = CreateHolidayArgsSchema.parse(args);
      const id = await dolibarrClient.createHoliday(validated);
      return { success: true, id, message: 'Demande de congé créée' };
    }
    case 'dolibarr_validate_holiday': {
      const validated = ValidateHolidayArgsSchema.parse(args);
      await dolibarrClient.validateHoliday(validated.id, validated.approve);
      return { 
        success: true, 
        message: validated.approve ? 'Congé approuvé' : 'Congé refusé' 
      };
    }
    case 'dolibarr_delete_holiday': {
      const { id } = args;
      await dolibarrClient.deleteHoliday(id);
      return { success: true, message: 'Demande de congé supprimée' };
    }
    case 'dolibarr_create_resource_booking': {
      const validated = CreateResourceBookingArgsSchema.parse(args);
      const id = await dolibarrClient.createResourceBooking(
        validated.resource_id,
        validated.user_id,
        validated.date_start,
        validated.date_end,
        validated.note
      );
      return { success: true, id, message: 'Ressource réservée' };
    }
    case 'dolibarr_list_resource_bookings': {
      const { resource_id, user_id } = args;
      return await dolibarrClient.listResourceBookings(resource_id, user_id);
    }
    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
}
