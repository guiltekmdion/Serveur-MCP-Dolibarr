import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';
import { config } from '../config.js';
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
    this.client = axios.create({
      baseURL: config.DOLIBARR_BASE_URL,
      headers: {
        'DOLAPIKEY': config.DOLIBARR_API_KEY,
        'Accept': 'application/json',
      },
    });
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      console.error(`[Dolibarr API] Error in ${context}: ${status} - ${message}`);
      throw new Error(`Dolibarr API Error (${status}): ${message}`);
    }
    console.error(`[Dolibarr API] Unexpected error in ${context}:`, error);
    throw error;
  }

  async getThirdParty(id: string): Promise<ThirdParty> {
    try {
      const response = await this.client.get(`/thirdparties/${id}`);
      // Validation Zod de la réponse
      const validated = ThirdPartySchema.parse(response.data);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[Dolibarr API] Validation error:', error.format());
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
        console.error('[Dolibarr API] Validation error:', error.format());
        throw new Error(`Données invalides reçues de l'API Dolibarr: ${error.message}`);
      }
      this.handleError(error, `searchThirdParties(${query})`);
    }
  }

  async createProposal(proposal: CreateProposalArgs): Promise<string> {
    try {
      const validated = CreateProposalArgsSchema.parse(proposal);
      const response = await this.client.post('/proposals', validated);
      const id = z.string().parse(response.data);
      return id;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[Dolibarr API] Validation error:', error.format());
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
    } catch (error) {
      this.handleError(error, `createInvoiceFromProposal(${proposalId})`);
    }
  }

  async recordInvoicePayment(data: z.infer<typeof RecordInvoicePaymentArgsSchema>): Promise<string> {
    try {
      const { invoice_id, ...paymentData } = RecordInvoicePaymentArgsSchema.parse(data);
      const response = await this.client.post(`/invoices/${invoice_id}/payments`, paymentData);
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
      return z.string().parse(response.data);
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
}

export const dolibarrClient = new DolibarrClient();
