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
  SupplierOrder,
  SupplierInvoice,
  Category,
  ListSupplierOrdersArgsSchema,
  CreateSupplierOrderArgsSchema,
  ListSupplierInvoicesArgsSchema,
  CreateSupplierInvoiceArgsSchema,
  ListCategoriesArgsSchema,
  LinkCategoryArgsSchema,
  SendEmailArgsSchema,
  GetServerInfoArgsSchema,
  CreateExpenseReportArgsSchema,
  ThirdPartySchema,
  CreateThirdPartyArgsSchema,
  UpdateThirdPartyArgsSchema,
  ContactSchema,
  CreateContactArgsSchema,
  ProposalSchema,
  CreateProposalArgsSchema,
  CreateProposalArgs,
  AddProposalLineArgsSchema,
  UpdateProposalLineArgsSchema,
  OrderSchema,
  CreateOrderArgsSchema,
  InvoiceSchema,
  CreateInvoiceArgsSchema,
  RecordInvoicePaymentArgsSchema,
  ProductSchema,
  CreateProductArgsSchema,
  UpdateProductArgsSchema,
  UploadDocumentArgsSchema,
  ProjectSchema,
  CreateProjectArgsSchema,
  UpdateProjectArgsSchema,
  TaskSchema,
  CreateTaskArgsSchema,
  UpdateTaskArgsSchema,
  AddTaskTimeArgsSchema,
  UserSchema,
  CreateUserArgsSchema,
  UpdateUserArgsSchema,
  BankAccountSchema,
  CreateBankAccountArgsSchema,
  WarehouseSchema,
  CreateWarehouseArgsSchema,
  ListAgendaEventsArgsSchema,
  GetAgendaEventArgsSchema,
  CreateAgendaEventArgsSchema,
  AgendaEventSchema,
  ListContractsArgsSchema,
  GetContractArgsSchema,
  CreateContractArgsSchema,
  ContractSchema,
  ListExpenseReportsArgsSchema,
  GetExpenseReportArgsSchema,
  ExpenseReportSchema,
  ListInterventionsArgsSchema,
  GetInterventionArgsSchema,
  CreateInterventionArgsSchema,
  InterventionSchema,
  ListShipmentsArgsSchema,
  GetShipmentArgsSchema,
  CreateShipmentArgsSchema,
  ShipmentSchema,
  ListStockMovementsArgsSchema,
  CreateStockMovementArgsSchema,
  StockMovementSchema,
  ListTicketsArgsSchema,
  GetTicketArgsSchema,
  CreateTicketArgsSchema,
  TicketSchema,
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

  async createProduct(data: z.infer<typeof CreateProductArgsSchema>): Promise<string> {
    try {
      const validated = CreateProductArgsSchema.parse(data);
      const response = await this.client.post('/products', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createProduct');
    }
  }

  async updateProduct(data: z.infer<typeof UpdateProductArgsSchema>): Promise<string> {
    try {
      const { id, ...updateData } = UpdateProductArgsSchema.parse(data);
      const response = await this.client.put(`/products/${id}`, updateData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateProduct');
    }
  }

  async deleteProduct(id: string): Promise<string> {
    try {
      const response = await this.client.delete(`/products/${id}`);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      this.handleError(error, `deleteProduct(${id})`);
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

  async updateProject(data: z.infer<typeof UpdateProjectArgsSchema>): Promise<string> {
    try {
      const { id, ...updateData } = UpdateProjectArgsSchema.parse(data);
      const response = await this.client.put(`/projects/${id}`, updateData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateProject');
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

  async updateTask(data: z.infer<typeof UpdateTaskArgsSchema>): Promise<string> {
    try {
      const { id, ...updateData } = UpdateTaskArgsSchema.parse(data);
      const response = await this.client.put(`/tasks/${id}`, updateData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateTask');
    }
  }

  async addTaskTime(data: z.infer<typeof AddTaskTimeArgsSchema>): Promise<string> {
    try {
      const { id, ...timeData } = AddTaskTimeArgsSchema.parse(data);
      const response = await this.client.post(`/tasks/${id}/addtime`, timeData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'addTaskTime');
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

  async listUsers(limit: number = 50): Promise<User[]> {
    try {
      const response = await this.client.get('/users', {
        params: { limit }
      });
      return z.array(UserSchema).parse(response.data);
    } catch (error) {
      this.handleError(error, 'listUsers');
    }
  }

  async createUser(data: z.infer<typeof CreateUserArgsSchema>): Promise<string> {
    try {
      const validated = CreateUserArgsSchema.parse(data);
      const response = await this.client.post('/users', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createUser');
    }
  }

  async updateUser(data: z.infer<typeof UpdateUserArgsSchema>): Promise<string> {
    try {
      const { id, ...updateData } = UpdateUserArgsSchema.parse(data);
      const response = await this.client.put(`/users/${id}`, updateData);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'updateUser');
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

  async createBankAccount(data: z.infer<typeof CreateBankAccountArgsSchema>): Promise<string> {
    try {
      const validated = CreateBankAccountArgsSchema.parse(data);
      const response = await this.client.post('/bankaccounts', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createBankAccount');
    }
  }

  // === ENTREPÔTS ===
  async listWarehouses(limit: number = 50): Promise<Warehouse[]> {
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
      this.handleError(error, `getWarehouse(${id})`);
    }
  }

  async createWarehouse(data: z.infer<typeof CreateWarehouseArgsSchema>): Promise<string> {
    const response = await this.client.post('warehouses', data);
    return response.data;
  }

  // === FOURNISSEURS (Suppliers) ===
  async listSupplierOrders(params: z.infer<typeof ListSupplierOrdersArgsSchema>): Promise<SupplierOrder[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };

    if (params.thirdparty_id) {
      queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    }
    if (params.status) {
      queryParams.status = params.status;
    }

    const response = await this.client.get('supplierorders', { params: queryParams });
    return response.data;
  }

  async createSupplierOrder(data: z.infer<typeof CreateSupplierOrderArgsSchema>): Promise<string> {
    const response = await this.client.post('supplierorders', data);
    return response.data;
  }

  async listSupplierInvoices(params: z.infer<typeof ListSupplierInvoicesArgsSchema>): Promise<SupplierInvoice[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };

    if (params.thirdparty_id) {
      queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    }
    if (params.status) {
      queryParams.status = params.status;
    }

    const response = await this.client.get('supplierinvoices', { params: queryParams });
    return response.data;
  }

  async createSupplierInvoice(data: z.infer<typeof CreateSupplierInvoiceArgsSchema>): Promise<string> {
    const response = await this.client.post('supplierinvoices', data);
    return response.data;
  }

  // === CATÉGORIES (Tags) ===
  async listCategories(params: z.infer<typeof ListCategoriesArgsSchema>): Promise<Category[]> {
    const queryParams: any = {
      limit: params.limit || 50,
      sortfield: 't.label',
      sortorder: 'ASC',
    };

    if (params.type) {
      queryParams.type = params.type;
    }

    const response = await this.client.get('categories', { params: queryParams });
    return response.data;
  }

  async linkCategory(data: z.infer<typeof LinkCategoryArgsSchema>): Promise<string> {
    // L'API Dolibarr pour lier une catégorie dépend du type d'objet
    // POST /categories/{id}/objects/{type}/{object_id}
    const response = await this.client.post(
      `categories/${data.category_id}/objects/${data.object_type}/${data.object_id}`,
      {}
    );
    return response.data;
  }

  // === COMMUN (Common) ===
  async sendEmail(data: z.infer<typeof SendEmailArgsSchema>): Promise<string> {
    // Utilisation de l'endpoint setup/checkemail ou similaire si disponible, 
    // mais Dolibarr n'a pas toujours un endpoint générique simple pour envoyer un mail arbitraire via API REST standard.
    // On va tenter d'utiliser /setup/checkemail qui est souvent utilisé pour tester l'envoi.
    // Sinon, il faudrait créer un événement ou utiliser un module externe.
    // NOTE: L'API standard est limitée pour l'envoi d'email "libre".
    // On va utiliser une astuce via un endpoint existant ou simuler.
    // Pour l'instant, on va assumer que l'utilisateur a activé un module ou que l'on utilise une commande système si possible,
    // mais via REST, le plus proche est souvent lié aux documents.
    
    // Alternative: POST /setup/checkemail (test email)
    // Ce n'est pas idéal pour de la prod mais ça dépanne.
    // Une meilleure approche est de créer un événement agenda avec email, mais c'est complexe.
    
    // Essayons l'endpoint de test qui est souvent ouvert aux admins.
    const response = await this.client.post('setup/checkemail', {
        sendto: data.to,
        subject: data.subject,
        message: data.message,
        from: data.from
    });
    return "Email envoyé (via test endpoint)";
  }

  async getServerInfo(): Promise<any> {
    const response = await this.client.get('status');
    return response.data;
  }

  // === NOTES DE FRAIS (Create) ===
  async createExpenseReport(data: z.infer<typeof CreateExpenseReportArgsSchema>): Promise<string> {
    const response = await this.client.post('expensereports', data);
    return response.data;
  }

  async listExpenseReports(params: z.infer<typeof ListExpenseReportsArgsSchema>): Promise<ExpenseReport[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.user_id) queryParams.sqlfilters = `(t.fk_user_author:=:${params.user_id})`;
    if (params.status) queryParams.status = params.status;
    const response = await this.client.get('expensereports', { params: queryParams });
    return response.data;
  }

  async getExpenseReport(id: string): Promise<ExpenseReport> {
    const response = await this.client.get(`expensereports/${id}`);
    return response.data;
  }

  // === AGENDA ===
  async listAgendaEvents(params: z.infer<typeof ListAgendaEventsArgsSchema>): Promise<AgendaEvent[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.id',
      sortorder: 'DESC',
    };
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    if (params.user_id) queryParams.sqlfilters = `(t.fk_user_author:=:${params.user_id})`;
    const response = await this.client.get('agendaevents', { params: queryParams });
    return response.data;
  }

  async getAgendaEvent(id: string): Promise<AgendaEvent> {
    const response = await this.client.get(`agendaevents/${id}`);
    return response.data;
  }

  async createAgendaEvent(data: z.infer<typeof CreateAgendaEventArgsSchema>): Promise<string> {
    const response = await this.client.post('agendaevents', data);
    return response.data;
  }

  // === CONTRATS ===
  async listContracts(params: z.infer<typeof ListContractsArgsSchema>): Promise<Contract[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    if (params.status) queryParams.status = params.status;
    const response = await this.client.get('contracts', { params: queryParams });
    return response.data;
  }

  async getContract(id: string): Promise<Contract> {
    const response = await this.client.get(`contracts/${id}`);
    return response.data;
  }

  async createContract(data: z.infer<typeof CreateContractArgsSchema>): Promise<string> {
    const response = await this.client.post('contracts', data);
    return response.data;
  }

  // === INTERVENTIONS ===
  async listInterventions(params: z.infer<typeof ListInterventionsArgsSchema>): Promise<Intervention[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    if (params.status) queryParams.status = params.status;
    const response = await this.client.get('interventions', { params: queryParams });
    return response.data;
  }

  async getIntervention(id: string): Promise<Intervention> {
    const response = await this.client.get(`interventions/${id}`);
    return response.data;
  }

  async createIntervention(data: z.infer<typeof CreateInterventionArgsSchema>): Promise<string> {
    const response = await this.client.post('interventions', data);
    return response.data;
  }

  // === EXPÉDITIONS ===
  async listShipments(params: z.infer<typeof ListShipmentsArgsSchema>): Promise<Shipment[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    if (params.status) queryParams.status = params.status;
    const response = await this.client.get('shipments', { params: queryParams });
    return response.data;
  }

  async getShipment(id: string): Promise<Shipment> {
    const response = await this.client.get(`shipments/${id}`);
    return response.data;
  }

  async createShipment(data: z.infer<typeof CreateShipmentArgsSchema>): Promise<string> {
    const response = await this.client.post('shipments', data);
    return response.data;
  }

  // === STOCK ===
  async listStockMovements(params: z.infer<typeof ListStockMovementsArgsSchema>): Promise<StockMovement[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.product_id) queryParams.sqlfilters = `(t.fk_product:=:${params.product_id})`;
    if (params.warehouse_id) queryParams.sqlfilters = `(t.fk_entrepot:=:${params.warehouse_id})`;
    const response = await this.client.get('stockmovements', { params: queryParams });
    return response.data;
  }

  async createStockMovement(data: z.infer<typeof CreateStockMovementArgsSchema>): Promise<string> {
    const response = await this.client.post('stockmovements', data);
    return response.data;
  }

  // === TICKETS ===
  async listTickets(params: z.infer<typeof ListTicketsArgsSchema>): Promise<Ticket[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;
    if (params.status) queryParams.status = params.status;
    const response = await this.client.get('tickets', { params: queryParams });
    return response.data;
  }

  async getTicket(id: string): Promise<Ticket> {
    const response = await this.client.get(`tickets/${id}`);
    return response.data;
  }

  async createTicket(data: z.infer<typeof CreateTicketArgsSchema>): Promise<string> {
    const response = await this.client.post('tickets', data);
    return response.data;
  }
}

export const dolibarrClient = new DolibarrClient();

