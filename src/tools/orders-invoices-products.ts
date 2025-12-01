import { z } from 'zod';
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
  SearchProductsArgsSchema,
  CreateProductArgsSchema,
  UpdateProductArgsSchema,
  DeleteProductArgsSchema
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

export const createProductTool = {
  name: 'dolibarr_create_product',
  description: 'Créer un nouveau produit ou service',
  inputSchema: {
    type: 'object' as const,
    properties: {
      ref: { type: 'string', description: 'Référence du produit' },
      label: { type: 'string', description: 'Libellé du produit' },
      type: { type: 'string', description: '0=Produit, 1=Service', enum: ['0', '1'] },
      price: { type: 'number', description: 'Prix de vente HT' },
      tva_tx: { type: 'number', description: 'Taux de TVA' },
      description: { type: 'string', description: 'Description' },
      status: { type: 'string', description: '0=Hors vente, 1=En vente', enum: ['0', '1'] },
      status_buy: { type: 'string', description: '0=Hors achat, 1=En achat', enum: ['0', '1'] },
    },
    required: ['ref', 'label'],
  },
};

export async function handleCreateProduct(args: unknown) {
  const validated = CreateProductArgsSchema.parse(args);
  const id = await dolibarrClient.createProduct(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Produit créé avec succès' }, null, 2) }] };
}

export const updateProductTool = {
  name: 'dolibarr_update_product',
  description: 'Mettre à jour un produit ou service existant',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du produit à modifier' },
      ref: { type: 'string', description: 'Nouvelle référence' },
      label: { type: 'string', description: 'Nouveau libellé' },
      price: { type: 'number', description: 'Nouveau prix de vente HT' },
      tva_tx: { type: 'number', description: 'Nouveau taux de TVA' },
      description: { type: 'string', description: 'Nouvelle description' },
      status: { type: 'string', description: '0=Hors vente, 1=En vente', enum: ['0', '1'] },
      status_buy: { type: 'string', description: '0=Hors achat, 1=En achat', enum: ['0', '1'] },
    },
    required: ['id'],
  },
};

export async function handleUpdateProduct(args: unknown) {
  const validated = UpdateProductArgsSchema.parse(args);
  const id = await dolibarrClient.updateProduct(validated);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ id, message: 'Produit mis à jour avec succès' }, null, 2) }] };
}

export const deleteProductTool = {
  name: 'dolibarr_delete_product',
  description: 'Supprimer un produit ou service',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du produit à supprimer' },
    },
    required: ['id'],
  },
};

export async function handleDeleteProduct(args: unknown) {
  const validated = DeleteProductArgsSchema.parse(args);
  await dolibarrClient.deleteProduct(validated.id);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ message: 'Produit supprimé avec succès' }, null, 2) }] };
}

// === COMMANDES (SUITE) ===
export const listOrdersTool = {
  name: 'dolibarr_list_orders',
  description: 'Lister les commandes clients',
  inputSchema: {
    type: 'object' as const,
    properties: {
      thirdparty_id: { type: 'string', description: 'ID du tiers' },
      status: { type: 'string', description: 'Statut' },
      limit: { type: 'number', description: 'Limite' },
    },
  },
};

export async function handleListOrders(args: unknown) {
  const schema = z.object({ thirdparty_id: z.string().optional(), status: z.string().optional(), limit: z.number().optional() });
  const params = schema.parse(args);
  const orders = await dolibarrClient.listOrders(params);
  return { content: [{ type: 'text', text: JSON.stringify(orders, null, 2) }] };
}

export const updateOrderTool = {
  name: 'dolibarr_update_order',
  description: 'Mettre à jour une commande',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la commande' },
      date: { type: 'number', description: 'Date' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['id'],
  },
};

export async function handleUpdateOrder(args: unknown) {
  const schema = z.object({ id: z.string(), date: z.number().optional(), note_public: z.string().optional() });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/orders/${id}`, data);
  return { content: [{ type: 'text', text: `Commande ${id} mise à jour` }] };
}

export const deleteOrderTool = {
  name: 'dolibarr_delete_order',
  description: 'Supprimer une commande',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleDeleteOrder(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/orders/${id}`);
  return { content: [{ type: 'text', text: `Commande ${id} supprimée` }] };
}

export const addOrderLineTool = {
  name: 'dolibarr_add_order_line',
  description: 'Ajouter une ligne à une commande',
  inputSchema: {
    type: 'object' as const,
    properties: {
      order_id: { type: 'string', description: 'ID de la commande' },
      product_id: { type: 'string', description: 'ID du produit' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire HT' },
      tva_tx: { type: 'number', description: 'Taux TVA' },
    },
    required: ['order_id', 'qty', 'price'],
  },
};

export async function handleAddOrderLine(args: unknown) {
  const schema = z.object({ order_id: z.string(), product_id: z.string().optional(), qty: z.number(), price: z.number(), tva_tx: z.number().optional() });
  const { order_id, product_id, qty, price, tva_tx } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/orders/${order_id}/lines`, { fk_product: product_id, qty, subprice: price, tva_tx });
  return { content: [{ type: 'text', text: `Ligne ajoutée à la commande ${order_id}` }] };
}

export const updateOrderLineTool = {
  name: 'dolibarr_update_order_line',
  description: 'Mettre à jour une ligne de commande',
  inputSchema: {
    type: 'object' as const,
    properties: {
      order_id: { type: 'string', description: 'ID de la commande' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire HT' },
    },
    required: ['order_id', 'line_id'],
  },
};

export async function handleUpdateOrderLine(args: unknown) {
  const schema = z.object({ order_id: z.string(), line_id: z.string(), qty: z.number().optional(), price: z.number().optional() });
  const { order_id, line_id, qty, price } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/orders/${order_id}/lines/${line_id}`, { qty, subprice: price });
  return { content: [{ type: 'text', text: `Ligne ${line_id} mise à jour` }] };
}

export const deleteOrderLineTool = {
  name: 'dolibarr_delete_order_line',
  description: 'Supprimer une ligne de commande',
  inputSchema: {
    type: 'object' as const,
    properties: {
      order_id: { type: 'string', description: 'ID de la commande' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['order_id', 'line_id'],
  },
};

export async function handleDeleteOrderLine(args: unknown) {
  const schema = z.object({ order_id: z.string(), line_id: z.string() });
  const { order_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/orders/${order_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée` }] };
}

export const validateOrderTool = {
  name: 'dolibarr_validate_order',
  description: 'Valider une commande (Brouillon -> Validée)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleValidateOrder(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  await dolibarrClient.validateOrder(id);
  return { content: [{ type: 'text', text: `Commande ${id} validée` }] };
}

export const cancelOrderTool = {
  name: 'dolibarr_cancel_order',
  description: 'Annuler une commande',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleCancelOrder(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/orders/${id}/close`, { status: 'cancelled' }); // Ou endpoint spécifique selon version
  return { content: [{ type: 'text', text: `Commande ${id} annulée` }] };
}

export const shipOrderTool = {
  name: 'dolibarr_ship_order',
  description: 'Expédier une commande (Créer une expédition)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleShipOrder(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const shipmentId = await dolibarrClient.shipOrder(id);
  return { content: [{ type: 'text', text: `Expédition créée ID: ${shipmentId}` }] };
}

export const createInvoiceFromOrderTool = {
  name: 'dolibarr_create_invoice_from_order',
  description: 'Créer une facture depuis une commande',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la commande' } },
    required: ['id'],
  },
};

export async function handleCreateInvoiceFromOrder(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].post(`/invoices/createfromorder/${id}`);
  return { content: [{ type: 'text', text: `Facture créée ID: ${response.data}` }] };
}

// === FACTURES (SUITE) ===
export const updateInvoiceTool = {
  name: 'dolibarr_update_invoice',
  description: 'Mettre à jour une facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la facture' },
      note_public: { type: 'string', description: 'Note publique' },
    },
    required: ['id'],
  },
};

export async function handleUpdateInvoice(args: unknown) {
  const schema = z.object({ id: z.string(), note_public: z.string().optional() });
  const { id, ...data } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/invoices/${id}`, data);
  return { content: [{ type: 'text', text: `Facture ${id} mise à jour` }] };
}

export const deleteInvoiceTool = {
  name: 'dolibarr_delete_invoice',
  description: 'Supprimer une facture (si brouillon)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleDeleteInvoice(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/invoices/${id}`);
  return { content: [{ type: 'text', text: `Facture ${id} supprimée` }] };
}

export const addInvoiceLineTool = {
  name: 'dolibarr_add_invoice_line',
  description: 'Ajouter une ligne à une facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      product_id: { type: 'string', description: 'ID du produit' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire HT' },
      tva_tx: { type: 'number', description: 'Taux TVA' },
    },
    required: ['invoice_id', 'qty', 'price'],
  },
};

export async function handleAddInvoiceLine(args: unknown) {
  const schema = z.object({ invoice_id: z.string(), product_id: z.string().optional(), qty: z.number(), price: z.number(), tva_tx: z.number().optional() });
  const { invoice_id, product_id, qty, price, tva_tx } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/invoices/${invoice_id}/lines`, { fk_product: product_id, qty, subprice: price, tva_tx });
  return { content: [{ type: 'text', text: `Ligne ajoutée à la facture ${invoice_id}` }] };
}

export const updateInvoiceLineTool = {
  name: 'dolibarr_update_invoice_line',
  description: 'Mettre à jour une ligne de facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      line_id: { type: 'string', description: 'ID de la ligne' },
      qty: { type: 'number', description: 'Quantité' },
      price: { type: 'number', description: 'Prix unitaire HT' },
    },
    required: ['invoice_id', 'line_id'],
  },
};

export async function handleUpdateInvoiceLine(args: unknown) {
  const schema = z.object({ invoice_id: z.string(), line_id: z.string(), qty: z.number().optional(), price: z.number().optional() });
  const { invoice_id, line_id, qty, price } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].put(`/invoices/${invoice_id}/lines/${line_id}`, { qty, subprice: price });
  return { content: [{ type: 'text', text: `Ligne ${line_id} mise à jour` }] };
}

export const deleteInvoiceLineTool = {
  name: 'dolibarr_delete_invoice_line',
  description: 'Supprimer une ligne de facture',
  inputSchema: {
    type: 'object' as const,
    properties: {
      invoice_id: { type: 'string', description: 'ID de la facture' },
      line_id: { type: 'string', description: 'ID de la ligne' },
    },
    required: ['invoice_id', 'line_id'],
  },
};

export async function handleDeleteInvoiceLine(args: unknown) {
  const schema = z.object({ invoice_id: z.string(), line_id: z.string() });
  const { invoice_id, line_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/invoices/${invoice_id}/lines/${line_id}`);
  return { content: [{ type: 'text', text: `Ligne ${line_id} supprimée` }] };
}

export const validateInvoiceTool = {
  name: 'dolibarr_validate_invoice',
  description: 'Valider une facture',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleValidateInvoice(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/invoices/${id}/validate`);
  return { content: [{ type: 'text', text: `Facture ${id} validée` }] };
}

export const cancelInvoiceTool = {
  name: 'dolibarr_cancel_invoice',
  description: 'Annuler une facture (Abandon)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleCancelInvoice(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/invoices/${id}/mark_as_abandoned`);
  return { content: [{ type: 'text', text: `Facture ${id} abandonnée` }] };
}

export const setInvoicePaidTool = {
  name: 'dolibarr_set_invoice_paid',
  description: 'Marquer une facture comme payée (Classer payée)',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleSetInvoicePaid(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/invoices/${id}/set_paid`);
  return { content: [{ type: 'text', text: `Facture ${id} classée payée` }] };
}

export const getInvoicePaymentsTool = {
  name: 'dolibarr_get_invoice_payments',
  description: 'Lister les paiements d\'une facture',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID de la facture' } },
    required: ['id'],
  },
};

export async function handleGetInvoicePayments(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const payments = await dolibarrClient.listPayments({ invoice_id: id });
  return { content: [{ type: 'text', text: JSON.stringify(payments, null, 2) }] };
}

export const sendInvoiceEmailTool = {
  name: 'dolibarr_send_invoice_email',
  description: 'Envoyer une facture par email',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID de la facture' },
      email: { type: 'string', description: 'Email destinataire' },
    },
    required: ['id', 'email'],
  },
};

export async function handleSendInvoiceEmail(args: unknown) {
  const schema = z.object({ id: z.string(), email: z.string() });
  const { id, email } = schema.parse(args);
  await dolibarrClient.sendDocumentByEmail('invoice', id, email);
  return { content: [{ type: 'text', text: `Facture ${id} envoyée à ${email}` }] };
}

// === PRODUITS (SUITE) ===
export const getProductCategoriesTool = {
  name: 'dolibarr_get_product_categories',
  description: 'Lister les catégories d\'un produit',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du produit' } },
    required: ['id'],
  },
};

export async function handleGetProductCategories(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/products/${id}/categories`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const addProductCategoryTool = {
  name: 'dolibarr_add_product_category',
  description: 'Ajouter une catégorie à un produit',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: { type: 'string', description: 'ID du produit' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['product_id', 'category_id'],
  },
};

export async function handleAddProductCategory(args: unknown) {
  const schema = z.object({ product_id: z.string(), category_id: z.string() });
  const { product_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/categories/${category_id}/objects/product/${product_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} ajoutée au produit ${product_id}` }] };
}

export const removeProductCategoryTool = {
  name: 'dolibarr_remove_product_category',
  description: 'Retirer une catégorie d\'un produit',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: { type: 'string', description: 'ID du produit' },
      category_id: { type: 'string', description: 'ID de la catégorie' },
    },
    required: ['product_id', 'category_id'],
  },
};

export async function handleRemoveProductCategory(args: unknown) {
  const schema = z.object({ product_id: z.string(), category_id: z.string() });
  const { product_id, category_id } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].delete(`/categories/${category_id}/objects/product/${product_id}`);
  return { content: [{ type: 'text', text: `Catégorie ${category_id} retirée du produit ${product_id}` }] };
}

export const getProductStockByWarehouseTool = {
  name: 'dolibarr_get_product_stock_by_warehouse',
  description: 'Obtenir le stock d\'un produit par entrepôt',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du produit' } },
    required: ['id'],
  },
};

export async function handleGetProductStockByWarehouse(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/products/${id}/stock`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const getProductSuppliersTool = {
  name: 'dolibarr_get_product_suppliers',
  description: 'Lister les prix fournisseurs d\'un produit',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du produit' } },
    required: ['id'],
  },
};

export async function handleGetProductSuppliers(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  // @ts-ignore
  const response = await dolibarrClient['client'].get(`/products/${id}/purchase_prices`);
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

export const addProductSupplierPriceTool = {
  name: 'dolibarr_add_product_supplier_price',
  description: 'Ajouter un prix fournisseur à un produit',
  inputSchema: {
    type: 'object' as const,
    properties: {
      product_id: { type: 'string', description: 'ID du produit' },
      supplier_id: { type: 'string', description: 'ID du fournisseur' },
      price: { type: 'number', description: 'Prix d\'achat HT' },
      qty: { type: 'number', description: 'Quantité min' },
    },
    required: ['product_id', 'supplier_id', 'price'],
  },
};

export async function handleAddProductSupplierPrice(args: unknown) {
  const schema = z.object({ product_id: z.string(), supplier_id: z.string(), price: z.number(), qty: z.number().optional() });
  const { product_id, supplier_id, price, qty } = schema.parse(args);
  // @ts-ignore
  await dolibarrClient['client'].post(`/products/${product_id}/purchase_prices`, { fk_soc: supplier_id, price, qty_min: qty || 1 });
  return { content: [{ type: 'text', text: `Prix fournisseur ajouté au produit ${product_id}` }] };
}

export const getProductDocumentsTool = {
  name: 'dolibarr_get_product_documents',
  description: 'Lister les documents d\'un produit',
  inputSchema: {
    type: 'object' as const,
    properties: { id: { type: 'string', description: 'ID du produit' } },
    required: ['id'],
  },
};

export async function handleGetProductDocuments(args: unknown) {
  const schema = z.object({ id: z.string() });
  const { id } = schema.parse(args);
  const docs = await dolibarrClient.listDocumentsForObject('product', id);
  return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
}

export const addProductImageTool = {
  name: 'dolibarr_add_product_image',
  description: 'Ajouter une image à un produit (via URL ou Base64)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', description: 'ID du produit' },
      filename: { type: 'string', description: 'Nom du fichier' },
      content: { type: 'string', description: 'Contenu Base64' },
    },
    required: ['id', 'filename', 'content'],
  },
};

export async function handleAddProductImage(args: unknown) {
  const schema = z.object({ id: z.string(), filename: z.string(), content: z.string() });
  const { id, filename, content } = schema.parse(args);
  // Note: Upload document générique, mais pour produit c'est spécifique parfois
  // On utilise l'upload document standard
  const product = await dolibarrClient.getProduct(id);
  await dolibarrClient.uploadDocument({
    filename,
    modulepart: 'product',
    ref: product.ref || '',
    filecontent: content
  });
  return { content: [{ type: 'text', text: `Image ajoutée au produit ${id}` }] };
}
