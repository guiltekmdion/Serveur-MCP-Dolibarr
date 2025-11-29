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

// === OUTIL GUIDE - Aide à choisir le bon outil ===
export const helpGuideTool = {
  name: 'dolibarr_help',
  description: 'GUIDE RAPIDE - Quel outil utiliser ? Appelez cette fonction en premier si vous ne savez pas quel outil choisir.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      question: { type: 'string', description: 'Ce que l\'utilisateur veut faire' },
    },
    required: ['question'],
  },
};

export async function handleHelpGuide(args: unknown) {
  const parsed = args as { question?: string };
  const q = (parsed.question || '').toLowerCase();
  
  const guides: { keywords: string[], tool: string, description: string }[] = [
    // CLIENTS / TOP CLIENTS
    { keywords: ['top client', 'meilleur client', 'plus gros client', 'meilleurs clients'], 
      tool: 'dolibarr_get_stats', description: 'Utilisez type="topclients" pour le classement des clients par CA' },
    { keywords: ['chercher client', 'trouver client', 'rechercher client', 'client nommé'],
      tool: 'dolibarr_search_thirdparties', description: 'Recherche de clients/fournisseurs par nom' },
    { keywords: ['détail client', 'info client', 'fiche client'],
      tool: 'dolibarr_get_thirdparty', description: 'Détails complets d\'un client par son ID' },
    { keywords: ['créer client', 'nouveau client', 'ajouter client'],
      tool: 'dolibarr_create_thirdparty', description: 'Créer un nouveau client/prospect' },
      
    // FACTURES
    { keywords: ['facture impayée', 'factures en retard', 'impayé'],
      tool: 'dolibarr_list_invoices', description: 'Utilisez status="unpaid" pour les impayées' },
    { keywords: ['créer facture', 'nouvelle facture'],
      tool: 'dolibarr_create_invoice', description: 'Créer une facture' },
      
    // DEVIS / PROPOSITIONS
    { keywords: ['devis', 'proposition commerciale', 'propal'],
      tool: 'dolibarr_list_proposals', description: 'Liste des devis/propositions' },
    { keywords: ['créer devis', 'nouveau devis'],
      tool: 'dolibarr_create_proposal', description: 'Créer un devis' },
      
    // COMMANDES
    { keywords: ['commande client', 'commandes'],
      tool: 'dolibarr_get_order / dolibarr_create_order', description: 'Gestion des commandes clients' },
      
    // PRODUITS
    { keywords: ['produit', 'article', 'catalogue'],
      tool: 'dolibarr_search_products', description: 'Recherche dans le catalogue produits' },
      
    // STATISTIQUES
    { keywords: ['chiffre affaire', 'ca', 'statistique', 'stats'],
      tool: 'dolibarr_get_stats', description: 'type="ca" pour CA, "topclients" pour top clients' },
      
    // PROJETS (attention confusion)
    { keywords: ['projet interne', 'gestion projet', 'tâche projet'],
      tool: 'dolibarr_list_projects', description: 'Projets internes (≠ clients)' },
  ];
  
  const matches = guides.filter(g => g.keywords.some(kw => q.includes(kw)));
  
  if (matches.length > 0) {
    const result = matches.map(m => `• ${m.tool} → ${m.description}`).join('\n');
    return { content: [{ type: 'text' as const, text: `Outils recommandés:\n${result}` }] };
  }
  
  return { content: [{ type: 'text' as const, text: `
GUIDE RAPIDE DOLIBARR MCP:

📊 STATISTIQUES & CLASSEMENTS:
  • dolibarr_get_stats(type="topclients") → Top clients par CA
  • dolibarr_get_stats(type="ca") → Chiffre d'affaires

👥 CLIENTS/FOURNISSEURS:
  • dolibarr_search_thirdparties → Chercher par nom
  • dolibarr_get_thirdparty → Détails par ID
  • dolibarr_create_thirdparty → Créer

📄 DEVIS:
  • dolibarr_list_proposals → Lister les devis
  • dolibarr_create_proposal → Créer un devis

💰 FACTURES:
  • dolibarr_list_invoices(status="unpaid") → Impayées
  • dolibarr_create_invoice → Créer

📦 COMMANDES:
  • dolibarr_get_order / dolibarr_create_order

🏭 PRODUITS:
  • dolibarr_search_products → Rechercher
  
⚠️ ATTENTION: "Projets" = projets internes, PAS les clients!
` }] };
}

export const commonTools = [
  helpGuideTool, // En premier pour être prioritaire
  sendEmailTool,
  getServerInfoTool,
  createExpenseReportTool,
];

export const commonHandlers: Record<string, Function> = {
  'dolibarr_help': handleHelpGuide,
  'dolibarr_send_email': handleSendEmail,
  'dolibarr_get_server_info': handleGetServerInfo,
  'dolibarr_create_expense_report': handleCreateExpenseReport,
};
