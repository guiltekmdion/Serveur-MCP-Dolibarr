/**
 * Outils MCP pour les Entrepôts Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
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

// Export des outils pour l'enregistrement dans server.ts
export const warehouseTools = [listWarehousesTool, getWarehouseTool, createWarehouseTool];

