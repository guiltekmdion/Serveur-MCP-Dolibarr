/**
 * Outils MCP : Multi-entités & Multi-devises
 * Gestion de plusieurs sociétés et conversions de devises
 */

import { 
  ListEntitiesArgsSchema,
  CreateEntityArgsSchema,
  ListCurrenciesArgsSchema,
  ConvertCurrencyArgsSchema,
} from '../types/index.js';

export const multiEntityTools = [
  {
    name: 'dolibarr_list_entities',
    description: 'Liste toutes les entités/sociétés de l\'instance multi-entités. Permet de gérer plusieurs sociétés dans une seule instance Dolibarr.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Nombre maximum d\'entités à retourner',
        },
      },
    },
  },
  {
    name: 'dolibarr_get_entity',
    description: 'Récupère les détails d\'une entité spécifique.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de l\'entité',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_create_entity',
    description: 'Crée une nouvelle entité (filiale, société du groupe, etc.). Nécessite le module Multi-Company.',
    inputSchema: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'Nom de l\'entité (ex: "Filiale Paris", "Succursale Lyon")',
        },
        description: {
          type: 'string',
          description: 'Description de l\'entité',
        },
      },
      required: ['label'],
    },
  },
  {
    name: 'dolibarr_list_currencies',
    description: 'Liste toutes les devises disponibles dans Dolibarr (EUR, USD, GBP, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        active: {
          type: 'string',
          enum: ['0', '1'],
          description: '1=Seulement les devises actives, 0=Toutes',
        },
      },
    },
  },
  {
    name: 'dolibarr_convert_currency',
    description: 'Convertit un montant d\'une devise vers une autre en utilisant les taux de change configurés.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Montant à convertir',
        },
        from_currency: {
          type: 'string',
          description: 'Code devise source (EUR, USD, GBP, etc.) - 3 lettres',
        },
        to_currency: {
          type: 'string',
          description: 'Code devise cible (EUR, USD, GBP, etc.) - 3 lettres',
        },
        date: {
          type: 'number',
          description: 'Timestamp UNIX pour le taux de change à cette date (optionnel)',
        },
      },
      required: ['amount', 'from_currency', 'to_currency'],
    },
  },
];

export async function handleMultiEntityRequest(name: string, args: any, dolibarrClient: any): Promise<any> {
  switch (name) {
    case 'dolibarr_list_entities': {
      const validated = ListEntitiesArgsSchema.parse(args);
      return await dolibarrClient.listEntities(validated.limit);
    }
    case 'dolibarr_get_entity': {
      const { id } = args;
      return await dolibarrClient.getEntity(id);
    }
    case 'dolibarr_create_entity': {
      const validated = CreateEntityArgsSchema.parse(args);
      const id = await dolibarrClient.createEntity(validated.label, validated.description);
      return { success: true, id, message: `Entité "${validated.label}" créée` };
    }
    case 'dolibarr_list_currencies': {
      const validated = ListCurrenciesArgsSchema.parse(args);
      return await dolibarrClient.listCurrencies(validated.active);
    }
    case 'dolibarr_convert_currency': {
      const validated = ConvertCurrencyArgsSchema.parse(args);
      const result = await dolibarrClient.convertCurrency(
        validated.amount,
        validated.from_currency,
        validated.to_currency,
        validated.date
      );
      return {
        original_amount: validated.amount,
        original_currency: validated.from_currency,
        converted_amount: result.converted_amount,
        target_currency: validated.to_currency,
        exchange_rate: result.rate,
        date: result.date,
      };
    }
    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
}
