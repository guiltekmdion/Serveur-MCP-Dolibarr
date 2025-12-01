/**
 * Outils MCP pour les Expéditions Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
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
  const shipments = await dolibarrClient.listShipments(validated);
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

// === NOUVEAUX OUTILS EXPÉDITIONS ===

export const updateShipmentTool = {
  name: 'dolibarr_update_shipment',
  description: 'Mettre à jour une expédition',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'expédition' },
      tracking_number: { type: 'string', description: 'Numéro de suivi' },
      date_delivery: { type: 'number', description: 'Date de livraison' },
      weight: { type: 'number', description: 'Poids' },
      size: { type: 'string', description: 'Dimensions' },
    },
    required: ['id'],
  },
};

export async function handleUpdateShipment(args: unknown) {
  const schema = z.object({
    id: z.string(),
    tracking_number: z.string().optional(),
    date_delivery: z.number().optional(),
    weight: z.number().optional(),
    size: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/shipments/${id}`, data);
  return { content: [{ type: 'text', text: `Expédition ${id} mise à jour` }] };
}

export const deleteShipmentTool = {
  name: 'dolibarr_delete_shipment',
  description: 'Supprimer une expédition',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'expédition' } },
    required: ['id'],
  },
};

export async function handleDeleteShipment(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/shipments/${id}`);
  return { content: [{ type: 'text', text: `Expédition ${id} supprimée` }] };
}

export const validateShipmentTool = {
  name: 'dolibarr_validate_shipment',
  description: 'Valider une expédition',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'expédition' } },
    required: ['id'],
  },
};

export async function handleValidateShipment(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/shipments/${id}/validate`);
  return { content: [{ type: 'text', text: `Expédition ${id} validée` }] };
}

export const closeShipmentTool = {
  name: 'dolibarr_close_shipment',
  description: 'Clore une expédition (Livrée)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'expédition' } },
    required: ['id'],
  },
};

export async function handleCloseShipment(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/shipments/${id}/close`); // Or set status to delivered
  return { content: [{ type: 'text', text: `Expédition ${id} close (livrée)` }] };
}

export const createShipmentLineTool = {
  name: 'dolibarr_create_shipment_line',
  description: 'Ajouter une ligne à une expédition',
  inputSchema: {
    type: 'object' as const,
    properties: {
      shipment_id: { type: 'string', description: 'ID de l\'expédition' },
      product_id: { type: 'string', description: 'ID du produit' },
      qty: { type: 'number', description: 'Quantité' },
      origin_line_id: { type: 'string', description: 'ID de la ligne de commande d\'origine' },
    },
    required: ['shipment_id', 'product_id', 'qty'],
  },
};

export async function handleCreateShipmentLine(args: unknown) {
  const schema = z.object({
    shipment_id: z.string(),
    product_id: z.string(),
    qty: z.number(),
    origin_line_id: z.string().optional(),
  });
  const data = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/shipments/${data.shipment_id}/lines`, {
    fk_product: data.product_id,
    qty: data.qty,
    fk_origin_line: data.origin_line_id,
  });
  return { content: [{ type: 'text', text: `Ligne ajoutée à l'expédition ${data.shipment_id}` }] };
}

export const deleteShipmentLineTool = {
  name: 'dolibarr_delete_shipment_line',
  description: 'Supprimer une ligne d\'expédition',
  inputSchema: {
    type: 'object' as const,
    properties: {
      shipment_id: { type: 'string', description: 'ID de l\'expédition' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['shipment_id', 'line_id'],
  },
};

export async function handleDeleteShipmentLine(args: unknown) {
  const schema = z.object({ shipment_id: z.string(), line_id: z.string() });
  const { shipment_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/shipments/${shipment_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée de l'expédition ${shipment_id}` }] };
}

export const getShipmentDocumentTool = {
  name: 'dolibarr_get_shipment_document',
  description: 'Générer/Récupérer le bon d\'expédition (PDF)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'expédition' },
      model: { type: 'string', description: 'Modèle de document (ex: merou)' },
    },
    required: ['id'],
  },
};

export async function handleGetShipmentDocument(args: unknown) {
  const schema = z.object({ id: z.string(), model: z.string().optional() });
  const { id, model } = schema.parse(args);
  // @ts-ignore
  // Note: Usually /documents/builddoc is used or specific endpoint
  // Assuming standard pattern for document generation
  await dolibarrClient['client'].put(`/documents/builddoc`, {
    modulepart: 'shipment',
    original_file: `${id}/${id}.pdf`, // Placeholder logic
    doctemplate: model || 'merou',
    langcode: 'fr_FR'
  });
  return { content: [{ type: 'text', text: `Document généré pour l'expédition ${id}` }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const shipmentTools = [
  listShipmentsTool, 
  getShipmentTool, 
  createShipmentTool,
  updateShipmentTool,
  deleteShipmentTool,
  validateShipmentTool,
  closeShipmentTool,
  createShipmentLineTool,
  deleteShipmentLineTool,
  getShipmentDocumentTool
];

