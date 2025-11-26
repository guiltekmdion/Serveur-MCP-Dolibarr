/**
 * Outils MCP : Gestion des Abonnements (Subscriptions)
 * Abonnements récurrents, renouvellements automatiques, facturation périodique
 */

import { 
  ListSubscriptionsArgsSchema,
  CreateSubscriptionArgsSchema,
  RenewSubscriptionArgsSchema,
  CancelSubscriptionArgsSchema,
} from '../types/index.js';

export const subscriptionsTools = [
  {
    name: 'dolibarr_list_subscriptions',
    description: 'Liste tous les abonnements. Peut filtrer par tiers ou statut.',
    inputSchema: {
      type: 'object',
      properties: {
        thirdparty_id: {
          type: 'string',
          description: 'Filtrer par ID du tiers',
        },
        status: {
          type: 'string',
          description: 'Filtrer par statut (0=Brouillon, 1=Validé, -1=Annulé)',
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum de résultats',
        },
      },
    },
  },
  {
    name: 'dolibarr_get_subscription',
    description: 'Récupère les détails d\'un abonnement spécifique.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de l\'abonnement',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_create_subscription',
    description: 'Crée un nouvel abonnement pour un tiers avec facturation récurrente.',
    inputSchema: {
      type: 'object',
      properties: {
        socid: {
          type: 'string',
          description: 'ID du tiers/client',
        },
        fk_product: {
          type: 'string',
          description: 'ID du produit/service (optionnel)',
        },
        date_start: {
          type: 'number',
          description: 'Timestamp UNIX de début d\'abonnement',
        },
        date_end: {
          type: 'number',
          description: 'Timestamp UNIX de fin d\'abonnement (optionnel si récurrent)',
        },
        amount: {
          type: 'number',
          description: 'Montant de l\'abonnement',
        },
        note: {
          type: 'string',
          description: 'Note sur l\'abonnement',
        },
        recurring: {
          type: 'boolean',
          description: 'Abonnement récurrent (true) ou ponctuel (false)',
        },
        frequency: {
          type: 'string',
          enum: ['monthly', 'quarterly', 'yearly'],
          description: 'Fréquence de facturation (mensuel, trimestriel, annuel)',
        },
      },
      required: ['socid', 'date_start', 'amount'],
    },
  },
  {
    name: 'dolibarr_renew_subscription',
    description: 'Renouvelle un abonnement existant pour une durée supplémentaire.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de l\'abonnement à renouveler',
        },
        duration: {
          type: 'number',
          description: 'Durée du renouvellement en mois (défaut: 12)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_cancel_subscription',
    description: 'Annule un abonnement actif.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de l\'abonnement à annuler',
        },
        note: {
          type: 'string',
          description: 'Raison de l\'annulation',
        },
      },
      required: ['id'],
    },
  },
];

export async function handleSubscriptionsRequest(name: string, args: any, dolibarrClient: any): Promise<any> {
  switch (name) {
    case 'dolibarr_list_subscriptions': {
      const validated = ListSubscriptionsArgsSchema.parse(args);
      return await dolibarrClient.listSubscriptions(
        validated.thirdparty_id,
        validated.status,
        validated.limit
      );
    }
    case 'dolibarr_get_subscription': {
      const { id } = args;
      return await dolibarrClient.getSubscription(id);
    }
    case 'dolibarr_create_subscription': {
      const validated = CreateSubscriptionArgsSchema.parse(args);
      const id = await dolibarrClient.createSubscription(validated);
      return { 
        success: true, 
        id, 
        message: `Abonnement créé${validated.recurring ? ' (récurrent)' : ''}` 
      };
    }
    case 'dolibarr_renew_subscription': {
      const validated = RenewSubscriptionArgsSchema.parse(args);
      await dolibarrClient.renewSubscription(validated.id, validated.duration || 12);
      return { 
        success: true, 
        message: `Abonnement renouvelé pour ${validated.duration || 12} mois` 
      };
    }
    case 'dolibarr_cancel_subscription': {
      const validated = CancelSubscriptionArgsSchema.parse(args);
      await dolibarrClient.cancelSubscription(validated.id, validated.note);
      return { success: true, message: 'Abonnement annulé' };
    }
    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
}
