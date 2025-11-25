/**
 * Outils MCP pour les Expéditions Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListShipmentsArgsSchema, GetShipmentArgsSchema, CreateShipmentArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les expéditions
 */
export const listShipmentsTool = {
  name: 'dolibarr_list_shipments',
  description: 'Liste les expéditions. Peut être filtré par tiers ou statut. Retourne la référence, le tiers associé et la date de livraison.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: {
        type: 'string',
        description: 'ID du tiers pour filtrer les expéditions'
      },
      status: {
        type: 'string',
        description: 'Statut pour filtrer (0=brouillon, 1=validée, 2=fermée)'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum d\'expéditions à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListShipments(args: unknown) {
  const validated = ListShipmentsArgsSchema.parse(args);
  const shipments = await dolibarrClient.listShipments(
    validated.thirdparty_id,
    validated.status,
    validated.limit
  );
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(shipments, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer une expédition
 */
export const getShipmentTool = {
  name: 'dolibarr_get_shipment',
  description: 'Récupère les détails complets d\'une expédition par son ID. Inclut toutes les informations de livraison.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID de l\'expédition à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetShipment(args: unknown) {
  const validated = GetShipmentArgsSchema.parse(args);
  const shipment = await dolibarrClient.getShipment(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(shipment, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer une expédition
 */
export const createShipmentTool = {
  name: 'dolibarr_create_shipment',
  description: 'Crée une nouvelle expédition à partir d\'une commande existante. L\'expédition est liée à un tiers et une commande.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: {
        type: 'string',
        description: 'ID du tiers destinataire'
      },
      origin_id: {
        type: 'string',
        description: 'ID de la commande d\'origine'
      },
      date_delivery: {
        type: 'number',
        description: 'Date de livraison prévue (timestamp Unix)'
      }
    },
    required: ['socid', 'origin_id']
  }
};

export async function handleCreateShipment(args: unknown) {
  const validated = CreateShipmentArgsSchema.parse(args);
  const shipment = await dolibarrClient.createShipment(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(shipment, null, 2),
      },
    ],
  };
}

// Export des outils pour l'enregistrement dans server.ts
export const shipmentTools = [listShipmentsTool, getShipmentTool, createShipmentTool];

