/**
 * Outils MCP pour les Notes de Frais Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import { dolibarrClient } from '../services/dolibarr.js';
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
  const reports = await dolibarrClient.listExpenseReports(
    validated.user_id,
    validated.status,
    validated.limit
  );
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

// Export des outils pour l'enregistrement dans server.ts
export const expenseReportTools = [listExpenseReportsTool, getExpenseReportTool];

