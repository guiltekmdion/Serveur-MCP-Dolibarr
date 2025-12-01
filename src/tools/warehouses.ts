/**
 * Outils MCP pour les Entrepôts Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
import { ListWarehousesArgsSchema, GetWarehouseArgsSchema, CreateWarehouseArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les entrepôts
 */
export const listWarehousesTool = {
  name: 'dolibarr_list_warehouses',
  description: 'Liste tous les entrepôts disponibles dans Dolibarr. Retourne la référence, le libellé, le lieu et le statut de chaque entrepôt.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: {
        type: 'number',
        description: 'Nombre maximum d\'entrepôts à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListWarehouses(args: unknown) {
  const validated = ListWarehousesArgsSchema.parse(args);
  const warehouses = await dolibarrClient.listWarehouses(validated.limit);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(warehouses, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer un entrepôt
 */
export const getWarehouseTool = {
  name: 'dolibarr_get_warehouse',
  description: 'Récupère les détails complets d\'un entrepôt par son ID. Inclut la référence, le libellé, la description, le lieu et le statut.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID de l\'entrepôt à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetWarehouse(args: unknown) {
  const validated = GetWarehouseArgsSchema.parse(args);
  const warehouse = await dolibarrClient.getWarehouse(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(warehouse, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un entrepôt
 */
export const createWarehouseTool = {
  name: 'dolibarr_create_warehouse',
  description: 'Créer un nouvel entrepôt',
  inputSchema: {
    type: 'object' as const,
    properties: {
      label: { type: 'string', description: 'Libellé de l\'entrepôt' },
      description: { type: 'string', description: 'Description' },
      statut: { type: 'string', description: 'Statut (0=fermé, 1=ouvert)', enum: ['0', '1'] },
      lieu: { type: 'string', description: 'Lieu' },
      address: { type: 'string', description: 'Adresse' },
      zip: { type: 'string', description: 'Code postal' },
      town: { type: 'string', description: 'Ville' },
    },
    required: ['label'],
  },
};

export async function handleCreateWarehouse(args: unknown) {
  const validated = CreateWarehouseArgsSchema.parse(args);
  const id = await dolibarrClient.createWarehouse(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ id, message: 'Entrepôt créé avec succès' }, null, 2),
      },
    ],
  };
}

// === NOUVEAUX OUTILS ENTREPÔTS ===

export const updateWarehouseTool = {
  name: 'dolibarr_update_warehouse',
  description: 'Mettre à jour un entrepôt',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'entrepôt' },
      label: { type: 'string', description: 'Nom' },
      description: { type: 'string', description: 'Description' },
      status: { type: 'string', description: 'Statut' },
    },
    required: ['id'],
  },
};

export async function handleUpdateWarehouse(args: unknown) {
  const schema = z.object({
    id: z.string(),
    label: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/warehouses/${id}`, data);
  return { content: [{ type: 'text', text: `Entrepôt ${id} mis à jour` }] };
}

export const deleteWarehouseTool = {
  name: 'dolibarr_delete_warehouse',
  description: 'Supprimer un entrepôt',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'entrepôt' } },
    required: ['id'],
  },
};

export async function handleDeleteWarehouse(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/warehouses/${id}`);
  return { content: [{ type: 'text', text: `Entrepôt ${id} supprimé` }] };
}

export const getWarehouseStockTool = {
  name: 'dolibarr_get_warehouse_stock',
  description: 'Lister le stock d\'un entrepôt (produits)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'entrepôt' } },
    required: ['id'],
  },
};

export async function handleGetWarehouseStock(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/warehouses/${id}/products`); 
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const warehouseTools = [
  listWarehousesTool, 
  getWarehouseTool, 
  createWarehouseTool,
  updateWarehouseTool,
  deleteWarehouseTool,
  getWarehouseStockTool
];

