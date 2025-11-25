/**
 * Outils MCP pour les Mouvements de Stock Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListStockMovementsArgsSchema, CreateStockMovementArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les mouvements de stock
 */
export const listStockMovementsTool = {
  name: 'dolibarr_list_stock_movements',
  description: 'Liste les mouvements de stock. Peut être filtré par produit ou entrepôt. Retourne le type de mouvement, la quantité et la date.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: {
        type: 'string',
        description: 'ID du produit pour filtrer les mouvements'
      },
      warehouse_id: {
        type: 'string',
        description: 'ID de l\'entrepôt pour filtrer les mouvements'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum de mouvements à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListStockMovements(args: unknown) {
  const validated = ListStockMovementsArgsSchema.parse(args);
  const movements = await dolibarrClient.listStockMovements(
    validated.product_id,
    validated.warehouse_id,
    validated.limit
  );
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(movements, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer un mouvement de stock
 */
export const createStockMovementTool = {
  name: 'dolibarr_create_stock_movement',
  description: 'Crée un nouveau mouvement de stock (entrée, sortie ou transfert). Types: 0=entrée, 1=sortie, 2=transfert+, 3=transfert-.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: {
        type: 'string',
        description: 'ID du produit concerné'
      },
      warehouse_id: {
        type: 'string',
        description: 'ID de l\'entrepôt'
      },
      qty: {
        type: 'number',
        description: 'Quantité du mouvement'
      },
      type: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Type de mouvement: 0=entrée, 1=sortie, 2=transfert+, 3=transfert-'
      },
      label: {
        type: 'string',
        description: 'Libellé/commentaire du mouvement'
      }
    },
    required: ['product_id', 'warehouse_id', 'qty']
  }
};

export async function handleCreateStockMovement(args: unknown) {
  const validated = CreateStockMovementArgsSchema.parse(args);
  const movement = await dolibarrClient.createStockMovement(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(movement, null, 2),
      },
    ],
  };
}

// Export des outils pour l'enregistrement dans server.ts
export const stockTools = [listStockMovementsTool, createStockMovementTool];

