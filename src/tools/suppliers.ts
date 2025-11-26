import { dolibarrClient } from '../services/dolibarr.js';
import { 
  ListSupplierOrdersArgsSchema, 
  CreateSupplierOrderArgsSchema,
  ListSupplierInvoicesArgsSchema,
  CreateSupplierInvoiceArgsSchema
} from '../types/index.js';

// === COMMANDES FOURNISSEURS ===
export const listSupplierOrdersTool = {
  name: 'dolibarr_list_supplier_orders',
  description: 'Lister les commandes fournisseurs',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'Filtrer par ID fournisseur' },
      status: { type: 'string', description: 'Filtrer par statut' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListSupplierOrders(args: unknown) {
  const validated = ListSupplierOrdersArgsSchema.parse(args);
  const orders = await dolibarrClient.listSupplierOrders(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(orders, null, 2),
      },
    ],
  };
}

export const createSupplierOrderTool = {
  name: 'dolibarr_create_supplier_order',
  description: 'Créer une commande fournisseur',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: { type: 'string', description: 'ID du fournisseur' },
      date_commande: { type: 'number', description: 'Date de commande (timestamp)' },
      note_private: { type: 'string', description: 'Note privée' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['socid'],
  },
};

export async function handleCreateSupplierOrder(args: unknown) {
  const validated = CreateSupplierOrderArgsSchema.parse(args);
  const id = await dolibarrClient.createSupplierOrder(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Commande fournisseur créée avec succès. ID: ${id}`,
      },
    ],
  };
}

// === FACTURES FOURNISSEURS ===
export const listSupplierInvoicesTool = {
  name: 'dolibarr_list_supplier_invoices',
  description: 'Lister les factures fournisseurs',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'Filtrer par ID fournisseur' },
      status: { type: 'string', description: 'Filtrer par statut' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListSupplierInvoices(args: unknown) {
  const validated = ListSupplierInvoicesArgsSchema.parse(args);
  const invoices = await dolibarrClient.listSupplierInvoices(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(invoices, null, 2),
      },
    ],
  };
}

export const createSupplierInvoiceTool = {
  name: 'dolibarr_create_supplier_invoice',
  description: 'Créer une facture fournisseur',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: { type: 'string', description: 'ID du fournisseur' },
      date: { type: 'number', description: 'Date de facturation (timestamp)' },
      label: { type: 'string', description: 'Libellé' },
      amount: { type: 'number', description: 'Montant HT' },
    },
    required: ['socid'],
  },
};

export async function handleCreateSupplierInvoice(args: unknown) {
  const validated = CreateSupplierInvoiceArgsSchema.parse(args);
  const id = await dolibarrClient.createSupplierInvoice(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Facture fournisseur créée avec succès. ID: ${id}`,
      },
    ],
  };
}

export const supplierTools = [
  listSupplierOrdersTool,
  createSupplierOrderTool,
  listSupplierInvoicesTool,
  createSupplierInvoiceTool,
];
