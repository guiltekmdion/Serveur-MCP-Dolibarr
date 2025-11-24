import { dolibarrClient } from '../services/dolibarr.js';
import {
  GetOrderArgsSchema,
  CreateOrderArgsSchema,
  ChangeOrderStatusArgsSchema,
  GetInvoiceArgsSchema,
  ListInvoicesArgsSchema,
  CreateInvoiceArgsSchema,
  CreateInvoiceFromProposalArgsSchema,
  RecordInvoicePaymentArgsSchema,
  GetProductArgsSchema,
  SearchProductsArgsSchema
} from '../types/index.js';

// === COMMANDES ===
export const getOrderTool = {
  name: 'dolibarr_get_order',
  description: 'Récupérer les détails d\'une commande',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleGetOrder(args: unknown) {
  const validated = GetOrderArgsSchema.parse(args);
  const order = await dolibarrClient.getOrder(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(order, null, 2) }] };
}

export const createOrderTool = {
  name: 'dolibarr_create_order',
  description: 'Créer une nouvelle commande client',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: { type: 'string', description: 'ID du tiers' },
      date: { type: 'number', description: 'Date (timestamp Unix)' },
    },
    required: ['socid'],
  },
};

export async function handleCreateOrder(args: unknown) {
  const validated = CreateOrderArgsSchema.parse(args);
  const id = await dolibarrClient.createOrder(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Commande créée' }, null, 2) }] };
}

export const changeOrderStatusTool = {
  name: 'dolibarr_change_order_status',
  description: 'Changer le statut d\'une commande (valider, approuver, expédier, facturer)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la commande' },
      status: { type: 'string', description: 'Nouveau statut', enum: ['validate', 'approve', 'ship', 'bill'] },
    },
    required: ['id', 'status'],
  },
};

export async function handleChangeOrderStatus(args: unknown) {
  const validated = ChangeOrderStatusArgsSchema.parse(args);
  await dolibarrClient.changeOrderStatus(validated.id, validated.status);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ message: `Statut changé en ${validated.status}` }, null, 2) }] };
}

// === FACTURES ===
export const getInvoiceTool = {
  name: 'dolibarr_get_invoice',
  description: 'Récupérer les détails d\'une facture',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleGetInvoice(args: unknown) {
  const validated = GetInvoiceArgsSchema.parse(args);
  const invoice = await dolibarrClient.getInvoice(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(invoice, null, 2) }] };
}

export const listInvoicesTool = {
  name: 'dolibarr_list_invoices',
  description: 'Lister et filtrer les factures',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'Filtrer par ID tiers' },
      status: { type: 'string', description: 'Filtrer par statut' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListInvoices(args: unknown) {
  const validated = ListInvoicesArgsSchema.parse(args);
  const invoices = await dolibarrClient.listInvoices(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify(invoices, null, 2) }] };
}

export const createInvoiceTool = {
  name: 'dolibarr_create_invoice',
  description: 'Créer une nouvelle facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      socid: { type: 'string', description: 'ID du tiers' },
      date: { type: 'number', description: 'Date (timestamp Unix)' },
      type: { type: 'string', description: 'Type de facture' },
    },
    required: ['socid'],
  },
};

export async function handleCreateInvoice(args: unknown) {
  const validated = CreateInvoiceArgsSchema.parse(args);
  const id = await dolibarrClient.createInvoice(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Facture créée' }, null, 2) }] };
}

export const createInvoiceFromProposalTool = {
  name: 'dolibarr_create_invoice_from_proposal',
  description: 'Créer une facture à partir d\'un devis existant',
  inputSchema: {
    type: 'object' as const,
    properties: { proposal_id: { type: 'string', description: 'ID du devis' } },
    required: ['proposal_id'],
  },
};

export async function handleCreateInvoiceFromProposal(args: unknown) {
  const validated = CreateInvoiceFromProposalArgsSchema.parse(args);
  const id = await dolibarrClient.createInvoiceFromProposal(validated.proposal_id);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Facture créée depuis devis' }, null, 2) }] };
}

export const recordInvoicePaymentTool = {
  name: 'dolibarr_record_invoice_payment',
  description: 'Enregistrer un paiement sur une facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      amount: { type: 'number', description: 'Montant du paiement' },
      date: { type: 'number', description: 'Date du paiement (timestamp Unix)' },
      payment_mode_id: { type: 'string', description: 'ID du mode de paiement' },
    },
    required: ['invoice_id', 'amount'],
  },
};

export async function handleRecordInvoicePayment(args: unknown) {
  const validated = RecordInvoicePaymentArgsSchema.parse(args);
  const id = await dolibarrClient.recordInvoicePayment(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Paiement enregistré' }, null, 2) }] };
}

// === PRODUITS ===
export const getProductTool = {
  name: 'dolibarr_get_product',
  description: 'Récupérer les détails d\'un produit ou service',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du produit' } },
    required: ['id'],
  },
};

export async function handleGetProduct(args: unknown) {
  const validated = GetProductArgsSchema.parse(args);
  const product = await dolibarrClient.getProduct(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify(product, null, 2) }] };
}

export const searchProductsTool = {
  name: 'dolibarr_search_products',
  description: 'Rechercher des produits/services par référence ou libellé',
  inputSchema: {
    type: 'object' as const,
    properties: { query: { type: 'string', description: 'Terme de recherche' } },
    required: ['query'],
  },
};

export async function handleSearchProducts(args: unknown) {
  const validated = SearchProductsArgsSchema.parse(args);
  const products = await dolibarrClient.searchProducts(validated.query);
  return { content: [{ type: 'text' as const, text: JSON.stringify(products, null, 2) }] };
}
