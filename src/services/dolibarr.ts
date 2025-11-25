/**
 * Service Client API Dolibarr
 * Auteur: Maxime DION (Guiltek)
 */
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import https from 'https';
// @ts-ignore
import axiosRetry from 'axios-retry';
import { z } from 'zod';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { 
  ThirdParty, 
  Proposal,
  Contact,
  Order,
  Invoice,
  Product,
  Project,
  Task,
  User,
  BankAccount,
  Warehouse,
  StockMovement,
  Shipment,
  Contract,
  Ticket,
  AgendaEvent,
  ExpenseReport,
  Intervention,
  ThirdPartySchema,
  ProposalSchema,
  ContactSchema,
  OrderSchema,
  InvoiceSchema,
  ProductSchema,
  ProjectSchema,
  TaskSchema,
  UserSchema,
  BankAccountSchema,
  WarehouseSchema,
  StockMovementSchema,
  ShipmentSchema,
  ContractSchema,
  TicketSchema,
  AgendaEventSchema,
  ExpenseReportSchema,
  InterventionSchema,
  CreateProposalArgs,
  CreateProposalArgsSchema,
  CreateThirdPartyArgsSchema,
  UpdateThirdPartyArgsSchema,
  CreateContactArgsSchema,
  AddProposalLineArgsSchema,
  UpdateProposalLineArgsSchema,
  CreateOrderArgsSchema,
  CreateInvoiceArgsSchema,
  RecordInvoicePaymentArgsSchema,
  CreateProjectArgsSchema,
  CreateTaskArgsSchema,
  UploadDocumentArgsSchema
} from '../types/index.js';

export class DolibarrClient {
  private client: AxiosInstance;

  constructor() {
    // Agent HTTPS pour accepter les certificats auto-signés
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    this.client = axios.create({
      baseURL: config.DOLIBARR_BASE_URL,
      headers: {
        'DOLAPIKEY': config.DOLIBARR_API_KEY,
        'Accept': 'application/json',
      },
      timeout: config.AXIOS_TIMEOUT,
      httpsAgent: httpsAgent,
    });

    // Configuration du retry automatique
    (axiosRetry as any)(this.client, { 
      retries: config.MAX_RETRIES,
      retryDelay: (axiosRetry as any).exponentialDelay,
      retryCondition: (error: AxiosError) => {
        return (axiosRetry as any).isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
      onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
        logger.warn(`Tentative de reconnexion #${retryCount} pour ${requestConfig.url}: ${error.message}`);
      }
    });

    // Intercepteurs pour le logging
    this.client.interceptors.request.use(request => {
      logger.debug(`API Request: ${request.method?.toUpperCase()} ${request.url}`);
      return request;
    });

    this.client.interceptors.response.use(
      response => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        logger.error(`API Error: ${error.message}`, { 
          url: error.config?.url,
          status: error.response?.status 
        });
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.error?.message || error.message;
      
      // Log full error details for debugging
      console.error(`[Dolibarr API] Full Error Data in ${context}:`, JSON.stringify(data, null, 2));
      
      logger.error(`[Dolibarr API] Error in ${context}: ${status} - ${message}`);
      
      // Messages d'erreur explicites selon le code HTTP
      if (status === 401) {
        throw new Error(`Dolibarr API Error (401): Clé API invalide ou expirée. Vérifiez DOLIBARR_API_KEY dans votre configuration.`);
      }
      if (status === 403) {
        // Extraire le module depuis le contexte pour un message plus clair
        const moduleHint = this.getModuleFromContext(context);
        throw new Error(`Dolibarr API Error (403): Droits insuffisants pour "${context}". L'utilisateur API n'a pas les permissions sur le module ${moduleHint}. Configurez les droits dans Dolibarr: Configuration → Utilisateurs → [votre utilisateur API] → Permissions.`);
      }
      if (status === 404) {
        throw new Error(`Dolibarr API Error (404): Ressource non trouvée pour "${context}". Vérifiez que l'ID existe.`);
      }
      if (status === 500) {
        throw new Error(`Dolibarr API Error (500): Erreur interne du serveur Dolibarr. ${message}`);
      }
      if (status === 501) {
        const moduleHint = this.getModuleFromContext(context);
        throw new Error(`Dolibarr API Error (501): Module "${moduleHint}" non activé dans Dolibarr. Activez-le dans Configuration → Modules/Applications.`);
      }
      
      throw new Error(`Dolibarr API Error (${status}): ${message}`);
    }
    logger.error(`[Dolibarr API] Unexpected error in ${context}:`, error);
    throw error;
  }

  // Helper pour extraire le nom du module depuis le contexte
  private getModuleFromContext(context: string): string {
    const moduleMap: Record<string, string> = {
      'warehouse': 'Entrepôts (Stock)',
      'stock': 'Stock',
      'shipment': 'Expéditions',
      'contract': 'Contrats',
      'ticket': 'Tickets (Support)',
      'agenda': 'Agenda',
      'expense': 'Notes de frais',
      'intervention': 'Interventions (Fichinter)',
      'thirdpart': 'Tiers',
      'contact': 'Contacts',
      'proposal': 'Propositions commerciales',
      'order': 'Commandes',
      'invoice': 'Factures',
      'product': 'Produits/Services',
      'project': 'Projets',
      'task': 'Tâches',
      'user': 'Utilisateurs',
      'bank': 'Banques',
      'document': 'Documents'
    };
    
    const contextLower = context.toLowerCase();
    for (const [key, value] of Object.entries(moduleMap)) {
      if (contextLower.includes(key)) {
        return value;
      }
    }
    return context;
  }

  async getThirdParty(id: string): Promise<ThirdParty> {
    try {
      const response = await this.client.get(`/thirdparties/${id}`);
      // Validation Zod de la réponse
      const validated = ThirdPartySchema.parse(response.data);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('[Dolibarr API] Validation error:', error.format());
        throw new Error(`Données invalides reçues de l'API Dolibarr: ${error.message}`);
      }
      this.handleError(error, `getThirdParty(${id})`);
    }
  }

  async searchThirdParties(query: string): Promise<ThirdParty[]> {
    try {
      const response = await this.client.get('/thirdparties', {
        params: {
          sqlfilters: `(t.nom:like:'%${query}%')`,
          limit: 10
        }
      });
      // Validation Zod du tableau de résultats
      const validated = z.array(ThirdPartySchema).parse(response.data);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('[Dolibarr API] Validation error:', error.format());
        throw new Error(`Données invalides reçues de l'API Dolibarr: ${error.message}`);
      }
      this.handleError(error, `searchThirdParties(${query})`);
    }
  }

  async createProposal(proposal: CreateProposalArgs): Promise<string> {
    try {
      const validated = CreateProposalArgsSchema.parse(proposal);
      const response = await this.client.post('/proposals', validated);
      const id = z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
      return id;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('[Dolibarr API] Validation error:', error.format());
        throw new Error(`Données invalides pour créer la proposition: ${error.message}`);
      }
      this.handleError(error, 'createProposal');
    }
  }

  // === TIERS (THIRDPARTIES) ===
  async createThirdParty(data: z.infer<typeof CreateThirdPartyArgsSchema>): Promise<string> {
    try {
      const validated = CreateThirdPartyArgsSchema.parse(data);
      const response = await this.client.post('/thirdparties', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createThirdParty');
    }
  }

  async updateThirdParty(data: z.infer<typeof UpdateThirdPartyArgsSchema>): Promise<void> {
    try {
      const { id, ...updateData } = UpdateThirdPartyArgsSchema.parse(data);
      await this.client.put(`/thirdparties/${id}`, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateThirdParty');
    }
  }

  // === CONTACTS ===
  async getContact(id: string): Promise<Contact> {
    try {
      const response = await this.client.get(`/contacts/${id}`);
      return ContactSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getContact(${id})`);
    }
  }

  async listContactsForThirdParty(thirdpartyId: string): Promise<Contact[]> {
    try {
      const response = await this.client.get('/contacts', {
        params: { thirdparty_ids: thirdpartyId }
      });
      return z.array(ContactSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `listContactsForThirdParty(${thirdpartyId})`);
    }
  }

  async createContact(data: z.infer<typeof CreateContactArgsSchema>): Promise<string> {
    try {
      const validated = CreateContactArgsSchema.parse(data);
      const response = await this.client.post('/contacts', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createContact');
    }
  }

  // === PROPOSITIONS COMMERCIALES ===
  async getProposal(id: string): Promise<Proposal> {
    try {
      const response = await this.client.get(`/proposals/${id}`);
      return ProposalSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getProposal(${id})`);
    }
  }

  async listProposals(params?: { thirdparty_id?: string; status?: string; limit?: number }): Promise<Proposal[]> {
    try {
      const response = await this.client.get('/proposals', { params });
      return z.array(ProposalSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listProposals');
    }
  }

  async addProposalLine(data: z.infer<typeof AddProposalLineArgsSchema>): Promise<string> {
    try {
      const { proposal_id, ...lineData } = AddProposalLineArgsSchema.parse(data);
      const response = await this.client.post(`/proposals/${proposal_id}/lines`, lineData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'addProposalLine');
    }
  }

  async updateProposalLine(data: z.infer<typeof UpdateProposalLineArgsSchema>): Promise<void> {
    try {
      const { line_id, ...updateData } = UpdateProposalLineArgsSchema.parse(data);
      await this.client.put(`/proposals/lines/${line_id}`, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateProposalLine');
    }
  }

  async deleteProposalLine(lineId: string): Promise<void> {
    try {
      await this.client.delete(`/proposals/lines/${lineId}`);
    } catch (error) {
      this.handleError(error, `deleteProposalLine(${lineId})`);
    }
  }

  async changeProposalStatus(id: string, status: 'validate' | 'close' | 'refuse' | 'sign'): Promise<void> {
    try {
      await this.client.post(`/proposals/${id}/${status}`);
    } catch (error) {
      this.handleError(error, `changeProposalStatus(${id}, ${status})`);
    }
  }

  // === COMMANDES ===
  async getOrder(id: string): Promise<Order> {
    try {
      const response = await this.client.get(`/orders/${id}`);
      return OrderSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getOrder(${id})`);
    }
  }

  async createOrder(data: z.infer<typeof CreateOrderArgsSchema>): Promise<string> {
    try {
      const validated = CreateOrderArgsSchema.parse(data);
      const response = await this.client.post('/orders', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createOrder');
    }
  }

  async changeOrderStatus(id: string, status: 'validate' | 'approve' | 'ship' | 'bill'): Promise<void> {
    try {
      await this.client.post(`/orders/${id}/${status}`);
    } catch (error) {
      this.handleError(error, `changeOrderStatus(${id}, ${status})`);
    }
  }

  // === FACTURES ===
  async getInvoice(id: string): Promise<Invoice> {
    try {
      const response = await this.client.get(`/invoices/${id}`);
      return InvoiceSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getInvoice(${id})`);
    }
  }

  async listInvoices(params?: { thirdparty_id?: string; status?: string; limit?: number }): Promise<Invoice[]> {
    try {
      const response = await this.client.get('/invoices', { params });
      return z.array(InvoiceSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listInvoices');
    }
  }

  async createInvoice(data: z.infer<typeof CreateInvoiceArgsSchema>): Promise<string> {
    try {
      const validated = CreateInvoiceArgsSchema.parse(data);
      const response = await this.client.post('/invoices', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createInvoice');
    }
  }

  async createInvoiceFromProposal(proposalId: string): Promise<string> {
    try {
      const proposal = await this.getProposal(proposalId);
      const response = await this.client.post('/invoices', {
        socid: proposal.socid,
        date: Date.now() / 1000,
        fk_source: proposalId,
        type: 0
      });
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      this.handleError(error, `createInvoiceFromProposal(${proposalId})`);
    }
  }

  async recordInvoicePayment(data: z.infer<typeof RecordInvoicePaymentArgsSchema>): Promise<string> {
    try {
      const { invoice_id, ...paymentData } = RecordInvoicePaymentArgsSchema.parse(data);
      const response = await this.client.post(`/invoices/${invoice_id}/payments`, paymentData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'recordInvoicePayment');
    }
  }

  // === PRODUITS ===
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await this.client.get(`/products/${id}`);
      return ProductSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getProduct(${id})`);
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.client.get('/products', {
        params: {
          sqlfilters: `(t.ref:like:'%${query}%') OR (t.label:like:'%${query}%')`,
          limit: 20
        }
      });
      return z.array(ProductSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `searchProducts(${query})`);
    }
  }

  // === DOCUMENTS ===
  async listDocuments(modulepart: string, ref: string): Promise<any[]> {
    try {
      const response = await this.client.get('/documents', {
        params: { modulepart, ref }
      });
      return z.array(z.any()).parse(response.data);
    } catch (error) {
      this.handleError(error, `listDocuments(${modulepart}, ${ref})`);
    }
  }

  async uploadDocument(data: z.infer<typeof UploadDocumentArgsSchema>): Promise<string> {
    try {
      const validated = UploadDocumentArgsSchema.parse(data);
      const response = await this.client.post('/documents/upload', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'uploadDocument');
    }
  }

  // === PROJETS ===
  async getProject(id: string): Promise<Project> {
    try {
      const response = await this.client.get(`/projects/${id}`);
      return ProjectSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getProject(${id})`);
    }
  }

  async listProjects(params?: { thirdparty_id?: string; limit?: number }): Promise<Project[]> {
    try {
      const response = await this.client.get('/projects', { params });
      return z.array(ProjectSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listProjects');
    }
  }

  async createProject(data: z.infer<typeof CreateProjectArgsSchema>): Promise<string> {
    try {
      const validated = CreateProjectArgsSchema.parse(data);
      const response = await this.client.post('/projects', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createProject');
    }
  }

  // === TÂCHES ===
  async getTask(id: string): Promise<Task> {
    try {
      const response = await this.client.get(`/tasks/${id}`);
      return TaskSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getTask(${id})`);
    }
  }

  async createTask(data: z.infer<typeof CreateTaskArgsSchema>): Promise<string> {
    try {
      const validated = CreateTaskArgsSchema.parse(data);
      const response = await this.client.post('/tasks', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createTask');
    }
  }

  // === UTILISATEURS ===
  async getUser(id: string): Promise<User> {
    try {
      const response = await this.client.get(`/users/${id}`);
      return UserSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getUser(${id})`);
    }
  }

  async listUsers(): Promise<User[]> {
    try {
      const response = await this.client.get('/users');
      return z.array(UserSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listUsers');
    }
  }

  // === BANQUES ===
  async listBankAccounts(): Promise<BankAccount[]> {
    try {
      const response = await this.client.get('/bankaccounts');
      return z.array(BankAccountSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listBankAccounts');
    }
  }

  async getBankAccountLines(id: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/bankaccounts/${id}/lines`);
      return z.array(z.any()).parse(response.data);
    } catch (error) {
      this.handleError(error, `getBankAccountLines(${id})`);
    }
  }

  // ============================================
  // NOUVEAUX MODULES - Novembre 2025
  // ============================================

  // === ENTREPÔTS (Warehouses) ===
  async listWarehouses(limit?: number): Promise<Warehouse[]> {
    try {
      const params: Record<string, any> = {};
      if (limit) params.limit = limit;
      const response = await this.client.get('/warehouses', { params });
      return z.array(WarehouseSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listWarehouses');
    }
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    try {
      const response = await this.client.get(`/warehouses/${id}`);
      return WarehouseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getWarehouse(${id})`);
    }
  }

  // === MOUVEMENTS DE STOCK (Stock Movements) ===
  async listStockMovements(productId?: string, warehouseId?: string, limit?: number): Promise<StockMovement[]> {
    try {
      const params: Record<string, any> = {};
      if (productId) params.product_id = productId;
      if (warehouseId) params.warehouse_id = warehouseId;
      if (limit) params.limit = limit;
      const response = await this.client.get('/stockmovements', { params });
      return z.array(StockMovementSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listStockMovements');
    }
  }

  async createStockMovement(data: { product_id: string; warehouse_id: string; qty: number; type?: string; label?: string }): Promise<StockMovement> {
    try {
      const response = await this.client.post('/stockmovements', data);
      return StockMovementSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createStockMovement');
    }
  }

  // === EXPÉDITIONS (Shipments) ===
  async listShipments(thirdpartyId?: string, status?: string, limit?: number): Promise<Shipment[]> {
    try {
      const params: Record<string, any> = {};
      if (thirdpartyId) params.thirdparty_id = thirdpartyId;
      if (status) params.status = status;
      if (limit) params.limit = limit;
      const response = await this.client.get('/shipments', { params });
      return z.array(ShipmentSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listShipments');
    }
  }

  async getShipment(id: string): Promise<Shipment> {
    try {
      const response = await this.client.get(`/shipments/${id}`);
      return ShipmentSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getShipment(${id})`);
    }
  }

  async createShipment(data: { socid: string; origin_id: string; date_delivery?: number }): Promise<Shipment> {
    try {
      const response = await this.client.post('/shipments', data);
      return ShipmentSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createShipment');
    }
  }

  // === CONTRATS (Contracts) ===
  async listContracts(thirdpartyId?: string, status?: string, limit?: number): Promise<Contract[]> {
    try {
      const params: Record<string, any> = {};
      if (thirdpartyId) params.thirdparty_id = thirdpartyId;
      if (status) params.status = status;
      if (limit) params.limit = limit;
      const response = await this.client.get('/contracts', { params });
      return z.array(ContractSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listContracts');
    }
  }

  async getContract(id: string): Promise<Contract> {
    try {
      const response = await this.client.get(`/contracts/${id}`);
      return ContractSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getContract(${id})`);
    }
  }

  async createContract(data: { socid: string; date_contrat?: number; ref?: string }): Promise<Contract> {
    try {
      const response = await this.client.post('/contracts', data);
      return ContractSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createContract');
    }
  }

  // === TICKETS (Support) ===
  async listTickets(thirdpartyId?: string, status?: string, limit?: number): Promise<Ticket[]> {
    try {
      const params: Record<string, any> = {};
      if (thirdpartyId) params.socid = thirdpartyId;
      if (status) params.status = status;
      if (limit) params.limit = limit;
      const response = await this.client.get('/tickets', { params });
      return z.array(TicketSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listTickets');
    }
  }

  async getTicket(id: string): Promise<Ticket> {
    try {
      const response = await this.client.get(`/tickets/${id}`);
      return TicketSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getTicket(${id})`);
    }
  }

  async createTicket(data: { subject: string; message: string; fk_soc?: string; type_code?: string; severity_code?: string }): Promise<Ticket> {
    try {
      const response = await this.client.post('/tickets', data);
      return TicketSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createTicket');
    }
  }

  // === ÉVÉNEMENTS AGENDA (Agenda Events) ===
  async listAgendaEvents(thirdpartyId?: string, userId?: string, limit?: number): Promise<AgendaEvent[]> {
    try {
      const params: Record<string, any> = {};
      if (thirdpartyId) params.socid = thirdpartyId;
      if (userId) params.userownerid = userId;
      if (limit) params.limit = limit;
      const response = await this.client.get('/agendaevents', { params });
      return z.array(AgendaEventSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listAgendaEvents');
    }
  }

  async getAgendaEvent(id: string): Promise<AgendaEvent> {
    try {
      const response = await this.client.get(`/agendaevents/${id}`);
      return AgendaEventSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getAgendaEvent(${id})`);
    }
  }

  async createAgendaEvent(data: { label: string; type_code: string; datep: number; datef?: number; socid?: string; contactid?: string; userownerid?: string }): Promise<AgendaEvent> {
    try {
      const response = await this.client.post('/agendaevents', data);
      return AgendaEventSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createAgendaEvent');
    }
  }

  // === NOTES DE FRAIS (Expense Reports) ===
  async listExpenseReports(userId?: string, status?: string, limit?: number): Promise<ExpenseReport[]> {
    try {
      const params: Record<string, any> = {};
      if (userId) params.user_id = userId;
      if (status) params.status = status;
      if (limit) params.limit = limit;
      const response = await this.client.get('/expensereports', { params });
      return z.array(ExpenseReportSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listExpenseReports');
    }
  }

  async getExpenseReport(id: string): Promise<ExpenseReport> {
    try {
      const response = await this.client.get(`/expensereports/${id}`);
      return ExpenseReportSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getExpenseReport(${id})`);
    }
  }

  // === INTERVENTIONS (Fichinter) ===
  async listInterventions(thirdpartyId?: string, status?: string, limit?: number): Promise<Intervention[]> {
    try {
      const params: Record<string, any> = {};
      if (thirdpartyId) params.thirdparty_id = thirdpartyId;
      if (status) params.status = status;
      if (limit) params.limit = limit;
      const response = await this.client.get('/interventions', { params });
      return z.array(InterventionSchema).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'listInterventions');
    }
  }

  async getIntervention(id: string): Promise<Intervention> {
    try {
      const response = await this.client.get(`/interventions/${id}`);
      return InterventionSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, `getIntervention(${id})`);
    }
  }

  async createIntervention(data: { socid: string; description?: string; datec?: number }): Promise<Intervention> {
    try {
      const response = await this.client.post('/interventions', data);
      return InterventionSchema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createIntervention');
    }
  }
}

export const dolibarrClient = new DolibarrClient();

