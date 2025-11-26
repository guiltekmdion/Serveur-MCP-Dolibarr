import { dolibarrClient } from '../services/dolibarr.js';
import { 
  ListTimeEntriesArgsSchema,
  ListTasksForProjectArgsSchema,
  ListLeadsArgsSchema,
  GetLeadArgsSchema,
  CreateLeadArgsSchema,
  UpdateLeadArgsSchema
} from '../types/index.js';

// === TIME ENTRIES (Temps passé) ===
export const listTimeEntriesTool = {
  name: 'dolibarr_list_time_entries',
  description: 'Liste le temps passé sur les tâches/projets. Retourne qui a travaillé, combien de temps, sur quelle tâche. Permet de générer des rapports de temps.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: { type: 'string', description: 'Filtrer par projet' },
      task_id: { type: 'string', description: 'Filtrer par tâche' },
      user_id: { type: 'string', description: 'Filtrer par utilisateur' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListTimeEntries(args: unknown) {
  const validated = ListTimeEntriesArgsSchema.parse(args);
  const entries = await dolibarrClient.listTimeEntries(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(entries, null, 2),
      },
    ],
  };
}

export const listTasksForProjectTool = {
  name: 'dolibarr_list_project_tasks',
  description: 'Liste toutes les tâches d\'un projet avec leurs détails.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: { type: 'string', description: 'ID du projet' },
    },
    required: ['project_id'],
  },
};

export async function handleListTasksForProject(args: unknown) {
  const validated = ListTasksForProjectArgsSchema.parse(args);
  const tasks = await dolibarrClient.listTasksForProject(validated.project_id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(tasks, null, 2),
      },
    ],
  };
}

// === OPPORTUNITÉS / LEADS ===
export const listLeadsTool = {
  name: 'dolibarr_list_leads',
  description: 'Liste les opportunités commerciales (leads). Statuts: 0=Prospect, 1=Qualifié, 2=Proposition, 3=Négociation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: { type: 'string', description: 'Filtrer par statut (0-3)' },
      thirdparty_id: { type: 'string', description: 'Filtrer par tiers' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListLeads(args: unknown) {
  const validated = ListLeadsArgsSchema.parse(args);
  const leads = await dolibarrClient.listLeads(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(leads, null, 2),
      },
    ],
  };
}

export const getLeadTool = {
  name: 'dolibarr_get_lead',
  description: 'Récupère les détails d\'une opportunité par son ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'opportunité' },
    },
    required: ['id'],
  },
};

export async function handleGetLead(args: unknown) {
  const validated = GetLeadArgsSchema.parse(args);
  const lead = await dolibarrClient.getLead(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(lead, null, 2),
      },
    ],
  };
}

export const createLeadTool = {
  name: 'dolibarr_create_lead',
  description: 'Crée une nouvelle opportunité commerciale. Peut être associée à un tiers existant ou créer un nouveau contact.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      lastname: { type: 'string', description: 'Nom du contact' },
      firstname: { type: 'string', description: 'Prénom' },
      society: { type: 'string', description: 'Société' },
      email: { type: 'string', description: 'Email' },
      phone: { type: 'string', description: 'Téléphone' },
      fk_soc: { type: 'string', description: 'ID du tiers existant' },
      fk_project: { type: 'string', description: 'ID du projet associé' },
      amount_guess: { type: 'number', description: 'Montant estimé' },
      status: { type: 'string', description: 'Statut: 0=Prospect, 1=Qualifié, 2=Proposition, 3=Négociation' },
    },
    required: ['lastname'],
  },
};

export async function handleCreateLead(args: unknown) {
  const validated = CreateLeadArgsSchema.parse(args);
  const id = await dolibarrClient.createLead(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Opportunité créée avec succès. ID: ${id}`,
      },
    ],
  };
}

export const updateLeadTool = {
  name: 'dolibarr_update_lead',
  description: 'Met à jour une opportunité (statut, projet associé, montant, date de clôture).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'opportunité' },
      status: { type: 'string', description: 'Nouveau statut (0-3)' },
      fk_project: { type: 'string', description: 'ID du projet à associer' },
      amount_guess: { type: 'number', description: 'Montant estimé' },
      date_closure: { type: 'number', description: 'Date de clôture (timestamp)' },
    },
    required: ['id'],
  },
};

export async function handleUpdateLead(args: unknown) {
  const validated = UpdateLeadArgsSchema.parse(args);
  await dolibarrClient.updateLead(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Opportunité mise à jour avec succès.',
      },
    ],
  };
}
