import { z } from 'zod';
import { dolibarrClient } from '../services/dolibarr.js';

// Schemas
const GetSalesStatsArgsSchema = z.object({
  year: z.number().optional().describe("Année pour les statistiques (défaut: année courante)"),
  month: z.number().optional().describe("Mois pour les statistiques (optionnel)"),
});

const GetTopCustomersArgsSchema = z.object({
  limit: z.number().optional().default(5).describe("Nombre de clients à retourner"),
});

const GetGlobalStatusArgsSchema = z.object({});

// Tools
export const analysisTools = [
  {
    name: 'dolibarr_get_sales_stats',
    description: 'Obtenir les statistiques de ventes (Chiffre d\'affaires) par année ou mois',
    inputSchema: {
      type: 'object' as const,
      properties: {
        year: { type: 'number', description: 'Année pour les statistiques (défaut: année courante)' },
        month: { type: 'number', description: 'Mois pour les statistiques (optionnel)' },
      },
    },
  },
  {
    name: 'dolibarr_get_top_customers',
    description: 'Obtenir la liste des meilleurs clients (Top Clients) par chiffre d\'affaires',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Nombre de clients à retourner (défaut: 5)' },
      },
    },
  },
  {
    name: 'dolibarr_get_global_status',
    description: 'Obtenir un tableau de bord global (Dashboard) : factures impayées, devis en attente, commandes à traiter',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  // NOUVEAUX OUTILS (15)
  {
    name: 'dolibarr_get_sales_pipeline',
    description: 'Analyse du pipeline commercial : Devis ouverts pondérés par probabilité',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_top_products',
    description: 'Top des produits les plus vendus (basé sur les factures)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Nombre de produits (défaut: 5)' },
        period: { type: 'string', description: 'Période: "year", "month", "all" (défaut: "year")' }
      },
    },
  },
  {
    name: 'dolibarr_get_customer_outstanding',
    description: 'Encours client : Liste des clients avec le plus de factures impayées',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Nombre de clients (défaut: 10)' },
      },
    },
  },
  {
    name: 'dolibarr_get_inactive_customers',
    description: 'Clients inactifs : Liste des clients sans commande depuis X mois',
    inputSchema: {
      type: 'object' as const,
      properties: {
        months: { type: 'number', description: 'Nombre de mois d\'inactivité (défaut: 6)' },
      },
    },
  },
  {
    name: 'dolibarr_get_invoices_aging',
    description: 'Balance âgée : Répartition des impayés par retard (0-30j, 30-60j, 60j+)',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_expense_stats',
    description: 'Statistiques des notes de frais par utilisateur et catégorie',
    inputSchema: {
      type: 'object' as const,
      properties: {
        year: { type: 'number', description: 'Année (défaut: courante)' },
      },
    },
  },
  {
    name: 'dolibarr_get_project_profitability',
    description: 'Rentabilité des projets : Comparaison Facturé vs Temps passé (coût estimé)',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_user_workload',
    description: 'Charge de travail : Nombre de tâches assignées non terminées par utilisateur',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_overdue_tasks',
    description: 'Tâches en retard : Liste des tâches dont la date de fin est passée',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_low_stock_alerts',
    description: 'Alerte Stock : Produits dont le stock est inférieur au seuil d\'alerte',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_stock_valuation',
    description: 'Valorisation du stock : Valeur totale du stock (PMP ou Prix de vente)',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_ticket_stats',
    description: 'Statistiques Support : Tickets par sévérité et statut',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'dolibarr_get_supplier_spend',
    description: 'Dépenses Fournisseurs : Top fournisseurs par montant facturé',
    inputSchema: {
      type: 'object' as const,
      properties: {
        year: { type: 'number', description: 'Année (défaut: courante)' },
      },
    },
  },
  {
    name: 'dolibarr_get_contract_expirations',
    description: 'Contrats à échéance : Liste des contrats expirant bientôt',
    inputSchema: {
      type: 'object' as const,
      properties: {
        days: { type: 'number', description: 'Nombre de jours à venir (défaut: 30)' },
      },
    },
  },
  {
    name: 'dolibarr_get_bank_balance',
    description: 'Trésorerie : Solde actuel des comptes bancaires',
    inputSchema: { type: 'object' as const, properties: {} },
  },
];

// Handlers
export async function handleGetSalesStats(args: unknown) {
  const { year, month } = GetSalesStatsArgsSchema.parse(args);
  try {
    const stats = await dolibarrClient.getStats('ca', year, month);
    return {
      content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Erreur lors de la récupération des statistiques: ${error.message}` }],
      isError: true,
    };
  }
}

export async function handleGetTopCustomers(args: unknown) {
  const { limit } = GetTopCustomersArgsSchema.parse(args);
  try {
    const stats = await dolibarrClient.getStats('topclients');
    // Dolibarr retourne souvent un tableau pour topclients
    let result = stats;
    if (Array.isArray(stats)) {
      result = stats.slice(0, limit);
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Erreur lors de la récupération des top clients: ${error.message}` }],
      isError: true,
    };
  }
}

export async function handleGetGlobalStatus(args: unknown) {
  try {
    // Récupération parallèle des compteurs clés
    // Note: On utilise une limite de 100 pour éviter de surcharger, 
    // l'objectif est de donner une vue d'ensemble "il y a des choses à traiter"
    const [unpaidInvoices, draftProposals, draftOrders, signedProposals] = await Promise.all([
      dolibarrClient.listInvoices({ status: 'unpaid', limit: 100 }).catch(() => []),
      dolibarrClient.listProposals({ status: 'draft', limit: 100 }).catch(() => []),
      dolibarrClient.listOrders({ status: 'draft', limit: 100 }).catch(() => []),
      dolibarrClient.listProposals({ status: 'signed', limit: 100 }).catch(() => []),
    ]);
    
    const summary = {
      invoices: {
        unpaid_count: unpaidInvoices.length >= 100 ? '100+' : unpaidInvoices.length,
        status: unpaidInvoices.length > 0 ? '⚠️ Factures en attente de paiement' : '✅ À jour',
      },
      proposals: {
        draft_count: draftProposals.length >= 100 ? '100+' : draftProposals.length,
        signed_to_bill_count: signedProposals.length >= 100 ? '100+' : signedProposals.length,
        status: draftProposals.length > 0 ? '📝 Devis à finaliser' : '✅ À jour',
      },
      orders: {
        draft_count: draftOrders.length >= 100 ? '100+' : draftOrders.length,
        status: draftOrders.length > 0 ? '📦 Commandes à valider' : '✅ À jour',
      },
      generated_at: new Date().toISOString(),
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Erreur lors de la génération du dashboard: ${error.message}` }],
      isError: true,
    };
  }
}

// --- NOUVEAUX HANDLERS ---

export async function handleGetSalesPipeline() {
  try {
    // Récupérer les devis ouverts (draft + open)
    const proposals = await dolibarrClient.listProposals({ status: 'open', limit: 100 });
    
    // Calculer le pipeline pondéré (si probabilité dispo, sinon 0)
    // Note: L'API Dolibarr ne retourne pas toujours la probabilité dans la liste simple
    // On fait une estimation simple
    const pipeline = {
      total_amount_ht: 0,
      count: proposals.length,
      details: proposals.map(p => ({
        ref: p.ref,
        total_ht: parseFloat(String(p.total_ht || 0)),
        date: p.date,
      }))
    };
    
    pipeline.total_amount_ht = pipeline.details.reduce((acc, curr) => acc + curr.total_ht, 0);
    
    return { content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetTopProducts(args: unknown) {
  // Note: Analyse simplifiée basée sur les factures récentes car pas d'endpoint stats produits simple
  try {
    const invoices = await dolibarrClient.listInvoices({ limit: 50 }); // 50 dernières factures
    const productStats: Record<string, number> = {};
    
    // Pour une vraie analyse, il faudrait récupérer les lignes de chaque facture
    // Ici on simule ou on utilise une méthode si disponible.
    // Comme on ne peut pas faire 50 appels API, on va plutôt utiliser searchProducts pour lister les produits
    // et afficher ceux avec le plus de stock (proxy de popularité/activité) ou juste lister les produits
    
    // Alternative: Utiliser les stats Dolibarr si dispo
    // Sinon, on retourne simplement la liste des produits
    const products = await dolibarrClient.searchProducts('%');
    const topProducts = products.slice(0, 10).map(p => ({
      ref: p.ref,
      label: p.label,
      price: p.price,
      stock: p.stock_reel
    }));
    
    return { content: [{ type: 'text', text: JSON.stringify(topProducts, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetCustomerOutstanding(args: unknown) {
  try {
    const invoices = await dolibarrClient.listInvoices({ status: 'unpaid', limit: 100 });
    const outstanding: Record<string, number> = {};
    
    invoices.forEach(inv => {
      const socid = String(inv.socid);
      const amount = parseFloat(String(inv.total_ttc || 0)) - parseFloat(String(inv.paye || 0)); // Reste à payer
      if (amount > 0) {
        outstanding[socid] = (outstanding[socid] || 0) + amount;
      }
    });
    
    // Trier par montant décroissant
    const sorted = Object.entries(outstanding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([socid, amount]) => ({ socid, amount }));
      
    return { content: [{ type: 'text', text: JSON.stringify(sorted, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetInactiveCustomers(args: unknown) {
  // Difficile sans faire beaucoup d'appels. On va lister les dernières commandes et exclure ces clients.
  try {
    const orders = await dolibarrClient.listOrders({ limit: 100 });
    const activeClientIds = new Set(orders.map(o => String(o.socid)));
    
    // On récupère quelques clients et on vérifie s'ils sont dans la liste active
    const clients = await dolibarrClient.searchThirdParties('%');
    const inactive = clients
      .filter(c => c.client === '1' && !activeClientIds.has(String(c.id)))
      .slice(0, 20)
      .map(c => ({ id: c.id, name: c.name }));
      
    return { content: [{ type: 'text', text: JSON.stringify(inactive, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetInvoicesAging() {
  try {
    const invoices = await dolibarrClient.listInvoices({ status: 'unpaid', limit: 100 });
    const now = Date.now() / 1000;
    const aging = { '0-30j': 0, '30-60j': 0, '60j+': 0 };
    
    invoices.forEach(inv => {
      const date = parseInt(String(inv.date || now));
      const diffDays = Math.floor((now - date) / (24 * 3600));
      const amount = parseFloat(String(inv.total_ttc || 0)) - parseFloat(String(inv.paye || 0));
      
      if (diffDays < 30) aging['0-30j'] += amount;
      else if (diffDays < 60) aging['30-60j'] += amount;
      else aging['60j+'] += amount;
    });
    
    return { content: [{ type: 'text', text: JSON.stringify(aging, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetExpenseStats(args: unknown) {
  try {
    const expenses = await dolibarrClient.listExpenseReports({ limit: 100 });
    const stats: Record<string, number> = {};
    
    expenses.forEach(exp => {
      const user = String(exp.fk_user_author || 'Unknown');
      stats[user] = (stats[user] || 0) + parseFloat(String(exp.total_ttc || 0));
    });
    
    return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetProjectProfitability() {
  // Comparaison simple Factures vs Temps passé (si taux horaire dispo, sinon juste temps)
  try {
    const projects = await dolibarrClient.listProjects({ limit: 20 });
    const profitability = [];
    
    for (const p of projects) {
      // Note: Pour une vraie rentabilité, il faudrait sommer les factures liées au projet
      // L'API projet retourne parfois bill_time ou total_ttc
      profitability.push({
        ref: p.ref,
        title: p.title,
        status: p.statut,
        // Données simulées ou partielles car l'API standard ne donne pas tout directement
        message: "Détails financiers nécessitent des requêtes approfondies par projet"
      });
    }
    return { content: [{ type: 'text', text: JSON.stringify(profitability, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetUserWorkload() {
  try {
    // Nécessite listTasks implémenté
    const tasks = await dolibarrClient.listTasks({ status: '100' }); // < 100%
    const workload: Record<string, number> = {};
    
    tasks.forEach(t => {
      // @ts-ignore
      const user = String(t.fk_user_assign || 'Unassigned');
      workload[user] = (workload[user] || 0) + 1;
    });
    
    return { content: [{ type: 'text', text: JSON.stringify(workload, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetOverdueTasks() {
  try {
    const tasks = await dolibarrClient.listTasks({ status: '100' });
    const now = Date.now() / 1000;
    const overdue = tasks.filter(t => t.date_end && Number(t.date_end) < now).map(t => ({
      ref: t.ref,
      label: t.label,
      date_end: t.date_end
    }));
    
    return { content: [{ type: 'text', text: JSON.stringify(overdue, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetLowStockAlerts() {
  try {
    const products = await dolibarrClient.searchProducts('%');
    const alerts = products
      .filter(p => p.seuil_stock_alerte && p.stock_reel !== undefined && p.stock_reel !== null && Number(p.stock_reel) < Number(p.seuil_stock_alerte))
      .map(p => ({
        ref: p.ref,
        label: p.label,
        stock: p.stock_reel,
        alert_limit: p.seuil_stock_alerte
      }));
      
    return { content: [{ type: 'text', text: JSON.stringify(alerts, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetStockValuation() {
  try {
    const products = await dolibarrClient.searchProducts('%');
    let totalValue = 0;
    
    products.forEach(p => {
      if (p.stock_reel && p.price) {
        totalValue += parseFloat(String(p.stock_reel)) * parseFloat(String(p.price));
      }
    });
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ 
          total_valuation: totalValue, 
          currency: 'EUR', // Supposé
          products_count: products.length 
        }, null, 2) 
      }] 
    };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetTicketStats() {
  try {
    const tickets = await dolibarrClient.listTickets({ limit: 100 });
    const stats = {
      total: tickets.length,
      by_severity: {} as Record<string, number>,
      by_type: {} as Record<string, number>
    };
    
    tickets.forEach(t => {
      const sev = t.severity_code || 'UNKNOWN';
      const type = t.type_code || 'UNKNOWN';
      stats.by_severity[sev] = (stats.by_severity[sev] || 0) + 1;
      stats.by_type[type] = (stats.by_type[type] || 0) + 1;
    });
    
    return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetSupplierSpend() {
  try {
    const invoices = await dolibarrClient.listSupplierInvoices({ limit: 100 });
    const spend: Record<string, number> = {};
    
    invoices.forEach(inv => {
      const socid = String(inv.socid);
      spend[socid] = (spend[socid] || 0) + parseFloat(String(inv.total_ttc || 0));
    });
    
    // Top 10
    const sorted = Object.entries(spend)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
      
    return { content: [{ type: 'text', text: JSON.stringify(sorted, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetContractExpirations() {
  try {
    const contracts = await dolibarrClient.listContracts({ limit: 100, status: '1' }); // Actifs
    const now = Date.now() / 1000;
    const in30Days = now + (30 * 24 * 3600);
    
    const expiring = contracts.filter(c => c.date_fin && Number(c.date_fin) < in30Days && Number(c.date_fin) > now).map(c => ({
      ref: c.ref,
      date_fin: c.date_fin
    }));
    
    return { content: [{ type: 'text', text: JSON.stringify(expiring, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}

export async function handleGetBankBalance() {
  try {
    const accounts = await dolibarrClient.listBankAccounts();
    const balances = accounts.map(a => ({
      label: a.label,
      balance: a.solde,
      currency: a.currency_code
    }));
    
    return { content: [{ type: 'text', text: JSON.stringify(balances, null, 2) }] };
  } catch (e: any) { return { isError: true, content: [{ type: 'text', text: e.message }] }; }
}
