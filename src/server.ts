#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { config } from './config.js';

// Import Tiers
import * as Thirdparties from './tools/thirdparties.js';

// Import Contacts
import * as Contacts from './tools/contacts.js';

// Import Propositions
import * as Proposals from './tools/proposals.js';

// Import Commandes, Factures, Produits
import * as OrdersInvoicesProducts from './tools/orders-invoices-products.js';

// Import Avancés (Documents, Projets, Tâches, Users, Banques)
import * as Advanced from './tools/advanced.js';

class DolibarrMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'serveur-mcp-dolibarr',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // Enregistrement de tous les outils MCP
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Tiers
        Thirdparties.getThirdPartyTool,
        Thirdparties.searchThirdPartiesTool,
        Thirdparties.createThirdPartyTool,
        Thirdparties.updateThirdPartyTool,
        // Contacts
        Contacts.getContactTool,
        Contacts.listContactsForThirdPartyTool,
        Contacts.createContactTool,
        // Propositions
        Proposals.getProposalTool,
        Proposals.listProposalsTool,
        Proposals.createProposalTool,
        Proposals.addProposalLineTool,
        Proposals.updateProposalLineTool,
        Proposals.deleteProposalLineTool,
        Proposals.changeProposalStatusTool,
        // Commandes
        OrdersInvoicesProducts.getOrderTool,
        OrdersInvoicesProducts.createOrderTool,
        OrdersInvoicesProducts.changeOrderStatusTool,
        // Factures
        OrdersInvoicesProducts.getInvoiceTool,
        OrdersInvoicesProducts.listInvoicesTool,
        OrdersInvoicesProducts.createInvoiceTool,
        OrdersInvoicesProducts.createInvoiceFromProposalTool,
        OrdersInvoicesProducts.recordInvoicePaymentTool,
        // Produits
        OrdersInvoicesProducts.getProductTool,
        OrdersInvoicesProducts.searchProductsTool,
        // Documents
        Advanced.listDocumentsTool,
        Advanced.uploadDocumentTool,
        // Projets
        Advanced.getProjectTool,
        Advanced.listProjectsTool,
        Advanced.createProjectTool,
        // Tâches
        Advanced.getTaskTool,
        Advanced.createTaskTool,
        // Utilisateurs
        Advanced.getUserTool,
        Advanced.listUsersTool,
        // Banques
        Advanced.listBankAccountsTool,
        Advanced.getBankAccountLinesTool,
      ],
    }));

    // Gestion des appels d'outils avec validation Zod automatique
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolHandlers: Record<string, (args: unknown) => Promise<any>> = {
          // Tiers
          'dolibarr_get_thirdparty': Thirdparties.handleGetThirdParty,
          'dolibarr_search_thirdparties': Thirdparties.handleSearchThirdParties,
          'dolibarr_create_thirdparty': Thirdparties.handleCreateThirdParty,
          'dolibarr_update_thirdparty': Thirdparties.handleUpdateThirdParty,
          // Contacts
          'dolibarr_get_contact': Contacts.handleGetContact,
          'dolibarr_list_contacts_for_thirdparty': Contacts.handleListContactsForThirdParty,
          'dolibarr_create_contact': Contacts.handleCreateContact,
          // Propositions
          'dolibarr_get_proposal': Proposals.handleGetProposal,
          'dolibarr_list_proposals': Proposals.handleListProposals,
          'dolibarr_create_proposal': Proposals.handleCreateProposal,
          'dolibarr_add_proposal_line': Proposals.handleAddProposalLine,
          'dolibarr_update_proposal_line': Proposals.handleUpdateProposalLine,
          'dolibarr_delete_proposal_line': Proposals.handleDeleteProposalLine,
          'dolibarr_change_proposal_status': Proposals.handleChangeProposalStatus,
          // Commandes
          'dolibarr_get_order': OrdersInvoicesProducts.handleGetOrder,
          'dolibarr_create_order': OrdersInvoicesProducts.handleCreateOrder,
          'dolibarr_change_order_status': OrdersInvoicesProducts.handleChangeOrderStatus,
          // Factures
          'dolibarr_get_invoice': OrdersInvoicesProducts.handleGetInvoice,
          'dolibarr_list_invoices': OrdersInvoicesProducts.handleListInvoices,
          'dolibarr_create_invoice': OrdersInvoicesProducts.handleCreateInvoice,
          'dolibarr_create_invoice_from_proposal': OrdersInvoicesProducts.handleCreateInvoiceFromProposal,
          'dolibarr_record_invoice_payment': OrdersInvoicesProducts.handleRecordInvoicePayment,
          // Produits
          'dolibarr_get_product': OrdersInvoicesProducts.handleGetProduct,
          'dolibarr_search_products': OrdersInvoicesProducts.handleSearchProducts,
          // Documents
          'dolibarr_list_documents_for_object': Advanced.handleListDocuments,
          'dolibarr_upload_document_for_object': Advanced.handleUploadDocument,
          // Projets
          'dolibarr_get_project': Advanced.handleGetProject,
          'dolibarr_list_projects': Advanced.handleListProjects,
          'dolibarr_create_project': Advanced.handleCreateProject,
          // Tâches
          'dolibarr_get_task': Advanced.handleGetTask,
          'dolibarr_create_task': Advanced.handleCreateTask,
          // Utilisateurs
          'dolibarr_get_user': Advanced.handleGetUser,
          'dolibarr_list_users': Advanced.handleListUsers,
          // Banques
          'dolibarr_list_bank_accounts': Advanced.handleListBankAccounts,
          'dolibarr_get_bank_account_lines': Advanced.handleGetBankAccountLines,
        };

        const handler = toolHandlers[request.params.name];
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Outil inconnu: ${request.params.name}`
          );
        }

        return await handler(request.params.arguments);
      } catch (error: any) {
        // Gestion spéciale des erreurs de validation Zod
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: `Erreur de validation: ${JSON.stringify(error.format(), null, 2)}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Erreur: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Serveur MCP Dolibarr démarré en mode STDIO');
  }
}

const server = new DolibarrMcpServer();
server.run().catch(console.error);
