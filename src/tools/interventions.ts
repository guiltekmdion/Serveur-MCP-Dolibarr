/**
 * Outils MCP pour les Interventions (Fichinter) Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { ListInterventionsArgsSchema, GetInterventionArgsSchema, CreateInterventionArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les interventions
 */
export const listInterventionsTool = {
  name: 'dolibarr_list_interventions',
  description: 'Liste les fiches d\'intervention. Peut être filtré par tiers ou statut. Retourne la référence, le tiers et la description.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: {
        type: 'string',
        description: 'ID du tiers pour filtrer les interventions'
      },
      status: {
        type: 'string',
        description: 'Statut pour filtrer (0=brouillon, 1=validée, 2=facturée, 3=fermée)'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum d\'interventions à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListInterventions(args: unknown) {
  const validated = ListInterventionsArgsSchema.parse(args);
  const interventions = await dolibarrClient.listInterventions(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(interventions, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer une intervention
 */
export const getInterventionTool = {
  name: 'dolibarr_get_intervention',
  description: 'Récupère les détails complets d\'une intervention par son ID. Inclut la description et les lignes d\'intervention.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID de l\'intervention à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetIntervention(args: unknown) {
  const validated = GetInterventionArgsSchema.parse(args);
  const intervention = await dolibarrClient.getIntervention(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(intervention, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Créer une intervention
 */
export const createInterventionTool = {
  name: 'dolibarr_create_intervention',
  description: 'Crée une nouvelle fiche d\'intervention pour un tiers. Permet de suivre les interventions techniques ou de service.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: {
        type: 'string',
        description: 'ID du tiers client'
      },
      description: {
        type: 'string',
        description: 'Description de l\'intervention'
      },
      datec: {
        type: 'number',
        description: 'Date de création (timestamp Unix)'
      }
    },
    required: ['socid']
  }
};

export async function handleCreateIntervention(args: unknown) {
  const validated = CreateInterventionArgsSchema.parse(args);
  const intervention = await dolibarrClient.createIntervention(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(intervention, null, 2),
      },
    ],
  };
}

// Export des outils pour l'enregistrement dans server.ts
export const interventionTools = [listInterventionsTool, getInterventionTool, createInterventionTool];

