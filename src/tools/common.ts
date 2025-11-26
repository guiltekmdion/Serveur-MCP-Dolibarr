import { dolibarrClient } from '../services/dolibarr.js';
import { 
  SendEmailArgsSchema, 
  GetServerInfoArgsSchema,
  CreateExpenseReportArgsSchema
} from '../types/index.js';

export const sendEmailTool = {
  name: 'dolibarr_send_email',
  description: 'Envoyer un email (via Dolibarr)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      to: { type: 'string', description: 'Destinataire' },
      subject: { type: 'string', description: 'Sujet' },
      message: { type: 'string', description: 'Message' },
      from: { type: 'string', description: 'Expéditeur (optionnel)' },
    },
    required: ['to', 'subject', 'message'],
  },
};

export async function handleSendEmail(args: unknown) {
  const validated = SendEmailArgsSchema.parse(args);
  const result = await dolibarrClient.sendEmail(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: result,
      },
    ],
  };
}

export const getServerInfoTool = {
  name: 'dolibarr_get_server_info',
  description: 'Obtenir des informations sur le serveur Dolibarr',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

export async function handleGetServerInfo(args: unknown) {
  const validated = GetServerInfoArgsSchema.parse(args);
  const info = await dolibarrClient.getServerInfo();
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(info, null, 2),
      },
    ],
  };
}

export const createExpenseReportTool = {
  name: 'dolibarr_create_expense_report',
  description: 'Créer une note de frais',
  inputSchema: {
    type: 'object' as const,
    properties: {
      user_id: { type: 'string', description: 'ID utilisateur' },
      date_debut: { type: 'number', description: 'Date début (timestamp)' },
      date_fin: { type: 'number', description: 'Date fin (timestamp)' },
      note_private: { type: 'string', description: 'Note privée' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['user_id'],
  },
};

export async function handleCreateExpenseReport(args: unknown) {
  const validated = CreateExpenseReportArgsSchema.parse(args);
  const id = await dolibarrClient.createExpenseReport(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Note de frais créée avec succès. ID: ${id}`,
      },
    ],
  };
}

export const commonTools = [
  sendEmailTool,
  getServerInfoTool,
  createExpenseReportTool,
];
