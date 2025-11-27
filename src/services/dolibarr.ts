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
  TimeEntry,
  TimeEntrySchema,
  ListTimeEntriesArgsSchema,
  ListTasksForProjectArgsSchema,
  Lead,
  LeadSchema,
  ListLeadsArgsSchema,
  GetLeadArgsSchema,
  CreateLeadArgsSchema,
  UpdateLeadArgsSchema,
  Payment,
  PaymentSchema,
  ListPaymentsArgsSchema,
  CreatePaymentArgsSchema,
  ValidateProposalArgsSchema,
  CloseProposalArgsSchema,
  ValidateOrderArgsSchema,
  CloseOrderArgsSchema,
  ShipOrderArgsSchema,
  AssignTaskArgsSchema,
  Member,
  MemberSchema,
  ListMembersArgsSchema,
  CreateMemberArgsSchema,
  GetStatsArgsSchema,
  DownloadDocumentArgsSchema,
  DeleteDocumentArgsSchema,
  ListDocumentsForObjectArgsSchema,
  GeneratePdfArgsSchema,
  SendDocumentByEmailArgsSchema,
} from '../types/index.js';

// Cache simple pour les requêtes GET fréquentes (TTL: 30 secondes)
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl: number;

  constructor(ttlSeconds = 30) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, expires: Date.now() + this.ttl });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
    } else {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }
}

export class DolibarrClient {
  private client: AxiosInstance;
  private cache = new SimpleCache(30); // Cache de 30 secondes

  constructor() {
    // Agent HTTPS pour accepter les certificats auto-signés
    // keepAlive: true pour réutiliser les connexions TCP (performance)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      maxSockets: 10,
    });

    this.client = axios.create({
      baseURL: config.DOLIBARR_BASE_URL,
      headers: {
        'DOLAPIKEY': config.DOLIBARR_API_KEY,
        'Accept': 'application/json',
        'Connection': 'keep-alive',
      },
      timeout: config.AXIOS_TIMEOUT,
      httpsAgent: httpsAgent,
    });

    // Configuration du retry automatique avec délais réduits
    (axiosRetry as any)(this.client, { 
      retries: config.MAX_RETRIES,
      retryDelay: (retryCount: number) => retryCount * 500, // 500ms, 1000ms (plus rapide)
      retryCondition: (error: AxiosError) => {
        return (axiosRetry as any).isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
      onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
        logger.warn(`Retry #${retryCount} for ${requestConfig.url}: ${error.message}`);
      }
    });

    // Intercepteurs pour le logging (mode debug uniquement pour éviter l'overhead)
    if (config.LOG_LEVEL === 'debug') {
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
    } else {
      // En mode non-debug, juste gérer les erreurs
      this.client.interceptors.response.use(
        response => response,
        error => {
          logger.error(`API Error: ${error.message}`, { 
            url: error.config?.url,
            status: error.response?.status 
          });
          return Promise.reject(error);
        }
      );
    }
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
      // Si 404 = aucun résultat trouvé, retourner tableau vide au lieu d'erreur
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.info(`[Dolibarr API] Aucun tiers trouvé pour la recherche: "${query}"`);
        return [];
      }
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
      const validated = AddProposalLineArgsSchema.parse(data);
      const { proposal_id, ...lineData } = validated;
      
      // Log pour debug
      logger.info(`[addProposalLine] Sending to /proposals/${proposal_id}/lines:`, JSON.stringify(lineData, null, 2));
      
      const response = await this.client.post(`/proposals/${proposal_id}/lines`, lineData);
      
      // Log la réponse
      logger.info(`[addProposalLine] Response:`, JSON.stringify(response.data, null, 2));
      
      // Dolibarr peut retourner l'ID directement ou dans un objet
      const responseData = response.data;
      if (responseData === null || responseData === undefined) {
        throw new Error('No result received from Dolibarr API');
      }
      
      // Si c'est un nombre ou une string, c'est l'ID de la ligne créée
      if (typeof responseData === 'number' || typeof responseData === 'string') {
        return String(responseData);
      }
      
      // Si c'est un objet avec un id
      if (typeof responseData === 'object' && responseData.id) {
        return String(responseData.id);
      }
      
      // Sinon, on renvoie la réponse stringifiée pour debug
      return JSON.stringify(responseData);
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
      
      // Méthode correcte : créer la facture et la lier au devis
      const response = await this.client.post('/invoices/createfromproposal/' + proposalId, {});
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      // Fallback si endpoint createfromproposal n'existe pas (anciennes versions)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const proposal = await this.getProposal(proposalId);
        const response = await this.client.post('/invoices', {
          socid: proposal.socid,
          date: Math.floor(Date.now() / 1000),
          linkedObjectsIds: { propal: [proposalId] },
          type: 0
        });
        return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
      }
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
      // Si 404 = aucun résultat trouvé, retourner tableau vide au lieu d'erreur
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.info(`[Dolibarr API] Aucun produit trouvé pour la recherche: "${query}"`);
        return [];
      }
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
    try {
      const validated = CreateWarehouseArgsSchema.parse(data);
      const response = await this.client.post('/warehouses', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createWarehouse');
    }
  }

  // === FOURNISSEURS (Suppliers) ===
  async listSupplierOrders(params: z.infer<typeof ListSupplierOrdersArgsSchema>): Promise<SupplierOrder[]> {
    try {
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

      const response = await this.client.get('/supplierorders', { params: queryParams });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleError(error, 'listSupplierOrders');
    }
  }

  async createSupplierOrder(data: z.infer<typeof CreateSupplierOrderArgsSchema>): Promise<string> {
    try {
      const validated = CreateSupplierOrderArgsSchema.parse(data);
      const response = await this.client.post('/supplierorders', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createSupplierOrder');
    }
  }

  async listSupplierInvoices(params: z.infer<typeof ListSupplierInvoicesArgsSchema>): Promise<SupplierInvoice[]> {
    try {
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

      const response = await this.client.get('/supplierinvoices', { params: queryParams });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleError(error, 'listSupplierInvoices');
    }
  }

  async createSupplierInvoice(data: z.infer<typeof CreateSupplierInvoiceArgsSchema>): Promise<string> {
    try {
      const validated = CreateSupplierInvoiceArgsSchema.parse(data);
      const response = await this.client.post('/supplierinvoices', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createSupplierInvoice');
    }
  }

  // === CATÉGORIES (Tags) ===
  async listCategories(params: z.infer<typeof ListCategoriesArgsSchema>): Promise<Category[]> {
    try {
      const queryParams: any = {
        limit: params.limit || 50,
        sortfield: 't.label',
        sortorder: 'ASC',
      };

      if (params.type) {
        queryParams.type = params.type;
      }

      const response = await this.client.get('/categories', { params: queryParams });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleError(error, 'listCategories');
    }
  }

  async linkCategory(data: z.infer<typeof LinkCategoryArgsSchema>): Promise<string> {
    try {
      const validated = LinkCategoryArgsSchema.parse(data);
      // L'API Dolibarr pour lier une catégorie dépend du type d'objet
      // POST /categories/{id}/objects/{type}/{object_id}
      const response = await this.client.post(
        `/categories/${validated.category_id}/objects/${validated.object_type}/${validated.object_id}`,
        {}
      );
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'linkCategory');
    }
  }

  // === COMMUN (Common) ===
  async sendEmail(data: z.infer<typeof SendEmailArgsSchema>): Promise<string> {
    // NOTE: L'API REST Dolibarr standard n'a pas d'endpoint générique pour l'envoi d'emails.
    // Options possibles:
    // 1. Créer un événement agenda avec notification email
    // 2. Utiliser l'envoi lié à un document (facture, devis, etc.)
    // 3. Utiliser un module externe ou webhook
    
    // On crée un événement agenda de type email qui peut déclencher une notification
    try {
      const eventData = {
        label: data.subject,
        type_code: 'AC_EMAIL', // Type événement email
        datep: Math.floor(Date.now() / 1000),
        note: `To: ${data.to}\n\n${data.message}`,
        percentage: 100, // Marqué comme fait
      };
      
      const response = await this.client.post('agendaevents', eventData);
      return `Email enregistré comme événement agenda #${response.data}. Note: L'envoi réel dépend de la configuration des notifications Dolibarr.`;
    } catch (error) {
      this.handleError(error, 'sendEmail');
    }
  }

  async getServerInfo(): Promise<any> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      this.handleError(error, 'getServerInfo');
    }
  }

  // === NOTES DE FRAIS (Create) ===
  async createExpenseReport(data: z.infer<typeof CreateExpenseReportArgsSchema>): Promise<string> {
    try {
      const validated = CreateExpenseReportArgsSchema.parse(data);
      const response = await this.client.post('/expensereports', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createExpenseReport');
    }
  }

  async listExpenseReports(params: z.infer<typeof ListExpenseReportsArgsSchema>): Promise<ExpenseReport[]> {
    try {
      const queryParams: any = {
        limit: params.limit || 20,
        sortfield: 't.rowid',
        sortorder: 'DESC',
      };
      if (params.user_id) queryParams.sqlfilters = `(t.fk_user_author:=:${params.user_id})`;
      if (params.status) queryParams.status = params.status;
      const response = await this.client.get('/expensereports', { params: queryParams });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleError(error, 'listExpenseReports');
    }
  }

  async getExpenseReport(id: string): Promise<ExpenseReport> {
    try {
      const response = await this.client.get(`/expensereports/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `getExpenseReport(${id})`);
    }
  }

  // === AGENDA ===
  async listAgendaEvents(params: z.infer<typeof ListAgendaEventsArgsSchema>): Promise<AgendaEvent[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.id',
      sortorder: 'DESC',
    };
    
    // Construire les filtres SQL correctement (ne pas écraser)
    const filters: string[] = [];
    if (params.thirdparty_id) filters.push(`(t.fk_soc:=:${params.thirdparty_id})`);
    if (params.user_id) filters.push(`(t.fk_user_author:=:${params.user_id})`);
    if (filters.length > 0) {
      queryParams.sqlfilters = filters.join(' AND ');
    }
    
    const response = await this.client.get('agendaevents', { params: queryParams });
    return response.data;
  }

  async getAgendaEvent(id: string): Promise<AgendaEvent> {
    try {
      const response = await this.client.get(`/agendaevents/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `getAgendaEvent(${id})`);
    }
  }

  async createAgendaEvent(data: z.infer<typeof CreateAgendaEventArgsSchema>): Promise<string> {
    try {
      const validated = CreateAgendaEventArgsSchema.parse(data);
      const response = await this.client.post('/agendaevents', validated);
      return z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
      this.handleError(error, 'createAgendaEvent');
    }
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

  // === TIME ENTRIES (Reporting temps) ===
  async listTimeEntries(params: z.infer<typeof ListTimeEntriesArgsSchema>): Promise<TimeEntry[]> {
    // Dolibarr API: GET /tasks/timespent avec filtres
    const queryParams: any = {
      limit: params.limit || 100,
      sortfield: 't.task_date',
      sortorder: 'DESC',
    };

    // Construction des filtres SQL
    const filters: string[] = [];
    if (params.task_id) filters.push(`(t.fk_task:=:${params.task_id})`);
    if (params.user_id) filters.push(`(t.fk_user:=:${params.user_id})`);
    if (params.project_id) {
      // Pour filtrer par projet, on doit passer par les tâches du projet
      queryParams.project_id = params.project_id;
    }

    if (filters.length > 0) {
      queryParams.sqlfilters = filters.join(' AND ');
    }

    const response = await this.client.get('tasks/timespent', { params: queryParams });
    return response.data;
  }

  async listTasksForProject(projectId: string): Promise<Task[]> {
    const response = await this.client.get(`projects/${projectId}/tasks`);
    return response.data;
  }

  // === OPPORTUNITÉS / LEADS ===
  async listLeads(params: z.infer<typeof ListLeadsArgsSchema>): Promise<Lead[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };

    if (params.status) queryParams.status = params.status;
    if (params.thirdparty_id) queryParams.sqlfilters = `(t.fk_soc:=:${params.thirdparty_id})`;

    const response = await this.client.get('leads', { params: queryParams });
    return response.data;
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.client.get(`leads/${id}`);
    return response.data;
  }

  async createLead(data: z.infer<typeof CreateLeadArgsSchema>): Promise<string> {
    const response = await this.client.post('leads', data);
    return response.data;
  }

  async updateLead(data: z.infer<typeof UpdateLeadArgsSchema>): Promise<void> {
    const { id, ...updateData } = data;
    await this.client.put(`leads/${id}`, updateData);
  }

  // === PAIEMENTS ===
  async listPayments(params: z.infer<typeof ListPaymentsArgsSchema>): Promise<any[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };

    if (params.invoice_id) {
      const response = await this.client.get(`invoices/${params.invoice_id}/payments`);
      return response.data;
    }

    const response = await this.client.get('payments', { params: queryParams });
    return response.data;
  }

  async createPayment(data: z.infer<typeof CreatePaymentArgsSchema>): Promise<string> {
    const { invoice_id, ...paymentData } = data;
    const response = await this.client.post(`invoices/${invoice_id}/payments`, paymentData);
    return response.data;
  }

  // === PROPOSITIONS AVANCÉES ===
  async validateProposal(id: string, notrigger: number = 0): Promise<void> {
    await this.client.post(`proposals/${id}/validate`, { notrigger });
  }

  async closeProposal(id: string, status: string, note?: string): Promise<void> {
    await this.client.post(`proposals/${id}/close`, { status, note });
  }

  // === COMMANDES AVANCÉES ===
  async validateOrder(id: string, idwarehouse?: string, notrigger: number = 0): Promise<void> {
    await this.client.post(`orders/${id}/validate`, { idwarehouse, notrigger });
  }

  async closeOrder(id: string, note?: string): Promise<void> {
    await this.client.post(`orders/${id}/close`, { note });
  }

  async shipOrder(orderId: string, dateDelivery?: number): Promise<string> {
    try {
      // Récupérer la commande pour obtenir les lignes
      const order = await this.getOrder(orderId);
      
      const shipmentData: any = {
        socid: order.socid,
        origin_id: orderId,
        origin_type: 'commande',
        date_delivery: dateDelivery || Math.floor(Date.now() / 1000),
      };
      
      const response = await this.client.post('/shipments', shipmentData);
      const shipmentId = z.union([z.string(), z.number()]).transform(v => String(v)).parse(response.data);
      
      // Ajouter les lignes de la commande à l'expédition
      if (order.lines && Array.isArray(order.lines)) {
        for (const line of order.lines) {
          try {
            await this.client.post(`/shipments/${shipmentId}/lines`, {
              fk_origin_line: line.id,
              qty: line.qty,
              fk_entrepot: line.fk_warehouse || '1', // Entrepôt par défaut si non spécifié
            });
          } catch (lineError) {
            logger.warn(`Impossible d'ajouter la ligne ${line.id} à l'expédition: ${lineError}`);
          }
        }
      }
      
      return shipmentId;
    } catch (error) {
      this.handleError(error, `shipOrder(${orderId})`);
    }
  }

  // === TÂCHES AVANCÉES ===
  async assignTaskToUser(taskId: string, userId: string, percentage?: number): Promise<void> {
    await this.client.post(`tasks/${taskId}/contact/${userId}/user`, {
      percentage: percentage || 100
    });
  }

  // === MEMBRES ===
  async listMembers(params: z.infer<typeof ListMembersArgsSchema>): Promise<any[]> {
    const queryParams: any = {
      limit: params.limit || 20,
      sortfield: 't.rowid',
      sortorder: 'DESC',
    };

    if (params.status) queryParams.statut = params.status;

    const response = await this.client.get('members', { params: queryParams });
    return response.data;
  }

  async createMember(data: z.infer<typeof CreateMemberArgsSchema>): Promise<string> {
    const response = await this.client.post('members', data);
    return response.data;
  }

  // === STATISTIQUES ===
  async getStats(type: string, year?: number, month?: number): Promise<any> {
    const queryParams: any = {};
    if (year) queryParams.year = year;
    if (month) queryParams.month = month;

    let endpoint = '';
    switch (type) {
      case 'ca':
        endpoint = 'statistics/invoices/byyear';
        break;
      case 'topclients':
        endpoint = 'statistics/thirdparties/top';
        break;
      case 'proposals':
        endpoint = 'statistics/proposals/bystatus';
        break;
      case 'payments':
        endpoint = 'statistics/payments/bymonth';
        break;
      default:
        throw new Error(`Type de statistique non supporté: ${type}`);
    }

    const response = await this.client.get(endpoint, { params: queryParams });
    return response.data;
  }

  // === DOCUMENTS AVANCÉS ===
  async downloadDocument(modulepart: string, originalFile: string): Promise<{ filename: string; content: string; mimetype: string }> {
    const response = await this.client.get('documents/download', {
      params: {
        modulepart,
        original_file: originalFile,
      },
    });
    return response.data;
  }

  async deleteDocument(modulepart: string, originalFile: string): Promise<void> {
    await this.client.delete(`documents`, {
      params: {
        modulepart,
        original_file: originalFile,
      },
    });
  }

  async listDocumentsForObject(modulepart: string, id: string): Promise<any[]> {
    const response = await this.client.get(`documents`, {
      params: {
        modulepart,
        id,
        sortfield: 't.name',
        sortorder: 'ASC',
      },
    });
    return response.data;
  }

  async generatePdf(module: string, id: string): Promise<{ filename: string; content: string }> {
    let endpoint = '';
    switch (module) {
      case 'invoice':
        endpoint = `invoices/${id}/builddoc`;
        break;
      case 'propal':
        endpoint = `proposals/${id}/builddoc`;
        break;
      case 'order':
        endpoint = `orders/${id}/builddoc`;
        break;
      case 'contract':
        endpoint = `contracts/${id}/builddoc`;
        break;
      default:
        throw new Error(`Module non supporté: ${module}`);
    }

    const response = await this.client.put(endpoint, {});
    return response.data;
  }

  async sendDocumentByEmail(module: string, id: string, sendto: string, subject?: string, message?: string): Promise<void> {
    let endpoint = '';
    switch (module) {
      case 'invoice':
        endpoint = `invoices/${id}/sendbyemail`;
        break;
      case 'propal':
        endpoint = `proposals/${id}/sendbyemail`;
        break;
      case 'order':
        endpoint = `orders/${id}/sendbyemail`;
        break;
      default:
        throw new Error(`Module non supporté: ${module}`);
    }

    await this.client.post(endpoint, {
      sendto,
      subject: subject || `Document ${module} #${id}`,
      message: message || `Veuillez trouver ci-joint le document.`,
    });
  }

  // === GROUPES & PERMISSIONS ===
  async listUserGroups(limit?: number): Promise<any[]> {
    const response = await this.client.get('usergroups', { params: { limit: limit || 100 } });
    return response.data;
  }

  async getUserGroup(id: string): Promise<any> {
    const response = await this.client.get(`usergroups/${id}`);
    return response.data;
  }

  async createUserGroup(name: string, note?: string): Promise<string> {
    const response = await this.client.post('usergroups', {
      nom: name,
      note: note || '',
    });
    return response.data;
  }

  async updateUserGroup(id: string, name?: string, note?: string): Promise<void> {
    await this.client.put(`usergroups/${id}`, {
      nom: name,
      note,
    });
  }

  async deleteUserGroup(id: string): Promise<void> {
    await this.client.delete(`usergroups/${id}`);
  }

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    await this.client.post(`usergroups/${groupId}/users/${userId}`, {});
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    await this.client.delete(`usergroups/${groupId}/users/${userId}`);
  }

  async setUserRights(userId: string, module: string, permission: string, value: string): Promise<void> {
    // Note: Dolibarr API pour les droits peut varier selon la version
    // Cette méthode peut nécessiter un endpoint custom ou un module spécifique
    await this.client.post(`users/${userId}/setRights`, {
      module,
      permission,
      value,
    });
  }

  async getAuditLogs(userId?: string, action?: string, limit?: number, dateStart?: number, dateEnd?: number): Promise<any[]> {
    // Note: Nécessite le module "EventOrganization" ou un module audit personnalisé
    const params: any = { limit: limit || 100 };
    if (userId) params.fk_user = userId;
    if (action) params.code = action;
    if (dateStart) params.date_start = dateStart;
    if (dateEnd) params.date_end = dateEnd;

    const response = await this.client.get('events', { params });
    return response.data;
  }

  // === MULTI-ENTITÉS & DEVISES ===
  async listEntities(limit?: number): Promise<any[]> {
    const response = await this.client.get('multicompany/entities', { params: { limit: limit || 100 } });
    return response.data;
  }

  async getEntity(id: string): Promise<any> {
    const response = await this.client.get(`multicompany/entities/${id}`);
    return response.data;
  }

  async createEntity(label: string, description?: string): Promise<string> {
    const response = await this.client.post('multicompany/entities', {
      label,
      description: description || '',
    });
    return response.data;
  }

  async listCurrencies(active?: string): Promise<any[]> {
    const params: any = {};
    if (active) params.active = active;
    const response = await this.client.get('setup/dictionary/currencies', { params });
    return response.data;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string, date?: number): Promise<any> {
    // Note: Dolibarr utilise des taux de change configurés dans setup/dictionary/currency_rate
    const params: any = {
      amount,
      from: fromCurrency,
      to: toCurrency,
    };
    if (date) params.date = date;

    const response = await this.client.get('setup/dictionary/convert_currency', { params });
    return response.data;
  }

  // === CALENDRIER & ABSENCES ===
  async listHolidays(userId?: string, status?: string, year?: number, limit?: number): Promise<any[]> {
    const params: any = { limit: limit || 100 };
    if (userId) params.fk_user = userId;
    if (status) params.statut = status;
    if (year) params.year = year;

    const response = await this.client.get('holidays', { params });
    return response.data;
  }

  async getHoliday(id: string): Promise<any> {
    const response = await this.client.get(`holidays/${id}`);
    return response.data;
  }

  async createHoliday(data: any): Promise<string> {
    const response = await this.client.post('holidays', data);
    return response.data;
  }

  async validateHoliday(id: string, approve: boolean): Promise<void> {
    const action = approve ? 'approve' : 'refuse';
    await this.client.post(`holidays/${id}/${action}`, {});
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.client.delete(`holidays/${id}`);
  }

  async createResourceBooking(resourceId: string, userId: string, dateStart: number, dateEnd: number, note?: string): Promise<string> {
    // Note: Nécessite le module "Resource" activé dans Dolibarr
    const response = await this.client.post('resources/bookings', {
      fk_resource: resourceId,
      fk_user: userId,
      date_start: dateStart,
      date_end: dateEnd,
      note: note || '',
    });
    return response.data;
  }

  async listResourceBookings(resourceId?: string, userId?: string): Promise<any[]> {
    const params: any = {};
    if (resourceId) params.fk_resource = resourceId;
    if (userId) params.fk_user = userId;

    const response = await this.client.get('resources/bookings', { params });
    return response.data;
  }

  // === ABONNEMENTS (Subscriptions) ===
  async listSubscriptions(thirdpartyId?: string, status?: string, limit?: number): Promise<any[]> {
    const params: any = { limit: limit || 100 };
    if (thirdpartyId) params.socid = thirdpartyId;
    if (status) params.statut = status;

    const response = await this.client.get('subscriptions', { params });
    return response.data;
  }

  async getSubscription(id: string): Promise<any> {
    const response = await this.client.get(`subscriptions/${id}`);
    return response.data;
  }

  async createSubscription(data: any): Promise<string> {
    const response = await this.client.post('subscriptions', data);
    return response.data;
  }

  async renewSubscription(id: string, duration: number): Promise<void> {
    await this.client.post(`subscriptions/${id}/renew`, {
      duration,
    });
  }

  async cancelSubscription(id: string, note?: string): Promise<void> {
    await this.client.post(`subscriptions/${id}/cancel`, {
      note: note || '',
    });
  }
}

export const dolibarrClient = new DolibarrClient();

