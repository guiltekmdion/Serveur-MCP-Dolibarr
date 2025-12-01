/**
 * Outils MCP pour les Interventions (Fichinter) Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
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
      },
      fk_project: {
        type: 'string',
        description: 'ID du projet associé (obligatoire)'
      }
    },
    required: ['socid', 'fk_project']
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

// === NOUVEAUX OUTILS INTERVENTIONS ===

export const updateInterventionTool = {
  name: 'dolibarr_update_intervention',
  description: 'Mettre à jour une intervention',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'intervention' },
      description: { type: 'string', description: 'Description' },
      date: { type: 'number', description: 'Date' },
      duration: { type: 'number', description: 'Durée (secondes)' },
    },
    required: ['id'],
  },
};

export async function handleUpdateIntervention(args: unknown) {
  const schema = z.object({
    id: z.string(),
    description: z.string().optional(),
    date: z.number().optional(),
    duration: z.number().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/interventions/${id}`, data);
  return { content: [{ type: 'text', text: `Intervention ${id} mise à jour` }] };
}

export const deleteInterventionTool = {
  name: 'dolibarr_delete_intervention',
  description: 'Supprimer une intervention',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'intervention' } },
    required: ['id'],
  },
};

export async function handleDeleteIntervention(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/interventions/${id}`);
  return { content: [{ type: 'text', text: `Intervention ${id} supprimée` }] };
}

export const validateInterventionTool = {
  name: 'dolibarr_validate_intervention',
  description: 'Valider une intervention',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'intervention' } },
    required: ['id'],
  },
};

export async function handleValidateIntervention(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/interventions/${id}/validate`);
  return { content: [{ type: 'text', text: `Intervention ${id} validée` }] };
}

export const closeInterventionTool = {
  name: 'dolibarr_close_intervention',
  description: 'Clore une intervention (Terminée)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'intervention' } },
    required: ['id'],
  },
};

export async function handleCloseIntervention(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/interventions/${id}/close`); // Or set status to done
  return { content: [{ type: 'text', text: `Intervention ${id} close` }] };
}

export const addInterventionLineTool = {
  name: 'dolibarr_add_intervention_line',
  description: 'Ajouter une ligne à une intervention',
  inputSchema: {
    type: 'object' as const,
    properties: {
      intervention_id: { type: 'string', description: 'ID de l\'intervention' },
      description: { type: 'string', description: 'Description' },
      date: { type: 'number', description: 'Date' },
      duration: { type: 'number', description: 'Durée (secondes)' },
    },
    required: ['intervention_id', 'description', 'date', 'duration'],
  },
};

export async function handleAddInterventionLine(args: unknown) {
  const schema = z.object({
    intervention_id: z.string(),
    description: z.string(),
    date: z.number(),
    duration: z.number(),
  });
  const data = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/interventions/${data.intervention_id}/lines`, {
    desc: data.description,
    date: data.date,
    duration: data.duration,
  });
  return { content: [{ type: 'text', text: `Ligne ajoutée à l'intervention ${data.intervention_id}` }] };
}

export const updateInterventionLineTool = {
  name: 'dolibarr_update_intervention_line',
  description: 'Mettre à jour une ligne d\'intervention',
  inputSchema: {
    type: 'object' as const,
    properties: {
      intervention_id: { type: 'string', description: 'ID de l\'intervention' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      description: { type: 'string', description: 'Description' },
      duration: { type: 'number', description: 'Durée' },
    },
    required: ['intervention_id', 'line_id'],
  },
};

export async function handleUpdateInterventionLine(args: unknown) {
  const schema = z.object({
    intervention_id: z.string(),
    line_id: z.string(),
    description: z.string().optional(),
    duration: z.number().optional(),
  });
  const { intervention_id, line_id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/interventions/${intervention_id}/lines/${line_id}`, {
    desc: data.description,
    duration: data.duration,
  });
  return { content: [{ type: 'text', text: `Ligne ${line_id} mise à jour` }] };
}

export const deleteInterventionLineTool = {
  name: 'dolibarr_delete_intervention_line',
  description: 'Supprimer une ligne d\'intervention',
  inputSchema: {
    type: 'object' as const,
    properties: {
      intervention_id: { type: 'string', description: 'ID de l\'intervention' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['intervention_id', 'line_id'],
  },
};

export async function handleDeleteInterventionLine(args: unknown) {
  const schema = z.object({ intervention_id: z.string(), line_id: z.string() });
  const { intervention_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/interventions/${intervention_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée de l'intervention ${intervention_id}` }] };
}

export const getInterventionDocumentTool = {
  name: 'dolibarr_get_intervention_document',
  description: 'Générer/Récupérer la fiche d\'intervention (PDF)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'intervention' },
      model: { type: 'string', description: 'Modèle de document (ex: soleil)' },
    },
    required: ['id'],
  },
};

export async function handleGetInterventionDocument(args: unknown) {
  const schema = z.object({ id: z.string(), model: z.string().optional() });
  const { id, model } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/documents/builddoc`, {
    modulepart: 'fichinter',
    original_file: `${id}/${id}.pdf`,
    doctemplate: model || 'soleil',
    langcode: 'fr_FR'
  });
  return { content: [{ type: 'text', text: `Document généré pour l'intervention ${id}` }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const interventionTools = [
  listInterventionsTool, 
  getInterventionTool, 
  createInterventionTool,
  updateInterventionTool,
  deleteInterventionTool,
  validateInterventionTool,
  closeInterventionTool,
  addInterventionLineTool,
  updateInterventionLineTool,
  deleteInterventionLineTool,
  getInterventionDocumentTool
];

