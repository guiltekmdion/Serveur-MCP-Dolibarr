import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { dolibarrClient } from '../services/dolibarr.js';

export const RESOURCES: Resource[] = [
  {
    uri: 'dolibarr://thirdparties/recent',
    name: 'Recent Thirdparties',
    description: 'List of recently modified thirdparties (limit 10)',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://proposals/open',
    name: 'Open Proposals',
    description: 'List of currently open commercial proposals',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://invoices/unpaid',
    name: 'Unpaid Invoices',
    description: 'List of unpaid invoices',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://orders/pending',
    name: 'Pending Orders',
    description: 'List of validated orders not yet shipped or invoiced',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://products/lowstock',
    name: 'Low Stock Products',
    description: 'Products with stock below minimum threshold',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://dashboard/summary',
    name: 'Dashboard Summary',
    description: 'Quick overview: open proposals, unpaid invoices, pending orders',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://agenda/today',
    name: 'Today\'s Events',
    description: 'Agenda events scheduled for today',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://invoices/overdue',
    name: 'Overdue Invoices',
    description: 'Invoices past their due date',
    mimeType: 'application/json',
  }
];

export async function handleReadResource(uri: string): Promise<string> {
  
  switch (true) {
    case uri === 'dolibarr://thirdparties/recent': {
      const thirdparties = await dolibarrClient.searchThirdParties(''); 
      return JSON.stringify(thirdparties, null, 2);
    }

    case uri === 'dolibarr://proposals/open': {
      const proposals = await dolibarrClient.listProposals({ status: '1', limit: 20 });
      return JSON.stringify(proposals, null, 2);
    }

    case uri === 'dolibarr://invoices/unpaid': {
      const invoices = await dolibarrClient.listInvoices({ status: 'unpaid', limit: 20 });
      return JSON.stringify(invoices, null, 2);
    }

    case uri === 'dolibarr://orders/pending': {
      // Utilise searchProducts car listOrders n'existe pas - on récupère via l'API directe
      try {
        const response = await dolibarrClient['client'].get('/orders', { 
          params: { status: '1', limit: 20, sortfield: 't.rowid', sortorder: 'DESC' } 
        });
        return JSON.stringify(response.data, null, 2);
      } catch {
        return JSON.stringify({ message: 'Orders API not available' }, null, 2);
      }
    }

    case uri === 'dolibarr://products/lowstock': {
      // Récupère les produits et filtre ceux en stock faible
      const products = await dolibarrClient.searchProducts('');
      const lowStock = products.filter((p: any) => {
        const stock = parseFloat(p.stock_reel || '0');
        const minStock = parseFloat(p.seuil_stock_alerte || '0');
        return minStock > 0 && stock <= minStock;
      });
      return JSON.stringify(lowStock, null, 2);
    }

    case uri === 'dolibarr://dashboard/summary': {
      // Récupère un résumé rapide en parallèle
      const [proposals, invoices] = await Promise.all([
        dolibarrClient.listProposals({ status: '1', limit: 5 }),
        dolibarrClient.listInvoices({ status: 'unpaid', limit: 5 })
      ]);
      
      const summary = {
        timestamp: new Date().toISOString(),
        open_proposals: {
          count: proposals.length,
          total_amount: proposals.reduce((sum: number, p: any) => sum + parseFloat(p.total_ttc || '0'), 0),
          items: proposals.slice(0, 3).map((p: any) => ({ ref: p.ref, client: p.socname, amount: p.total_ttc }))
        },
        unpaid_invoices: {
          count: invoices.length,
          total_amount: invoices.reduce((sum: number, i: any) => sum + parseFloat(i.total_ttc || '0'), 0),
          items: invoices.slice(0, 3).map((i: any) => ({ ref: i.ref, client: i.socname, amount: i.total_ttc }))
        }
      };
      return JSON.stringify(summary, null, 2);
    }

    case uri === 'dolibarr://agenda/today': {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
      
      try {
        const events = await dolibarrClient.listAgendaEvents({ limit: 50 });
        // Filtrer côté client les événements d'aujourd'hui
        const todayEvents = events.filter((e: any) => {
          if (!e.datep) return false;
          const eventDate = new Date(e.datep * 1000).toISOString().split('T')[0];
          return eventDate === startOfDay;
        });
        return JSON.stringify(todayEvents, null, 2);
      } catch {
        return JSON.stringify({ message: 'Agenda events not available', date: startOfDay }, null, 2);
      }
    }

    case uri === 'dolibarr://invoices/overdue': {
      const invoices = await dolibarrClient.listInvoices({ status: 'unpaid', limit: 50 });
      
      // Filtre les factures dont la date d'échéance est dépassée
      const overdue = invoices.filter((inv: any) => {
        if (!inv.date_lim_reglement) return false;
        const dueDate = new Date(inv.date_lim_reglement * 1000);
        return dueDate < new Date();
      }).map((inv: any) => ({
        ...inv,
        days_overdue: Math.floor((Date.now() - inv.date_lim_reglement * 1000) / (1000 * 60 * 60 * 24))
      }));
      
      return JSON.stringify(overdue, null, 2);
    }

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}
