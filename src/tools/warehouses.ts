/**
 * Outils MCP pour les Entrepôts Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListWarehousesArgsSchema, GetWarehouseArgsSchema } from '../types/index.js';

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

// Export des outils pour l'enregistrement dans server.ts
export const warehouseTools = [listWarehousesTool, getWarehouseTool];

