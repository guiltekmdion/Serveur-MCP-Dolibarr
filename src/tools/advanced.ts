import { dolibarrClient } from '../services/dolibarr.js';
import {
  ListDocumentsArgsSchema,
  UploadDocumentArgsSchema,
  GetProjectArgsSchema,
  ListProjectsArgsSchema,
  CreateProjectArgsSchema,
  GetTaskArgsSchema,
  CreateTaskArgsSchema,
  GetUserArgsSchema,
  GetBankAccountLinesArgsSchema
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
  description: 'Récupérer les détails d\'un projet',
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
  description: 'Lister et filtrer les projets',
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
    },
    required: ['title'],
  },
};

export async function handleCreateProject(args: unknown) {
  const validated = CreateProjectArgsSchema.parse(args);
  const id = await dolibarrClient.createProject(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Projet créé' }, null, 2) }] };
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
    },
    required: ['label', 'fk_project'],
  },
};

export async function handleCreateTask(args: unknown) {
  const validated = CreateTaskArgsSchema.parse(args);
  const id = await dolibarrClient.createTask(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Tâche créée' }, null, 2) }] };
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

export async function handleListUsers() {
  const users = await dolibarrClient.listUsers();
  return { content: [{ type: 'text' as const, text: JSON.stringify(users, null, 2) }] };
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
