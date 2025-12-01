#!/usr/bin/env node
/**
 * Serveur MCP pour Dolibarr
 * Auteur: Maxime DION (Guiltek)
 * Site: https://guiltek.com
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { config } from './utils/config.js';

// Import Resources
import { RESOURCES, handleReadResource } from './resources/index.js';

// Import Prompts
import { PROMPTS, handleGetPrompt } from './prompts/index.js';

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

// ============================================
// NOUVEAUX MODULES - Novembre 2025
// ============================================
// Import Entrepôts
import * as Warehouses from './tools/warehouses.js';

// Import Stock
import * as Stock from './tools/stock.js';

// Import Expéditions
import * as Shipments from './tools/shipments.js';

// Import Contrats
import * as Contracts from './tools/contracts.js';

// Import Tickets
import * as Tickets from './tools/tickets.js';

// Import Fournisseurs
import * as Suppliers from './tools/suppliers.js';

// Import Catégories
import * as Categories from './tools/categories.js';

// Import Commun
import * as Common from './tools/common.js';

// Import Agenda
import * as Agenda from './tools/agenda.js';

// Import Notes de Frais
import * as ExpenseReports from './tools/expensereports.js';

// Import Interventions
import * as Interventions from './tools/interventions.js';

// Import Projects Advanced (Time Entries, Leads)
import * as ProjectsAdvanced from './tools/projects-advanced.js';

// Import Advanced Features (Payments, Validation, Stats, Members)
import * as AdvancedFeatures from './tools/advanced-features.js';

// Import Documents Tools
import * as Documents from './tools/documents.js';

// Import Permissions & Audit
import * as Permissions from './tools/permissions.js';

// Import Multi-Entity
import * as MultiEntity from './tools/multi-entity.js';

// Import Calendar & Holidays
import * as Calendar from './tools/calendar.js';

// Import Subscriptions
import * as Subscriptions from './tools/subscriptions.js';

// Import Analysis
import * as Analysis from './tools/analysis.js';

// Import dolibarrClient une seule fois au démarrage (performance)
import { dolibarrClient } from './services/dolibarr.js';

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
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    
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
        OrdersInvoicesProducts.createProductTool,
        OrdersInvoicesProducts.updateProductTool,
        OrdersInvoicesProducts.deleteProductTool,
        // Documents
        Advanced.listDocumentsTool,
        Advanced.uploadDocumentTool,
        // Projets
        Advanced.getProjectTool,
        Advanced.listProjectsTool,
        Advanced.createProjectTool,
        Advanced.updateProjectTool,
        Advanced.deleteProjectTool,
        Advanced.addProjectContactTool,
        Advanced.deleteProjectContactTool,
        Advanced.getProjectInvoicesTool,
        Advanced.getProjectOrdersTool,
        Advanced.getProjectProposalsTool,
        Advanced.closeProjectTool,
        Advanced.reopenProjectTool,
        Advanced.getProjectOverviewTool,
        Advanced.getProjectDocumentsTool,
        // Tâches
        Advanced.getTaskTool,
        Advanced.createTaskTool,
        Advanced.updateTaskTool,
        Advanced.addTaskTimeTool,
        Advanced.listTasksTool,
        Advanced.deleteTaskTool,
        Advanced.getTaskTimeSpentTool,
        Advanced.assignTaskUserTool,
        Advanced.unassignTaskUserTool,
        Advanced.completeTaskTool,
        Advanced.reopenTaskTool,
        Advanced.getTaskDocumentsTool,
        Advanced.listUserTasksTool,
        Advanced.getTaskChildrenTool,
        // Utilisateurs
        Advanced.getUserTool,
        Advanced.listUsersTool,
        Advanced.createUserTool,
        Advanced.updateUserTool,
        Advanced.deleteUserTool,
        Advanced.getUserGroupsTool,
        Advanced.addUserToGroupTool,
        Advanced.removeUserFromGroupTool,
        Advanced.getUserPermissionsTool,
        Advanced.disableUserTool,
        Advanced.enableUserTool,
        Advanced.updateUserPasswordTool,
        Advanced.listGroupsTool,
        Advanced.createGroupTool,
        // Banques
        Advanced.listBankAccountsTool,
        Advanced.getBankAccountLinesTool,
        Advanced.createBankAccountTool,
        // ============================================
        // NOUVEAUX OUTILS - Novembre 2025
        // ============================================
        // Entrepôts
        ...Warehouses.warehouseTools,
        // Stock
        ...Stock.stockTools,
        // Expéditions
        ...Shipments.shipmentTools,
        // Contrats
        ...Contracts.contractTools,
        // Tickets
        ...Tickets.ticketTools,
        // Fournisseurs
        ...Suppliers.supplierTools,
        // Catégories
        ...Categories.categoryTools,
        // Commun
        ...Common.commonTools,
        // Agenda
        ...Agenda.agendaTools,
        // Notes de Frais
        ...ExpenseReports.expenseReportTools,
        // Interventions
        ...Interventions.interventionTools,
        // Projects Advanced (Time, Leads)
        ProjectsAdvanced.listTimeEntriesTool,
        ProjectsAdvanced.listTasksForProjectTool,
        ProjectsAdvanced.listLeadsTool,
        ProjectsAdvanced.getLeadTool,
        ProjectsAdvanced.createLeadTool,
        ProjectsAdvanced.updateLeadTool,
        // Advanced Features
        ...AdvancedFeatures.advancedTools,
        // Documents
        ...Documents.documentTools,
        // Permissions & Audit
        ...Permissions.permissionsTools,
        // Multi-Entity & Currencies
        ...MultiEntity.multiEntityTools,
        // Calendar & Holidays
        ...Calendar.calendarTools,
        // Subscriptions
        ...Subscriptions.subscriptionsTools,
        // Analysis
        ...Analysis.analysisTools,
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
          'dolibarr_create_product': OrdersInvoicesProducts.handleCreateProduct,
          'dolibarr_update_product': OrdersInvoicesProducts.handleUpdateProduct,
          'dolibarr_delete_product': OrdersInvoicesProducts.handleDeleteProduct,
          // Documents (Legacy - kept for backward compatibility)
          'dolibarr_upload_document_for_object': Advanced.handleUploadDocument,
          // Projets
          'dolibarr_get_project': Advanced.handleGetProject,
          'dolibarr_list_projects': Advanced.handleListProjects,
          'dolibarr_create_project': Advanced.handleCreateProject,
          'dolibarr_update_project': Advanced.handleUpdateProject,
          'dolibarr_delete_project': Advanced.handleDeleteProject,
          'dolibarr_add_project_contact': Advanced.handleAddProjectContact,
          'dolibarr_delete_project_contact': Advanced.handleDeleteProjectContact,
          'dolibarr_get_project_invoices': Advanced.handleGetProjectInvoices,
          'dolibarr_get_project_orders': Advanced.handleGetProjectOrders,
          'dolibarr_get_project_proposals': Advanced.handleGetProjectProposals,
          'dolibarr_close_project': Advanced.handleCloseProject,
          'dolibarr_reopen_project': Advanced.handleReopenProject,
          'dolibarr_get_project_overview': Advanced.handleGetProjectOverview,
          'dolibarr_get_project_documents': Advanced.handleGetProjectDocuments,
          // Tâches
          'dolibarr_get_task': Advanced.handleGetTask,
          'dolibarr_create_task': Advanced.handleCreateTask,
          'dolibarr_update_task': Advanced.handleUpdateTask,
          'dolibarr_add_task_time': Advanced.handleAddTaskTime,
          'dolibarr_list_tasks': Advanced.handleListTasks,
          'dolibarr_delete_task': Advanced.handleDeleteTask,
          'dolibarr_get_task_time_spent': Advanced.handleGetTaskTimeSpent,
          'dolibarr_assign_task_user': Advanced.handleAssignTaskUser,
          'dolibarr_unassign_task_user': Advanced.handleUnassignTaskUser,
          'dolibarr_complete_task': Advanced.handleCompleteTask,
          'dolibarr_reopen_task': Advanced.handleReopenTask,
          'dolibarr_get_task_documents': Advanced.handleGetTaskDocuments,
          'dolibarr_list_user_tasks': Advanced.handleListUserTasks,
          'dolibarr_get_task_children': Advanced.handleGetTaskChildren,
          // Utilisateurs
          'dolibarr_get_user': Advanced.handleGetUser,
          'dolibarr_list_users': Advanced.handleListUsers,
          'dolibarr_create_user': Advanced.handleCreateUser,
          'dolibarr_update_user': Advanced.handleUpdateUser,
          'dolibarr_delete_user': Advanced.handleDeleteUser,
          'dolibarr_get_user_groups': Advanced.handleGetUserGroups,
          'dolibarr_add_user_to_group': Advanced.handleAddUserToGroup,
          'dolibarr_remove_user_from_group': Advanced.handleRemoveUserFromGroup,
          'dolibarr_get_user_permissions': Advanced.handleGetUserPermissions,
          'dolibarr_disable_user': Advanced.handleDisableUser,
          'dolibarr_enable_user': Advanced.handleEnableUser,
          'dolibarr_update_user_password': Advanced.handleUpdateUserPassword,
          'dolibarr_list_groups': Advanced.handleListGroups,
          'dolibarr_create_group': Advanced.handleCreateGroup,
          // Banques
          'dolibarr_list_bank_accounts': Advanced.handleListBankAccounts,
          'dolibarr_get_bank_account_lines': Advanced.handleGetBankAccountLines,
          'dolibarr_create_bank_account': Advanced.handleCreateBankAccount,
          // ============================================
          // NOUVEAUX HANDLERS - Novembre 2025
          // ============================================
          // Entrepôts
          'dolibarr_list_warehouses': Warehouses.handleListWarehouses,
          'dolibarr_get_warehouse': Warehouses.handleGetWarehouse,
          'dolibarr_create_warehouse': Warehouses.handleCreateWarehouse,
          'dolibarr_update_warehouse': Warehouses.handleUpdateWarehouse,
          'dolibarr_delete_warehouse': Warehouses.handleDeleteWarehouse,
          'dolibarr_get_warehouse_stock': Warehouses.handleGetWarehouseStock,
          // Stock
          'dolibarr_list_stock_movements': Stock.handleListStockMovements,
          'dolibarr_create_stock_movement': Stock.handleCreateStockMovement,
          'dolibarr_transfer_stock': Stock.handleTransferStock,
          'dolibarr_correct_stock': Stock.handleCorrectStock,
          // Expéditions
          'dolibarr_list_shipments': Shipments.handleListShipments,
          'dolibarr_get_shipment': Shipments.handleGetShipment,
          'dolibarr_create_shipment': Shipments.handleCreateShipment,
          'dolibarr_update_shipment': Shipments.handleUpdateShipment,
          'dolibarr_delete_shipment': Shipments.handleDeleteShipment,
          'dolibarr_validate_shipment': Shipments.handleValidateShipment,
          'dolibarr_close_shipment': Shipments.handleCloseShipment,
          'dolibarr_create_shipment_line': Shipments.handleCreateShipmentLine,
          'dolibarr_delete_shipment_line': Shipments.handleDeleteShipmentLine,
          'dolibarr_get_shipment_document': Shipments.handleGetShipmentDocument,
          // Contrats
          'dolibarr_list_contracts': Contracts.handleListContracts,
          'dolibarr_get_contract': Contracts.handleGetContract,
          'dolibarr_create_contract': Contracts.handleCreateContract,
          'dolibarr_update_contract': Contracts.handleUpdateContract,
          'dolibarr_delete_contract': Contracts.handleDeleteContract,
          'dolibarr_validate_contract': Contracts.handleValidateContract,
          'dolibarr_close_contract': Contracts.handleCloseContract,
          'dolibarr_add_contract_line': Contracts.handleAddContractLine,
          'dolibarr_update_contract_line': Contracts.handleUpdateContractLine,
          'dolibarr_delete_contract_line': Contracts.handleDeleteContractLine,
          'dolibarr_activate_contract_line': Contracts.handleActivateContractLine,
          'dolibarr_close_contract_line': Contracts.handleCloseContractLine,
          // Tickets
          'dolibarr_list_tickets': Tickets.handleListTickets,
          'dolibarr_get_ticket': Tickets.handleGetTicket,
          'dolibarr_create_ticket': Tickets.handleCreateTicket,
          'dolibarr_update_ticket': Tickets.handleUpdateTicket,
          'dolibarr_delete_ticket': Tickets.handleDeleteTicket,
          'dolibarr_add_ticket_message': Tickets.handleAddTicketMessage,
          'dolibarr_get_ticket_messages': Tickets.handleGetTicketMessages,
          'dolibarr_assign_ticket': Tickets.handleAssignTicket,
          'dolibarr_close_ticket': Tickets.handleCloseTicket,
          'dolibarr_get_ticket_categories': Tickets.handleGetTicketCategories,
          // Fournisseurs (Commandes & Factures)
          'dolibarr_list_supplier_orders': Suppliers.handleListSupplierOrders,
          'dolibarr_create_supplier_order': Suppliers.handleCreateSupplierOrder,
          'dolibarr_list_supplier_invoices': Suppliers.handleListSupplierInvoices,
          'dolibarr_create_supplier_invoice': Suppliers.handleCreateSupplierInvoice,
          // Catégories
          'dolibarr_list_categories': Categories.handleListCategories,
          'dolibarr_link_category': Categories.handleLinkCategory,
          // Commun
          'dolibarr_help': Common.handleHelpGuide,
          'dolibarr_send_email': Common.handleSendEmail,
          'dolibarr_get_server_info': Common.handleGetServerInfo,
          // Agenda
          'dolibarr_list_agenda_events': Agenda.handleListAgendaEvents,
          'dolibarr_get_agenda_event': Agenda.handleGetAgendaEvent,
          'dolibarr_create_agenda_event': Agenda.handleCreateAgendaEvent,
          // Notes de Frais
          'dolibarr_list_expense_reports': ExpenseReports.handleListExpenseReports,
          'dolibarr_get_expense_report': ExpenseReports.handleGetExpenseReport,
          'dolibarr_create_expense_report': ExpenseReports.handleCreateExpenseReport,
          'dolibarr_update_expense_report': ExpenseReports.handleUpdateExpenseReport,
          'dolibarr_delete_expense_report': ExpenseReports.handleDeleteExpenseReport,
          'dolibarr_validate_expense_report': ExpenseReports.handleValidateExpenseReport,
          'dolibarr_approve_expense_report': ExpenseReports.handleApproveExpenseReport,
          'dolibarr_pay_expense_report': ExpenseReports.handlePayExpenseReport,
          'dolibarr_add_expense_report_line': ExpenseReports.handleAddExpenseReportLine,
          'dolibarr_delete_expense_report_line': ExpenseReports.handleDeleteExpenseReportLine,
          // Interventions
          'dolibarr_list_interventions': Interventions.handleListInterventions,
          'dolibarr_get_intervention': Interventions.handleGetIntervention,
          'dolibarr_create_intervention': Interventions.handleCreateIntervention,
          'dolibarr_update_intervention': Interventions.handleUpdateIntervention,
          'dolibarr_delete_intervention': Interventions.handleDeleteIntervention,
          'dolibarr_validate_intervention': Interventions.handleValidateIntervention,
          'dolibarr_close_intervention': Interventions.handleCloseIntervention,
          'dolibarr_add_intervention_line': Interventions.handleAddInterventionLine,
          'dolibarr_update_intervention_line': Interventions.handleUpdateInterventionLine,
          'dolibarr_delete_intervention_line': Interventions.handleDeleteInterventionLine,
          'dolibarr_get_intervention_document': Interventions.handleGetInterventionDocument,
          // Projects Advanced (Time, Leads)
          'dolibarr_list_time_entries': ProjectsAdvanced.handleListTimeEntries,
          'dolibarr_list_project_tasks': ProjectsAdvanced.handleListTasksForProject,
          'dolibarr_list_leads': ProjectsAdvanced.handleListLeads,
          'dolibarr_get_lead': ProjectsAdvanced.handleGetLead,
          'dolibarr_create_lead': ProjectsAdvanced.handleCreateLead,
          'dolibarr_update_lead': ProjectsAdvanced.handleUpdateLead,
          // Advanced Features
          'dolibarr_list_payments': AdvancedFeatures.handleListPayments,
          'dolibarr_create_payment': AdvancedFeatures.handleCreatePayment,
          'dolibarr_validate_proposal': AdvancedFeatures.handleValidateProposal,
          'dolibarr_close_proposal': AdvancedFeatures.handleCloseProposal,
          'dolibarr_validate_order': AdvancedFeatures.handleValidateOrder,
          'dolibarr_close_order': AdvancedFeatures.handleCloseOrder,
          'dolibarr_ship_order': AdvancedFeatures.handleShipOrder,
          'dolibarr_assign_task': AdvancedFeatures.handleAssignTask,
          'dolibarr_list_members': AdvancedFeatures.handleListMembers,
          'dolibarr_create_member': AdvancedFeatures.handleCreateMember,
          'dolibarr_get_stats': AdvancedFeatures.handleGetStats,
          // Documents
          'dolibarr_download_document': Documents.handleDownloadDocument,
          'dolibarr_delete_document': Documents.handleDeleteDocument,
          'dolibarr_list_documents_for_object': Documents.handleListDocumentsForObject,
          'dolibarr_generate_pdf': Documents.handleGeneratePdf,
          'dolibarr_send_document_email': Documents.handleSendDocumentByEmail,
          // Permissions & Audit
          'dolibarr_list_user_groups': (args) => Permissions.handlePermissionsRequest('dolibarr_list_user_groups', args, dolibarrClient),
          'dolibarr_get_user_group': (args) => Permissions.handlePermissionsRequest('dolibarr_get_user_group', args, dolibarrClient),
          'dolibarr_create_user_group': (args) => Permissions.handlePermissionsRequest('dolibarr_create_user_group', args, dolibarrClient),
          'dolibarr_update_user_group': (args) => Permissions.handlePermissionsRequest('dolibarr_update_user_group', args, dolibarrClient),
          'dolibarr_delete_user_group': (args) => Permissions.handlePermissionsRequest('dolibarr_delete_user_group', args, dolibarrClient),
          'dolibarr_set_user_rights': (args) => Permissions.handlePermissionsRequest('dolibarr_set_user_rights', args, dolibarrClient),
          'dolibarr_get_audit_logs': (args) => Permissions.handlePermissionsRequest('dolibarr_get_audit_logs', args, dolibarrClient),
          // Multi-Entity & Currencies
          'dolibarr_list_entities': (args) => MultiEntity.handleMultiEntityRequest('dolibarr_list_entities', args, dolibarrClient),
          'dolibarr_get_entity': (args) => MultiEntity.handleMultiEntityRequest('dolibarr_get_entity', args, dolibarrClient),
          'dolibarr_create_entity': (args) => MultiEntity.handleMultiEntityRequest('dolibarr_create_entity', args, dolibarrClient),
          'dolibarr_list_currencies': (args) => MultiEntity.handleMultiEntityRequest('dolibarr_list_currencies', args, dolibarrClient),
          'dolibarr_convert_currency': (args) => MultiEntity.handleMultiEntityRequest('dolibarr_convert_currency', args, dolibarrClient),
          // Calendar & Holidays
          'dolibarr_list_holidays': (args) => Calendar.handleCalendarRequest('dolibarr_list_holidays', args, dolibarrClient),
          'dolibarr_get_holiday': (args) => Calendar.handleCalendarRequest('dolibarr_get_holiday', args, dolibarrClient),
          'dolibarr_create_holiday': (args) => Calendar.handleCalendarRequest('dolibarr_create_holiday', args, dolibarrClient),
          'dolibarr_validate_holiday': (args) => Calendar.handleCalendarRequest('dolibarr_validate_holiday', args, dolibarrClient),
          'dolibarr_delete_holiday': (args) => Calendar.handleCalendarRequest('dolibarr_delete_holiday', args, dolibarrClient),
          'dolibarr_create_resource_booking': (args) => Calendar.handleCalendarRequest('dolibarr_create_resource_booking', args, dolibarrClient),
          'dolibarr_list_resource_bookings': (args) => Calendar.handleCalendarRequest('dolibarr_list_resource_bookings', args, dolibarrClient),
          // Subscriptions
          'dolibarr_list_subscriptions': (args) => Subscriptions.handleSubscriptionsRequest('dolibarr_list_subscriptions', args, dolibarrClient),
          'dolibarr_get_subscription': (args) => Subscriptions.handleSubscriptionsRequest('dolibarr_get_subscription', args, dolibarrClient),
          'dolibarr_create_subscription': (args) => Subscriptions.handleSubscriptionsRequest('dolibarr_create_subscription', args, dolibarrClient),
          'dolibarr_renew_subscription': (args) => Subscriptions.handleSubscriptionsRequest('dolibarr_renew_subscription', args, dolibarrClient),
          'dolibarr_cancel_subscription': (args) => Subscriptions.handleSubscriptionsRequest('dolibarr_cancel_subscription', args, dolibarrClient),
          // Analysis
          'dolibarr_get_sales_stats': Analysis.handleGetSalesStats,
          'dolibarr_get_top_customers': Analysis.handleGetTopCustomers,
          'dolibarr_get_global_status': Analysis.handleGetGlobalStatus,
          'dolibarr_get_sales_pipeline': Analysis.handleGetSalesPipeline,
          'dolibarr_get_top_products': Analysis.handleGetTopProducts,
          'dolibarr_get_customer_outstanding': Analysis.handleGetCustomerOutstanding,
          'dolibarr_get_inactive_customers': Analysis.handleGetInactiveCustomers,
          'dolibarr_get_invoices_aging': Analysis.handleGetInvoicesAging,
          'dolibarr_get_expense_stats': Analysis.handleGetExpenseStats,
          'dolibarr_get_project_profitability': Analysis.handleGetProjectProfitability,
          'dolibarr_get_user_workload': Analysis.handleGetUserWorkload,
          'dolibarr_get_overdue_tasks': Analysis.handleGetOverdueTasks,
          'dolibarr_get_low_stock_alerts': Analysis.handleGetLowStockAlerts,
          'dolibarr_get_stock_valuation': Analysis.handleGetStockValuation,
          'dolibarr_get_ticket_stats': Analysis.handleGetTicketStats,
          'dolibarr_get_supplier_spend': Analysis.handleGetSupplierSpend,
          'dolibarr_get_contract_expirations': Analysis.handleGetContractExpirations,
          'dolibarr_get_bank_balance': Analysis.handleGetBankBalance,
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

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: RESOURCES,
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const content = await handleReadResource(request.params.uri);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: content,
            },
          ],
        };
      } catch (error: any) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Erreur lors de la lecture de la ressource: ${error.message}`
        );
      }
    });
  }

  private setupPromptHandlers() {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: PROMPTS,
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        const prompt = handleGetPrompt(request.params.name, request.params.arguments);
        return prompt;
      } catch (error: any) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Erreur lors de la récupération du prompt: ${error.message}`
        );
      }
    });
  }

  async run() {
    if (process.env.PORT) {
      // Mode HTTP/SSE
      const app = express();
      const port = parseInt(process.env.PORT);
      let transport: SSEServerTransport | null = null;

      app.get('/sse', async (req, res) => {
        console.error('Nouvelle connexion SSE entrante');
        transport = new SSEServerTransport('/messages', res);
        await this.server.connect(transport);
      });

      app.post('/messages', async (req, res) => {
        if (transport) {
          await transport.handlePostMessage(req, res);
        } else {
          res.status(400).send('No active transport');
        }
      });

      app.listen(port, () => {
        console.error(`Serveur MCP Dolibarr démarré sur le port ${port} (Mode SSE)`);
        console.error(`URL pour Claude: http://localhost:${port}/sse`);
      });
    } else {
      // Mode STDIO
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('Serveur MCP Dolibarr démarré en mode STDIO');
    }
  }
}

const server = new DolibarrMcpServer();
server.run().catch(console.error);
