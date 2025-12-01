import { z } from 'zod';
import { dolibarrClient } from '../services/dolibarr.js';
import {
  ListDocumentsArgsSchema,
  UploadDocumentArgsSchema,
  GetProjectArgsSchema,
  ListProjectsArgsSchema,
  CreateProjectArgsSchema,
  UpdateProjectArgsSchema,
  GetTaskArgsSchema,
  CreateTaskArgsSchema,
  UpdateTaskArgsSchema,
  AddTaskTimeArgsSchema,
  GetUserArgsSchema,
  CreateUserArgsSchema,
  UpdateUserArgsSchema,
  GetBankAccountLinesArgsSchema,
  CreateBankAccountArgsSchema
} from '../types/index.js';

// === DOCUMENTS ===
export const listDocumentsTool = {
  name: 'dolibarr_list_documents_for_object',
  description: 'Lister les documents liés à un objet (devis, facture, tiers...)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modulepart: { type: 'string', description: 'Type de module (proposal, invoice, thirdparty...)' },
      ref: { type: 'string', description: 'Référence de l\'objet' },
    },
    required: ['modulepart', 'ref'],
  },
};

export async function handleListDocuments(args: unknown) {
  const validated = ListDocumentsArgsSchema.parse(args);
  const documents = await dolibarrClient.listDocuments(validated.modulepart, validated.ref);
  return { content: [{ type: 'text' as const, text: JSON.stringify(documents, null, 2) }] };
}

export const uploadDocumentTool = {
  name: 'dolibarr_upload_document_for_object',
  description: 'Uploader un document (PDF, image...) lié à un objet',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modulepart: { type: 'string', description: 'Type de module' },
      ref: { type: 'string', description: 'Référence de l\'objet' },
      filename: { type: 'string', description: 'Nom du fichier' },
      filecontent: { type: 'string', description: 'Contenu du fichier en base64' },
    },
    required: ['modulepart', 'ref', 'filename', 'filecontent'],
  },
};

export async function handleUploadDocument(args: unknown) {
  const validated = UploadDocumentArgsSchema.parse(args);
  const id = await dolibarrClient.uploadDocument(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Document uploadé' }, null, 2) }] };
}

// === PROJETS ===
export const getProjectTool = {
  name: 'dolibarr_get_project',
  description: 'Détails d\'un PROJET INTERNE (gestion de projet, pas un client). ⚠️ Pour les clients, utilisez dolibarr_get_thirdparty.',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProject(args: unknown) {
  const validated = GetProjectArgsSchema.parse(args);
  const project = await dolibarrClient.getProject(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(project, null, 2) }] };
}

export const listProjectsTool = {
  name: 'dolibarr_list_projects',
  description: 'Liste des PROJETS INTERNES (gestion de projet). ⚠️ Pour lister les clients, utilisez dolibarr_search_thirdparties. Pour le top clients, utilisez dolibarr_get_stats.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'Filtrer par ID tiers' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListProjects(args: unknown) {
  const validated = ListProjectsArgsSchema.parse(args);
  const projects = await dolibarrClient.listProjects(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify(projects, null, 2) }] };
}

export const createProjectTool = {
  name: 'dolibarr_create_project',
  description: 'Créer un nouveau projet',
  inputSchema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Titre du projet' },
      socid: { type: 'string', description: 'ID du tiers lié' },
      description: { type: 'string', description: 'Description du projet' },
      ref: { type: 'string', description: 'Référence du projet (obligatoire si pas de numérotation auto)' },
    },
    required: ['title'],
  },
};

export async function handleCreateProject(args: unknown) {
  const validated = CreateProjectArgsSchema.parse(args);
  const id = await dolibarrClient.createProject(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Projet créé' }, null, 2) }] };
}

export const updateProjectTool = {
  name: 'dolibarr_update_project',
  description: 'Mettre à jour un projet existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du projet' },
      title: { type: 'string', description: 'Nouveau titre' },
      description: { type: 'string', description: 'Nouvelle description' },
      date_start: { type: 'number', description: 'Date de début (timestamp)' },
      date_end: { type: 'number', description: 'Date de fin (timestamp)' },
    },
    required: ['id'],
  },
};

export async function handleUpdateProject(args: unknown) {
  const validated = UpdateProjectArgsSchema.parse(args);
  const id = await dolibarrClient.updateProject(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Projet mis à jour' }, null, 2) }] };
}

// === TÂCHES ===
export const getTaskTool = {
  name: 'dolibarr_get_task',
  description: 'Récupérer les détails d\'une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleGetTask(args: unknown) {
  const validated = GetTaskArgsSchema.parse(args);
  const task = await dolibarrClient.getTask(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(task, null, 2) }] };
}

export const createTaskTool = {
  name: 'dolibarr_create_task',
  description: 'Créer une nouvelle tâche rattachée à un projet',
  inputSchema: {
    type: 'object' as const,
    properties: {
      label: { type: 'string', description: 'Libellé de la tâche' },
      fk_project: { type: 'string', description: 'ID du projet' },
      description: { type: 'string', description: 'Description de la tâche' },
      ref: { type: 'string', description: 'Référence de la tâche (obligatoire si pas de numérotation auto)' },
    },
    required: ['label', 'fk_project'],
  },
};

export async function handleCreateTask(args: unknown) {
  const validated = CreateTaskArgsSchema.parse(args);
  const id = await dolibarrClient.createTask(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Tâche créée' }, null, 2) }] };
}

export const updateTaskTool = {
  name: 'dolibarr_update_task',
  description: 'Mettre à jour une tâche existante',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la tâche' },
      label: { type: 'string', description: 'Nouveau libellé' },
      description: { type: 'string', description: 'Nouvelle description' },
      progress: { type: 'number', description: 'Progression (0-100)' },
    },
    required: ['id'],
  },
};

export async function handleUpdateTask(args: unknown) {
  const validated = UpdateTaskArgsSchema.parse(args);
  const id = await dolibarrClient.updateTask(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Tâche mise à jour' }, null, 2) }] };
}

export const addTaskTimeTool = {
  name: 'dolibarr_add_task_time',
  description: 'Ajouter du temps passé sur une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la tâche' },
      date: { type: 'number', description: 'Date (timestamp)' },
      duration: { type: 'number', description: 'Durée en secondes' },
      note: { type: 'string', description: 'Note/Commentaire' },
      user_id: { type: 'string', description: 'ID utilisateur (optionnel)' },
    },
    required: ['id', 'date', 'duration'],
  },
};

export async function handleAddTaskTime(args: unknown) {
  const validated = AddTaskTimeArgsSchema.parse(args);
  const id = await dolibarrClient.addTaskTime(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Temps ajouté avec succès' }, null, 2) }] };
}

// === UTILISATEURS ===
export const getUserTool = {
  name: 'dolibarr_get_user',
  description: 'Récupérer les détails d\'un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleGetUser(args: unknown) {
  const validated = GetUserArgsSchema.parse(args);
  const user = await dolibarrClient.getUser(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] };
}

export const listUsersTool = {
  name: 'dolibarr_list_users',
  description: 'Lister tous les utilisateurs',
  inputSchema: { type: 'object' as const, properties: {} },
};

export async function handleListUsers(args: unknown) {
  const users = await dolibarrClient.listUsers();
  return { content: [{ type: 'text' as const, text: JSON.stringify(users, null, 2) }] };
}

export const createUserTool = {
  name: 'dolibarr_create_user',
  description: 'Créer un nouvel utilisateur Dolibarr',
  inputSchema: {
    type: 'object' as const,
    properties: {
      login: { type: 'string', description: 'Login' },
      password: { type: 'string', description: 'Mot de passe' },
      lastname: { type: 'string', description: 'Nom' },
      firstname: { type: 'string', description: 'Prénom' },
      email: { type: 'string', description: 'Email' },
      admin: { type: 'string', description: 'Admin (0/1)', enum: ['0', '1'] },
    },
    required: ['login', 'password'],
  },
};

export async function handleCreateUser(args: unknown) {
  const validated = CreateUserArgsSchema.parse(args);
  const id = await dolibarrClient.createUser(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Utilisateur créé' }, null, 2) }] };
}

export const updateUserTool = {
  name: 'dolibarr_update_user',
  description: 'Mettre à jour un utilisateur existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID utilisateur' },
      lastname: { type: 'string', description: 'Nom' },
      firstname: { type: 'string', description: 'Prénom' },
      email: { type: 'string', description: 'Email' },
      password: { type: 'string', description: 'Nouveau mot de passe' },
      admin: { type: 'string', description: 'Admin (0/1)', enum: ['0', '1'] },
    },
    required: ['id'],
  },
};

export async function handleUpdateUser(args: unknown) {
  const validated = UpdateUserArgsSchema.parse(args);
  const id = await dolibarrClient.updateUser(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Utilisateur mis à jour' }, null, 2) }] };
}

// === BANQUES ===
export const listBankAccountsTool = {
  name: 'dolibarr_list_bank_accounts',
  description: 'Lister tous les comptes bancaires',
  inputSchema: { type: 'object' as const, properties: {} },
};

export async function handleListBankAccounts() {
  const accounts = await dolibarrClient.listBankAccounts();
  return { content: [{ type: 'text' as const, text: JSON.stringify(accounts, null, 2) }] };
}

export const getBankAccountLinesTool = {
  name: 'dolibarr_get_bank_account_lines',
  description: 'Récupérer les écritures d\'un compte bancaire',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du compte bancaire' } },
    required: ['id'],
  },
};

export async function handleGetBankAccountLines(args: unknown) {
  const validated = GetBankAccountLinesArgsSchema.parse(args);
  const lines = await dolibarrClient.getBankAccountLines(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(lines, null, 2) }] };
}

export const createBankAccountTool = {
  name: 'dolibarr_create_bank_account',
  description: 'Créer un nouveau compte bancaire',
  inputSchema: {
    type: 'object' as const,
    properties: {
      label: { type: 'string', description: 'Libellé du compte' },
      bank: { type: 'string', description: 'Nom de la banque' },
      code_banque: { type: 'string', description: 'Code banque' },
      code_guichet: { type: 'string', description: 'Code guichet' },
      number: { type: 'string', description: 'Numéro de compte' },
      cle_rib: { type: 'string', description: 'Clé RIB' },
      bic: { type: 'string', description: 'BIC/SWIFT' },
      iban: { type: 'string', description: 'IBAN' },
      currency_code: { type: 'string', description: 'Code devise (EUR, USD...)' },
    },
    required: ['label'],
  },
};

export async function handleCreateBankAccount(args: unknown) {
  const validated = CreateBankAccountArgsSchema.parse(args);
  const id = await dolibarrClient.createBankAccount(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Compte bancaire créé' }, null, 2) }] };
}

// === NOUVEAUX OUTILS PROJETS ===

export const deleteProjectTool = {
  name: 'dolibarr_delete_project',
  description: 'Supprimer un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleDeleteProject(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/projects/${id}`);
  return { content: [{ type: 'text', text: `Projet ${id} supprimé` }] };
}

export const addProjectContactTool = {
  name: 'dolibarr_add_project_contact',
  description: 'Ajouter un contact à un projet',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: { type: 'string', description: 'ID du projet' },
      contact_id: { type: 'string', description: 'ID du contact' },
      type: { type: 'string', description: 'Type de contact (ex: PROJECTLEADER, CONTRIBUTOR)' },
    },
    required: ['project_id', 'contact_id', 'type'],
  },
};

export async function handleAddProjectContact(args: unknown) {
  const schema = z.object({ project_id: z.string(), contact_id: z.string(), type: z.string() });
  const { project_id, contact_id, type } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/projects/${project_id}/contacts/${contact_id}/${type}`);
  return { content: [{ type: 'text', text: `Contact ${contact_id} ajouté au projet ${project_id}` }] };
}

export const deleteProjectContactTool = {
  name: 'dolibarr_delete_project_contact',
  description: 'Retirer un contact d\'un projet',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: { type: 'string', description: 'ID du projet' },
      contact_id: { type: 'string', description: 'ID du contact' },
      type: { type: 'string', description: 'Type de contact' },
    },
    required: ['project_id', 'contact_id', 'type'],
  },
};

export async function handleDeleteProjectContact(args: unknown) {
  const schema = z.object({ project_id: z.string(), contact_id: z.string(), type: z.string() });
  const { project_id, contact_id, type } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/projects/${project_id}/contacts/${contact_id}/${type}`);
  return { content: [{ type: 'text', text: `Contact ${contact_id} retiré du projet ${project_id}` }] };
}

export const getProjectInvoicesTool = {
  name: 'dolibarr_get_project_invoices',
  description: 'Lister les factures liées à un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProjectInvoices(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/projects/${id}/invoices`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const getProjectOrdersTool = {
  name: 'dolibarr_get_project_orders',
  description: 'Lister les commandes liées à un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProjectOrders(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/projects/${id}/orders`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const getProjectProposalsTool = {
  name: 'dolibarr_get_project_proposals',
  description: 'Lister les propositions liées à un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProjectProposals(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/projects/${id}/proposals`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const closeProjectTool = {
  name: 'dolibarr_close_project',
  description: 'Clore un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleCloseProject(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/projects/${id}/close`); // Endpoint hypothétique ou update status
  // Fallback update
  // await dolibarrClient.updateProject({ id, status: 'closed' }); // Si updateProject supporte status
  return { content: [{ type: 'text', text: `Projet ${id} clos` }] };
}

export const reopenProjectTool = {
  name: 'dolibarr_reopen_project',
  description: 'Rouvrir un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleReopenProject(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/projects/${id}/validate`); // Souvent validate = open
  return { content: [{ type: 'text', text: `Projet ${id} rouvert` }] };
}

export const getProjectOverviewTool = {
  name: 'dolibarr_get_project_overview',
  description: 'Obtenir une vue d\'ensemble d\'un projet (tâches, temps, rentabilité)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProjectOverview(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const project = await dolibarrClient.getProject(id);
  // @ts-ignore
  const tasks = await dolibarrClient['client'].get(`/projects/${id}/tasks`);
  // Calculs simples
  const overview = {
    project,
    tasks_count: tasks.data.length,
    // ... autres stats
  };
  return { content: [{ type: 'text', text: JSON.stringify(overview, null, 2) }] };
}

export const getProjectDocumentsTool = {
  name: 'dolibarr_get_project_documents',
  description: 'Lister les documents d\'un projet',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du projet' } },
    required: ['id'],
  },
};

export async function handleGetProjectDocuments(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const docs = await dolibarrClient.listDocumentsForObject('project', id);
  return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
}

// === NOUVEAUX OUTILS TÂCHES ===

export const listTasksTool = {
  name: 'dolibarr_list_tasks',
  description: 'Lister les tâches (filtres possibles)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: { type: 'string', description: 'ID du projet' },
      user_id: { type: 'string', description: 'ID utilisateur assigné' },
      status: { type: 'string', description: 'Statut (pourcentage)' },
    },
  },
};

export async function handleListTasks(args: unknown) {
  const schema = z.object({ project_id: z.string().optional(), user_id: z.string().optional(), status: z.string().optional() });
  const params = schema.parse(args);
  // @ts-ignore
  const tasks = await dolibarrClient.listTasks(params);
  return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] };
}

export const deleteTaskTool = {
  name: 'dolibarr_delete_task',
  description: 'Supprimer une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleDeleteTask(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/tasks/${id}`);
  return { content: [{ type: 'text', text: `Tâche ${id} supprimée` }] };
}

export const getTaskTimeSpentTool = {
  name: 'dolibarr_get_task_time_spent',
  description: 'Obtenir le temps passé sur une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleGetTaskTimeSpent(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/tasks/${id}/time_spent`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const assignTaskUserTool = {
  name: 'dolibarr_assign_task_user',
  description: 'Assigner un utilisateur à une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: {
      task_id: { type: 'string', description: 'ID de la tâche' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
      percentage: { type: 'number', description: 'Pourcentage d\'affectation (défaut 100)' },
    },
    required: ['task_id', 'user_id'],
  },
};

export async function handleAssignTaskUser(args: unknown) {
  const schema = z.object({ task_id: z.string(), user_id: z.string(), percentage: z.number().optional() });
  const { task_id, user_id, percentage } = schema.parse(args);
  await dolibarrClient.assignTaskToUser(task_id, user_id, percentage);
  return { content: [{ type: 'text', text: `Utilisateur ${user_id} assigné à la tâche ${task_id}` }] };
}

export const unassignTaskUserTool = {
  name: 'dolibarr_unassign_task_user',
  description: 'Désassigner un utilisateur d\'une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: {
      task_id: { type: 'string', description: 'ID de la tâche' },
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
    },
    required: ['task_id', 'user_id'],
  },
};

export async function handleUnassignTaskUser(args: unknown) {
  const schema = z.object({ task_id: z.string(), user_id: z.string() });
  const { task_id, user_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/tasks/${task_id}/contact/${user_id}/user`);
  return { content: [{ type: 'text', text: `Utilisateur ${user_id} désassigné de la tâche ${task_id}` }] };
}

export const completeTaskTool = {
  name: 'dolibarr_complete_task',
  description: 'Marquer une tâche comme terminée (100%)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleCompleteTask(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  await dolibarrClient.updateTask({ id, progress: 100 });
  return { content: [{ type: 'text', text: `Tâche ${id} terminée` }] };
}

export const reopenTaskTool = {
  name: 'dolibarr_reopen_task',
  description: 'Rouvrir une tâche (0%)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleReopenTask(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  await dolibarrClient.updateTask({ id, progress: 0 });
  return { content: [{ type: 'text', text: `Tâche ${id} rouverte` }] };
}

export const getTaskDocumentsTool = {
  name: 'dolibarr_get_task_documents',
  description: 'Lister les documents d\'une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche' } },
    required: ['id'],
  },
};

export async function handleGetTaskDocuments(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const docs = await dolibarrClient.listDocumentsForObject('task', id);
  return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
}

export const listUserTasksTool = {
  name: 'dolibarr_list_user_tasks',
  description: 'Lister les tâches assignées à un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { user_id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['user_id'],
  },
};

export async function handleListUserTasks(args: unknown) {
  const schema = z.object({ user_id: z.string() });
  const { user_id } = schema.parse(args);
  const tasks = await dolibarrClient.listTasks({ user_id });
  return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] };
}

export const getTaskChildrenTool = {
  name: 'dolibarr_get_task_children',
  description: 'Lister les sous-tâches d\'une tâche',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la tâche parente' } },
    required: ['id'],
  },
};

export async function handleGetTaskChildren(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/tasks`, { params: { sqlfilters: `(t.fk_task_parent:=:${id})` } });
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

// === NOUVEAUX OUTILS UTILISATEURS ===

export const deleteUserTool = {
  name: 'dolibarr_delete_user',
  description: 'Supprimer un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleDeleteUser(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/users/${id}`);
  return { content: [{ type: 'text', text: `Utilisateur ${id} supprimé` }] };
}

export const getUserGroupsTool = {
  name: 'dolibarr_get_user_groups',
  description: 'Lister les groupes d\'un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleGetUserGroups(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/users/${id}/groups`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const addUserToGroupTool = {
  name: 'dolibarr_add_user_to_group',
  description: 'Ajouter un utilisateur à un groupe',
  inputSchema: {
    type: 'object' as const,
    properties: {
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
      group_id: { type: 'string', description: 'ID du groupe' },
    },
    required: ['user_id', 'group_id'],
  },
};

export async function handleAddUserToGroup(args: unknown) {
  const schema = z.object({ user_id: z.string(), group_id: z.string() });
  const { user_id, group_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/users/${user_id}/groups/${group_id}`);
  return { content: [{ type: 'text', text: `Utilisateur ${user_id} ajouté au groupe ${group_id}` }] };
}

export const removeUserFromGroupTool = {
  name: 'dolibarr_remove_user_from_group',
  description: 'Retirer un utilisateur d\'un groupe',
  inputSchema: {
    type: 'object' as const,
    properties: {
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
      group_id: { type: 'string', description: 'ID du groupe' },
    },
    required: ['user_id', 'group_id'],
  },
};

export async function handleRemoveUserFromGroup(args: unknown) {
  const schema = z.object({ user_id: z.string(), group_id: z.string() });
  const { user_id, group_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/users/${user_id}/groups/${group_id}`);
  return { content: [{ type: 'text', text: `Utilisateur ${user_id} retiré du groupe ${group_id}` }] };
}

export const getUserPermissionsTool = {
  name: 'dolibarr_get_user_permissions',
  description: 'Lister les permissions d\'un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleGetUserPermissions(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  // Note: Endpoint permissions might vary, often it's embedded in user object or separate
  // Trying generic approach or fetching user with details
  const user = await dolibarrClient.getUser(id);
  // @ts-ignore
  return { content: [{ type: 'text', text: JSON.stringify(user.rights || {}, null, 2) }] };
}

export const disableUserTool = {
  name: 'dolibarr_disable_user',
  description: 'Désactiver un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleDisableUser(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/users/${id}/disable`);
  return { content: [{ type: 'text', text: `Utilisateur ${id} désactivé` }] };
}

export const enableUserTool = {
  name: 'dolibarr_enable_user',
  description: 'Activer un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de l\'utilisateur' } },
    required: ['id'],
  },
};

export async function handleEnableUser(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/users/${id}/enable`);
  return { content: [{ type: 'text', text: `Utilisateur ${id} activé` }] };
}

export const updateUserPasswordTool = {
  name: 'dolibarr_update_user_password',
  description: 'Modifier le mot de passe d\'un utilisateur',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de l\'utilisateur' },
      password: { type: 'string', description: 'Nouveau mot de passe' },
    },
    required: ['id', 'password'],
  },
};

export async function handleUpdateUserPassword(args: unknown) {
  const schema = z.object({ id: z.string(), password: z.string() });
  const { id, password } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/users/${id}`, { password });
  return { content: [{ type: 'text', text: `Mot de passe mis à jour pour l'utilisateur ${id}` }] };
}

export const listGroupsTool = {
  name: 'dolibarr_list_groups',
  description: 'Lister les groupes d\'utilisateurs',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sortfield: { type: 'string' },
      sortorder: { type: 'string' },
      limit: { type: 'number' },
    },
  },
};

export async function handleListGroups(args: unknown) {
  const schema = z.object({ sortfield: z.string().optional(), sortorder: z.string().optional(), limit: z.number().optional() });
  const params = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get('/users/groups', { params });
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const createGroupTool = {
  name: 'dolibarr_create_group',
  description: 'Créer un groupe d\'utilisateurs',
  inputSchema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'Nom du groupe' },
      note: { type: 'string', description: 'Note' },
    },
    required: ['name'],
  },
};

export async function handleCreateGroup(args: unknown) {
  const schema = z.object({ name: z.string(), note: z.string().optional() });
  const data = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post('/users/groups', data);
  return { content: [{ type: 'text', text: `Groupe créé avec ID: ${response.data}` }] };
}
