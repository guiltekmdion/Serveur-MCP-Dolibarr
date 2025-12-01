/**
 * Outils MCP pour les Notes de Frais Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
import { z } from 'zod';
import { ListExpenseReportsArgsSchema, GetExpenseReportArgsSchema } from '../types/index.js';

/**
 * Outil MCP : Lister les notes de frais
 */
export const listExpenseReportsTool = {
  name: 'dolibarr_list_expense_reports',
  description: 'Liste les notes de frais. Peut être filtré par utilisateur ou statut. Retourne la référence, les dates et les montants.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      user_id: {
        type: 'string',
        description: 'ID de l\'utilisateur auteur pour filtrer'
      },
      status: {
        type: 'string',
        description: 'Statut pour filtrer (0=brouillon, 2=validée, 5=approuvée, 6=payée, 99=refusée)'
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum de notes à retourner'
      }
    },
    required: [] as string[]
  }
};

export async function handleListExpenseReports(args: unknown) {
  const validated = ListExpenseReportsArgsSchema.parse(args);
  const reports = await dolibarrClient.listExpenseReports(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(reports, null, 2),
      },
    ],
  };
}

/**
 * Outil MCP : Récupérer une note de frais
 */
export const getExpenseReportTool = {
  name: 'dolibarr_get_expense_report',
  description: 'Récupère les détails complets d\'une note de frais par son ID. Inclut les lignes de frais, montants HT/TTC et statut.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'ID de la note de frais à récupérer'
      }
    },
    required: ['id']
  }
};

export async function handleGetExpenseReport(args: unknown) {
  const validated = GetExpenseReportArgsSchema.parse(args);
  const report = await dolibarrClient.getExpenseReport(validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(report, null, 2),
      },
    ],
  };
}

// === NOUVEAUX OUTILS NOTES DE FRAIS ===

export const createExpenseReportTool = {
  name: 'dolibarr_create_expense_report',
  description: 'Créer une nouvelle note de frais',
  inputSchema: {
    type: 'object' as const,
    properties: {
      user_id: { type: 'string', description: 'ID de l\'utilisateur' },
      date_start: { type: 'number', description: 'Date de début' },
      date_end: { type: 'number', description: 'Date de fin' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['user_id', 'date_start', 'date_end'],
  },
};

export async function handleCreateExpenseReport(args: unknown) {
  const schema = z.object({
    user_id: z.string(),
    date_start: z.number(),
    date_end: z.number(),
    note_public: z.string().optional(),
  });
  const data = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post('/expensereports', {
    fk_user_author: data.user_id,
    date_debut: data.date_start,
    date_fin: data.date_end,
    note_public: data.note_public,
  });
  return { content: [{ type: 'text', text: `Note de frais créée avec ID: ${response.data}` }] };
}

export const updateExpenseReportTool = {
  name: 'dolibarr_update_expense_report',
  description: 'Mettre à jour une note de frais',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la note' },
      date_start: { type: 'number', description: 'Date de début' },
      date_end: { type: 'number', description: 'Date de fin' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['id'],
  },
};

export async function handleUpdateExpenseReport(args: unknown) {
  const schema = z.object({
    id: z.string(),
    date_start: z.number().optional(),
    date_end: z.number().optional(),
    note_public: z.string().optional(),
  });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/expensereports/${id}`, data);
  return { content: [{ type: 'text', text: `Note de frais ${id} mise à jour` }] };
}

export const deleteExpenseReportTool = {
  name: 'dolibarr_delete_expense_report',
  description: 'Supprimer une note de frais',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la note' } },
    required: ['id'],
  },
};

export async function handleDeleteExpenseReport(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/expensereports/${id}`);
  return { content: [{ type: 'text', text: `Note de frais ${id} supprimée` }] };
}

export const validateExpenseReportTool = {
  name: 'dolibarr_validate_expense_report',
  description: 'Valider une note de frais (soumettre pour approbation)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la note' } },
    required: ['id'],
  },
};

export async function handleValidateExpenseReport(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/expensereports/${id}/validate`);
  return { content: [{ type: 'text', text: `Note de frais ${id} validée` }] };
}

export const approveExpenseReportTool = {
  name: 'dolibarr_approve_expense_report',
  description: 'Approuver une note de frais',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la note' } },
    required: ['id'],
  },
};

export async function handleApproveExpenseReport(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/expensereports/${id}/approve`);
  return { content: [{ type: 'text', text: `Note de frais ${id} approuvée` }] };
}

export const payExpenseReportTool = {
  name: 'dolibarr_pay_expense_report',
  description: 'Marquer une note de frais comme payée',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la note' } },
    required: ['id'],
  },
};

export async function handlePayExpenseReport(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/expensereports/${id}/setpaid`);
  return { content: [{ type: 'text', text: `Note de frais ${id} marquée comme payée` }] };
}

export const addExpenseReportLineTool = {
  name: 'dolibarr_add_expense_report_line',
  description: 'Ajouter une ligne de frais',
  inputSchema: {
    type: 'object' as const,
    properties: {
      report_id: { type: 'string', description: 'ID de la note' },
      description: { type: 'string', description: 'Description' },
      price: { type: 'number', description: 'Montant HT' },
      qty: { type: 'number', description: 'Quantité' },
      date: { type: 'number', description: 'Date de la dépense' },
      type_code: { type: 'string', description: 'Code type de frais (ex: TRAJET, REPAS)' },
      vat_rate: { type: 'number', description: 'Taux de TVA' },
    },
    required: ['report_id', 'description', 'price', 'date', 'type_code'],
  },
};

export async function handleAddExpenseReportLine(args: unknown) {
  const schema = z.object({
    report_id: z.string(),
    description: z.string(),
    price: z.number(),
    qty: z.number().optional().default(1),
    date: z.number(),
    type_code: z.string(),
    vat_rate: z.number().optional().default(0),
  });
  const data = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/expensereports/${data.report_id}/lines`, {
    comments: data.description,
    value_unit: data.price,
    qty: data.qty,
    date: data.date,
    type_fees_code: data.type_code,
    vat_rate: data.vat_rate,
  });
  return { content: [{ type: 'text', text: `Ligne ajoutée à la note de frais ${data.report_id}` }] };
}

export const deleteExpenseReportLineTool = {
  name: 'dolibarr_delete_expense_report_line',
  description: 'Supprimer une ligne de frais',
  inputSchema: {
    type: 'object' as const,
    properties: {
      report_id: { type: 'string', description: 'ID de la note' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['report_id', 'line_id'],
  },
};

export async function handleDeleteExpenseReportLine(args: unknown) {
  const schema = z.object({ report_id: z.string(), line_id: z.string() });
  const { report_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/expensereports/${report_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée de la note ${report_id}` }] };
}

// Export des outils pour l'enregistrement dans server.ts
export const expenseReportTools = [
  listExpenseReportsTool, 
  getExpenseReportTool,
  createExpenseReportTool,
  updateExpenseReportTool,
  deleteExpenseReportTool,
  validateExpenseReportTool,
  approveExpenseReportTool,
  payExpenseReportTool,
  addExpenseReportLineTool,
  deleteExpenseReportLineTool
];

