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
