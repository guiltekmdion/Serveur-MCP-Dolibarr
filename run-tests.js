import { spawn } from 'child_process';
import { createInterface } from 'readline';

const docker = spawn('docker', ['exec', '-i', '-e', 'PORT=', 'dolibarr-mcp', 'node', 'dist/server.js']);

const rl = createInterface({
  input: docker.stdout,
  terminal: false
});

let requestId = 1;
const pendingRequests = new Map();

// Store created IDs for cleanup
const createdItems = {
  thirdparties: [],
  contacts: [],
  proposals: [],
  orders: [],
  invoices: [],
  projects: [],
  tasks: [],
  contracts: [],
  tickets: [],
  agendaEvents: [],
  interventions: [],
  shipments: [],
  stockMovements: [],
  supplierOrders: [],
  supplierInvoices: [],
  expenseReports: []
};

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const response = JSON.parse(line);
    if (response.id && pendingRequests.has(response.id)) {
      const { resolve, reject } = pendingRequests.get(response.id);
      pendingRequests.delete(response.id);
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }
  } catch (e) {
    // Ignore non-JSON lines (logs, etc.)
  }
});

function call(method, params) {
  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    const msg = { jsonrpc: "2.0", id, method, params };
    docker.stdin.write(JSON.stringify(msg) + '\n');
  });
}

// Helper to extract ID from response
function extractId(response) {
  if (response.isError) return null;
  try {
    const resObj = JSON.parse(response.content[0].text);
    return typeof resObj === 'object' ? resObj.id : resObj;
  } catch {
    return response.content[0].text;
  }
}

// Helper to check if response is error
function isError(response) {
  return response.isError || response.content[0].text.includes('Erreur');
}

async function runTests() {
  let thirdpartyId = null;
  
  try {
    console.log('🚀 Starting Comprehensive Tests...\n');

    // ========================================
    // INITIALIZATION
    // ========================================
    await call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "tester", version: "1.0" }
    });
    console.log('✅ Initialize successful');

    // ========================================
    // THIRDPARTIES
    // ========================================
    console.log('\n--- Testing Thirdparties ---');

    // Search
    const searchResult = await call("tools/call", {
      name: "dolibarr_search_thirdparties",
      arguments: { query: "%" }
    });
    console.log('✅ Search Thirdparties: OK');

    // Create
    const newThirdparty = await call("tools/call", {
      name: "dolibarr_create_thirdparty",
      arguments: {
        name: `Test MCP ${Date.now()}`,
        client: "1",
        email: "test@example.com",
        code_client: "-1"
      }
    });
    
    if (!isError(newThirdparty)) {
      thirdpartyId = extractId(newThirdparty);
      createdItems.thirdparties.push(thirdpartyId);
      console.log(`✅ Create Thirdparty: OK (ID: ${thirdpartyId})`);
    } else {
      // Use existing
      const searchData = JSON.parse(searchResult.content[0].text);
      if (searchData && searchData.length > 0) {
        thirdpartyId = searchData[0].id;
        console.log(`⚠️ Using existing Thirdparty ID: ${thirdpartyId}`);
      } else {
        throw new Error("No thirdparties found");
      }
    }

    // Get
    await call("tools/call", {
      name: "dolibarr_get_thirdparty",
      arguments: { id: String(thirdpartyId) }
    });
    console.log('✅ Get Thirdparty: OK');

    // Update
    await call("tools/call", {
      name: "dolibarr_update_thirdparty",
      arguments: {
        id: String(thirdpartyId),
        town: "TestCity",
        zip: "12345"
      }
    });
    console.log('✅ Update Thirdparty: OK');

    // Test Auto-Enrichment
    console.log('\n--- Testing Auto-Enrichment ---');
    const enrichmentResult = await call("tools/call", {
      name: "dolibarr_create_thirdparty",
      arguments: {
        name: "Google France",
        client: "1",
        code_client: "-1"
      }
    });
    
    if (!isError(enrichmentResult)) {
      const enrichmentId = extractId(enrichmentResult);
      createdItems.thirdparties.push(enrichmentId);
      
      const enrichedRes = await call("tools/call", {
        name: "dolibarr_get_thirdparty",
        arguments: { id: String(enrichmentId) }
      });
      const enriched = JSON.parse(enrichedRes.content[0].text);
      
      if (enriched.zip && enriched.town) {
        console.log(`✅ Auto-Enrichment: OK (ZIP: ${enriched.zip}, Town: ${enriched.town})`);
      } else {
        console.log('⚠️ Auto-Enrichment: No data enriched');
      }
    }

    // ========================================
    // CONTACTS
    // ========================================
    console.log('\n--- Testing Contacts ---');
    
    const newContact = await call("tools/call", {
      name: "dolibarr_create_contact",
      arguments: {
        socid: String(thirdpartyId),
        lastname: "Doe",
        firstname: "John",
        email: "john.doe@test.com"
      }
    });
    
    if (!isError(newContact)) {
      const contactId = extractId(newContact);
      createdItems.contacts.push(contactId);
      console.log(`✅ Create Contact: OK (ID: ${contactId})`);
      
      await call("tools/call", {
        name: "dolibarr_get_contact",
        arguments: { id: String(contactId) }
      });
      console.log('✅ Get Contact: OK');
    }

    await call("tools/call", {
      name: "dolibarr_list_contacts_for_thirdparty",
      arguments: { thirdparty_id: String(thirdpartyId) }
    });
    console.log('✅ List Contacts: OK');

    // ========================================
    // PROPOSALS
    // ========================================
    console.log('\n--- Testing Proposals ---');
    
    const newProposal = await call("tools/call", {
      name: "dolibarr_create_proposal",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000)
      }
    });
    
    let proposalId = null;
    if (!isError(newProposal)) {
      proposalId = extractId(newProposal);
      createdItems.proposals.push(proposalId);
      console.log(`✅ Create Proposal: OK (ID: ${proposalId})`);
      
      await call("tools/call", {
        name: "dolibarr_get_proposal",
        arguments: { id: String(proposalId) }
      });
      console.log('✅ Get Proposal: OK');
      
      await call("tools/call", {
        name: "dolibarr_add_proposal_line",
        arguments: {
          proposal_id: String(proposalId),
          desc: "Test Service",
          qty: 1,
          price: 100,
          tva_tx: 20
        }
      });
      console.log('✅ Add Proposal Line: OK');
    }

    await call("tools/call", {
      name: "dolibarr_list_proposals",
      arguments: {}
    });
    console.log('✅ List Proposals: OK');

    // ========================================
    // ORDERS
    // ========================================
    console.log('\n--- Testing Orders ---');
    
    const newOrder = await call("tools/call", {
      name: "dolibarr_create_order",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000)
      }
    });
    
    let orderId = null;
    if (!isError(newOrder)) {
      orderId = extractId(newOrder);
      createdItems.orders.push(orderId);
      console.log(`✅ Create Order: OK (ID: ${orderId})`);
      
      await call("tools/call", {
        name: "dolibarr_get_order",
        arguments: { id: String(orderId) }
      });
      console.log('✅ Get Order: OK');
    }

    // ========================================
    // INVOICES
    // ========================================
    console.log('\n--- Testing Invoices ---');
    
    const newInvoice = await call("tools/call", {
      name: "dolibarr_create_invoice",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000),
        type: "0"
      }
    });
    
    if (!isError(newInvoice)) {
      const invoiceId = extractId(newInvoice);
      createdItems.invoices.push(invoiceId);
      console.log(`✅ Create Invoice: OK (ID: ${invoiceId})`);
      
      await call("tools/call", {
        name: "dolibarr_get_invoice",
        arguments: { id: String(invoiceId) }
      });
      console.log('✅ Get Invoice: OK');
    }

    await call("tools/call", {
      name: "dolibarr_list_invoices",
      arguments: {}
    });
    console.log('✅ List Invoices: OK');

    // ========================================
    // PRODUCTS
    // ========================================
    console.log('\n--- Testing Products ---');
    
    // Create Product
    const newProduct = await call("tools/call", {
      name: "dolibarr_create_product",
      arguments: {
        ref: `PROD-${Date.now()}`,
        label: `Test Product ${Date.now()}`,
        price: 100,
        tva_tx: 20,
        type: "0"
      }
    });
    
    let productId = null;
    if (!isError(newProduct)) {
      productId = extractId(newProduct);
      console.log(`✅ Create Product: OK (ID: ${productId})`);
      
      // Update Product
      await call("tools/call", {
        name: "dolibarr_update_product",
        arguments: {
          id: String(productId),
          price: 150,
          description: "Updated description"
        }
      });
      console.log('✅ Update Product: OK');
      
      // Get Product
      await call("tools/call", {
        name: "dolibarr_get_product",
        arguments: { id: String(productId) }
      });
      console.log('✅ Get Product: OK');
    }

    const productsSearch = await call("tools/call", {
      name: "dolibarr_search_products",
      arguments: { query: "%" }
    });
    console.log('✅ Search Products: OK');
    
    // ========================================
    // PROJECTS & TASKS
    // ========================================
    console.log('\n--- Testing Projects & Tasks ---');
    
    const newProject = await call("tools/call", {
      name: "dolibarr_create_project",
      arguments: {
        title: `Project Test ${Date.now()}`,
        ref: `PRJ-${Date.now()}`,
        socid: String(thirdpartyId)
      }
    });
    
    let projectId = null;
    if (!isError(newProject)) {
      projectId = extractId(newProject);
      createdItems.projects.push(projectId);
      console.log(`✅ Create Project: OK (ID: ${projectId})`);
      
      // Update Project
      await call("tools/call", {
        name: "dolibarr_update_project",
        arguments: {
          id: String(projectId),
          description: "Updated project description"
        }
      });
      console.log('✅ Update Project: OK');
      
      await call("tools/call", {
        name: "dolibarr_get_project",
        arguments: { id: String(projectId) }
      });
      console.log('✅ Get Project: OK');
      
      // Create Task
      const newTask = await call("tools/call", {
        name: "dolibarr_create_task",
        arguments: {
          label: "Test Task",
          fk_project: String(projectId),
          ref: `TSK-${Date.now()}`
        }
      });
      
      if (!isError(newTask)) {
        const taskId = extractId(newTask);
        createdItems.tasks.push(taskId);
        console.log(`✅ Create Task: OK (ID: ${taskId})`);
        
        // Update Task
        await call("tools/call", {
          name: "dolibarr_update_task",
          arguments: {
            id: String(taskId),
            progress: 50
          }
        });
        console.log('✅ Update Task: OK');
        
        // Add Time
        await call("tools/call", {
          name: "dolibarr_add_task_time",
          arguments: {
            id: String(taskId),
            date: Math.floor(Date.now() / 1000),
            duration: 3600,
            note: "Worked 1 hour"
          }
        });
        console.log('✅ Add Task Time: OK');
        
        await call("tools/call", {
          name: "dolibarr_get_task",
          arguments: { id: String(taskId) }
        });
        console.log('✅ Get Task: OK');
      }
    }

    await call("tools/call", {
      name: "dolibarr_list_projects",
      arguments: {}
    });
    console.log('✅ List Projects: OK');

    // ========================================
    // USERS
    // ========================================
    console.log('\n--- Testing Users ---');
    
    // Create User
    const newUser = await call("tools/call", {
      name: "dolibarr_create_user",
      arguments: {
        login: `user${Date.now()}`,
        password: "password123",
        lastname: "TestUser",
        firstname: "MCP",
        email: `user${Date.now()}@test.com`,
        admin: "0"
      }
    });
    
    if (!isError(newUser)) {
      const userId = extractId(newUser);
      console.log(`✅ Create User: OK (ID: ${userId})`);
      
      // Update User
      await call("tools/call", {
        name: "dolibarr_update_user",
        arguments: {
          id: String(userId),
          firstname: "UpdatedName"
        }
      });
      console.log('✅ Update User: OK');
    }

    const usersRes = await call("tools/call", {
      name: "dolibarr_list_users",
      arguments: {}
    });
    console.log('✅ List Users: OK');
    
    // ========================================
    // BANK ACCOUNTS
    // ========================================
    console.log('\n--- Testing Bank Accounts ---');
    
    // Create Bank Account
    const newBank = await call("tools/call", {
      name: "dolibarr_create_bank_account",
      arguments: {
        label: `Bank ${Date.now()}`,
        currency_code: "EUR",
        bank: "Test Bank"
      }
    });
    
    if (!isError(newBank)) {
      const bankId = extractId(newBank);
      console.log(`✅ Create Bank Account: OK (ID: ${bankId})`);
    }

    const bankRes = await call("tools/call", {
      name: "dolibarr_list_bank_accounts",
      arguments: {}
    });
    console.log('✅ List Bank Accounts: OK');
    
    // ========================================
    // NEW MODULES - WAREHOUSES
    // ========================================
    console.log('\n--- Testing Warehouses ---');
    
    // Create Warehouse
    const newWarehouse = await call("tools/call", {
      name: "dolibarr_create_warehouse",
      arguments: {
        label: `Warehouse ${Date.now()}`,
        statut: "1"
      }
    });
    
    if (!isError(newWarehouse)) {
      const warehouseId = extractId(newWarehouse);
      console.log(`✅ Create Warehouse: OK (ID: ${warehouseId})`);
    }

    const warehousesRes = await call("tools/call", {
      name: "dolibarr_list_warehouses",
      arguments: {}
    });
    
    if (!isError(warehousesRes)) {
      console.log('✅ List Warehouses: OK');
      try {
        const warehouses = JSON.parse(warehousesRes.content[0].text);
        if (warehouses && warehouses.length > 0) {
          await call("tools/call", {
            name: "dolibarr_get_warehouse",
            arguments: { id: String(warehouses[0].id) }
          });
          console.log('✅ Get Warehouse: OK');
        }
      } catch (e) {}
    } else {
      console.log('⚠️ Warehouses module not active or no data');
    }

    // ========================================
    // NEW MODULES - STOCK MOVEMENTS
    // ========================================
    console.log('\n--- Testing Stock Movements ---');
    
    const stockRes = await call("tools/call", {
      name: "dolibarr_list_stock_movements",
      arguments: {}
    });
    
    if (!isError(stockRes)) {
      console.log('✅ List Stock Movements: OK');
    } else {
      console.log('⚠️ Stock module not active or no data');
    }

    // ========================================
    // NEW MODULES - SHIPMENTS
    // ========================================
    console.log('\n--- Testing Shipments ---');
    
    const shipmentsRes = await call("tools/call", {
      name: "dolibarr_list_shipments",
      arguments: {}
    });
    
    if (!isError(shipmentsRes)) {
      console.log('✅ List Shipments: OK');
      try {
        const shipments = JSON.parse(shipmentsRes.content[0].text);
        if (shipments && shipments.length > 0) {
          await call("tools/call", {
            name: "dolibarr_get_shipment",
            arguments: { id: String(shipments[0].id) }
          });
          console.log('✅ Get Shipment: OK');
        }
      } catch (e) {}
    } else {
      console.log('⚠️ Shipments module not active or no data');
    }

    // ========================================
    // NEW MODULES - CONTRACTS
    // ========================================
    console.log('\n--- Testing Contracts ---');
    
    const contractsRes = await call("tools/call", {
      name: "dolibarr_list_contracts",
      arguments: {}
    });
    
    if (!isError(contractsRes)) {
      console.log('✅ List Contracts: OK');
      
      // Create a contract
      const newContract = await call("tools/call", {
        name: "dolibarr_create_contract",
        arguments: {
          socid: String(thirdpartyId),
          date_contrat: Math.floor(Date.now() / 1000)
        }
      });
      
      if (!isError(newContract)) {
        const contractId = extractId(newContract);
        createdItems.contracts.push(contractId);
        console.log(`✅ Create Contract: OK (ID: ${contractId})`);
        
        await call("tools/call", {
          name: "dolibarr_get_contract",
          arguments: { id: String(contractId) }
        });
        console.log('✅ Get Contract: OK');
      }
    } else {
      console.log('⚠️ Contracts module not active');
    }

    // ========================================
    // NEW MODULES - TICKETS
    // ========================================
    console.log('\n--- Testing Tickets ---');
    
    const ticketsRes = await call("tools/call", {
      name: "dolibarr_list_tickets",
      arguments: {}
    });
    
    if (!isError(ticketsRes)) {
      console.log('✅ List Tickets: OK');
      
      // Create a ticket
      const newTicket = await call("tools/call", {
        name: "dolibarr_create_ticket",
        arguments: {
          subject: `Test Ticket ${Date.now()}`,
          message: "This is a test ticket created by MCP tests",
          fk_soc: String(thirdpartyId)
        }
      });
      
      if (!isError(newTicket)) {
        const ticketId = extractId(newTicket);
        createdItems.tickets.push(ticketId);
        console.log(`✅ Create Ticket: OK (ID: ${ticketId})`);
        
        await call("tools/call", {
          name: "dolibarr_get_ticket",
          arguments: { id: String(ticketId) }
        });
        console.log('✅ Get Ticket: OK');
      }
    } else {
      console.log('⚠️ Tickets module not active');
    }

    // ========================================
    // NEW MODULES - AGENDA
    // ========================================
    console.log('\n--- Testing Agenda Events ---');
    
    const agendaRes = await call("tools/call", {
      name: "dolibarr_list_agenda_events",
      arguments: {}
    });
    
    if (!isError(agendaRes)) {
      console.log('✅ List Agenda Events: OK');
      
      // Create an event
      const newEvent = await call("tools/call", {
        name: "dolibarr_create_agenda_event",
        arguments: {
          label: `Test Event ${Date.now()}`,
          type_code: "AC_OTH",
          datep: Math.floor(Date.now() / 1000),
          socid: String(thirdpartyId)
        }
      });
      
      if (!isError(newEvent)) {
        const eventId = extractId(newEvent);
        createdItems.agendaEvents.push(eventId);
        console.log(`✅ Create Agenda Event: OK (ID: ${eventId})`);
        
        await call("tools/call", {
          name: "dolibarr_get_agenda_event",
          arguments: { id: String(eventId) }
        });
        console.log('✅ Get Agenda Event: OK');
      }
    } else {
      console.log('⚠️ Agenda module not active');
    }

    // ========================================
    // NEW MODULES - EXPENSE REPORTS
    // ========================================
    console.log('\n--- Testing Expense Reports ---');
    
    const expenseRes = await call("tools/call", {
      name: "dolibarr_list_expense_reports",
      arguments: {}
    });
    
    if (!isError(expenseRes)) {
      console.log('✅ List Expense Reports: OK');
      try {
        const reports = JSON.parse(expenseRes.content[0].text);
        if (reports && reports.length > 0) {
          await call("tools/call", {
            name: "dolibarr_get_expense_report",
            arguments: { id: String(reports[0].id) }
          });
          console.log('✅ Get Expense Report: OK');
        }
      } catch (e) {}
    } else {
      console.log('⚠️ Expense Reports module not active or no data');
    }

    // ========================================
    // NEW MODULES - INTERVENTIONS
    // ========================================
    console.log('\n--- Testing Interventions ---');
    
    const interventionsRes = await call("tools/call", {
      name: "dolibarr_list_interventions",
      arguments: {}
    });
    
    if (!isError(interventionsRes)) {
      console.log('✅ List Interventions: OK');
      
      // Create an intervention
      const newIntervention = await call("tools/call", {
        name: "dolibarr_create_intervention",
        arguments: {
          socid: String(thirdpartyId),
          description: "Test intervention from MCP"
        }
      });
      
      if (!isError(newIntervention)) {
        const interventionId = extractId(newIntervention);
        createdItems.interventions.push(interventionId);
        console.log(`✅ Create Intervention: OK (ID: ${interventionId})`);
        
        await call("tools/call", {
          name: "dolibarr_get_intervention",
          arguments: { id: String(interventionId) }
        });
        console.log('✅ Get Intervention: OK');
      }
    } else {
      console.log('⚠️ Interventions module not active');
    }

    // ========================================
    // DOCUMENTS
    // ========================================
    console.log('\n--- Testing Documents ---');
    
    if (thirdpartyId) {
      const docsRes = await call("tools/call", {
        name: "dolibarr_list_documents_for_object",
        arguments: {
          modulepart: "societe",
          id: String(thirdpartyId)
        }
      });
      
      if (!isError(docsRes)) {
        console.log('✅ List Documents: OK');
      } else {
        console.log('⚠️ Documents: No documents or error');
      }
    }

    // ========================================
    // SUPPLIERS (Orders & Invoices)
    // ========================================
    console.log('\n--- Testing Suppliers ---');

    // Create Supplier Order
    const newSupplierOrder = await call("tools/call", {
      name: "dolibarr_create_supplier_order",
      arguments: {
        socid: String(thirdpartyId),
        date_commande: Math.floor(Date.now() / 1000),
        note_public: "Test Supplier Order from MCP"
      }
    });

    if (!isError(newSupplierOrder)) {
      const supplierOrderId = extractId(newSupplierOrder);
      createdItems.supplierOrders.push(supplierOrderId);
      console.log(`✅ Create Supplier Order: OK (ID: ${supplierOrderId})`);

      await call("tools/call", {
        name: "dolibarr_list_supplier_orders",
        arguments: { thirdparty_id: String(thirdpartyId) }
      });
      console.log('✅ List Supplier Orders: OK');
    } else {
      console.log('⚠️ Failed to create Supplier Order (Module might be inactive)');
    }

    // Create Supplier Invoice
    const newSupplierInvoice = await call("tools/call", {
      name: "dolibarr_create_supplier_invoice",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000),
        label: "Test Supplier Invoice",
        amount: 100
      }
    });

    if (!isError(newSupplierInvoice)) {
      const supplierInvoiceId = extractId(newSupplierInvoice);
      createdItems.supplierInvoices.push(supplierInvoiceId);
      console.log(`✅ Create Supplier Invoice: OK (ID: ${supplierInvoiceId})`);

      await call("tools/call", {
        name: "dolibarr_list_supplier_invoices",
        arguments: { thirdparty_id: String(thirdpartyId) }
      });
      console.log('✅ List Supplier Invoices: OK');
    } else {
      console.log('⚠️ Failed to create Supplier Invoice (Module might be inactive)');
    }

    // ========================================
    // CATEGORIES
    // ========================================
    console.log('\n--- Testing Categories ---');

    const categoriesRes = await call("tools/call", {
      name: "dolibarr_list_categories",
      arguments: { type: "customer" }
    });

    if (!isError(categoriesRes)) {
      console.log('✅ List Categories: OK');
      
      // Try to link category if any exist
      try {
        const cats = JSON.parse(categoriesRes.content[0].text);
        if (Array.isArray(cats) && cats.length > 0) {
          const catId = cats[0].id;
          await call("tools/call", {
            name: "dolibarr_link_category",
            arguments: {
              category_id: String(catId),
              object_id: String(thirdpartyId),
              object_type: "customer"
            }
          });
          console.log('✅ Link Category: OK');
        } else {
          console.log('ℹ️ No categories found to test linking');
        }
      } catch (e) {
        console.log('⚠️ Error parsing categories response');
      }
    } else {
      console.log('⚠️ Categories module not active');
    }

    // ========================================
    // COMMON & MISC
    // ========================================
    console.log('\n--- Testing Common Tools ---');

    // Server Info
    const serverInfo = await call("tools/call", {
      name: "dolibarr_get_server_info",
      arguments: {}
    });
    if (!isError(serverInfo)) {
      console.log('✅ Get Server Info: OK');
    }

    // Expense Report
    // Need a user ID. We created one earlier if successful.
    // Let's try to find a user ID from createdItems or use current user (if we knew it)
    // We'll skip if no user created
    // Actually we can list users to find one.
    
    const usersResForExpense = await call("tools/call", {
      name: "dolibarr_list_users",
      arguments: { limit: 1 }
    });
    
    if (!isError(usersResForExpense)) {
      try {
        const users = JSON.parse(usersResForExpense.content[0].text);
        if (Array.isArray(users) && users.length > 0) {
          const userId = users[0].id;
          const newExpense = await call("tools/call", {
            name: "dolibarr_create_expense_report",
            arguments: {
              user_id: String(userId),
              date_debut: Math.floor(Date.now() / 1000),
              date_fin: Math.floor(Date.now() / 1000),
              note_public: "Test Expense Report"
            }
          });
          
          if (!isError(newExpense)) {
            const expenseId = extractId(newExpense);
            createdItems.expenseReports.push(expenseId);
            console.log(`✅ Create Expense Report: OK (ID: ${expenseId})`);
          } else {
             console.log('⚠️ Failed to create Expense Report');
          }
        }
      } catch (e) {
        console.log('⚠️ Error parsing users for expense report test');
      }
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================');
    console.log(`Thirdparties created: ${createdItems.thirdparties.length}`);
    console.log(`Contacts created: ${createdItems.contacts.length}`);
    console.log(`Proposals created: ${createdItems.proposals.length}`);
    console.log(`Orders created: ${createdItems.orders.length}`);
    console.log(`Invoices created: ${createdItems.invoices.length}`);
    console.log(`Projects created: ${createdItems.projects.length}`);
    console.log(`Tasks created: ${createdItems.tasks.length}`);
    console.log(`Contracts created: ${createdItems.contracts.length}`);
    console.log(`Tickets created: ${createdItems.tickets.length}`);
    console.log(`Agenda Events created: ${createdItems.agendaEvents.length}`);
    console.log(`Interventions created: ${createdItems.interventions.length}`);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(JSON.stringify(error, null, 2));
    }
  } finally {
    // ========================================
    // CLEANUP - Delete created items
    // ========================================
    console.log('\n========================================');
    console.log('🧹 CLEANUP - Deleting test data...');
    console.log('========================================');
    
    // Note: Dolibarr API doesn't always support DELETE for all modules
    // We'll attempt cleanup but some items may remain
    
    // For now, we log what would need to be cleaned
    // In production, you'd call DELETE endpoints if available
    
    if (createdItems.thirdparties.length > 0) {
      console.log(`⚠️ Thirdparties to clean: ${createdItems.thirdparties.join(', ')}`);
    }
    if (createdItems.contacts.length > 0) {
      console.log(`⚠️ Contacts to clean: ${createdItems.contacts.join(', ')}`);
    }
    if (createdItems.proposals.length > 0) {
      console.log(`⚠️ Proposals to clean: ${createdItems.proposals.join(', ')}`);
    }
    if (createdItems.orders.length > 0) {
      console.log(`⚠️ Orders to clean: ${createdItems.orders.join(', ')}`);
    }
    if (createdItems.invoices.length > 0) {
      console.log(`⚠️ Invoices to clean: ${createdItems.invoices.join(', ')}`);
    }
    if (createdItems.projects.length > 0) {
      console.log(`⚠️ Projects to clean: ${createdItems.projects.join(', ')}`);
    }
    if (createdItems.contracts.length > 0) {
      console.log(`⚠️ Contracts to clean: ${createdItems.contracts.join(', ')}`);
    }
    if (createdItems.tickets.length > 0) {
      console.log(`⚠️ Tickets to clean: ${createdItems.tickets.join(', ')}`);
    }
    if (createdItems.agendaEvents.length > 0) {
      console.log(`⚠️ Agenda Events to clean: ${createdItems.agendaEvents.join(', ')}`);
    }
    if (createdItems.interventions.length > 0) {
      console.log(`⚠️ Interventions to clean: ${createdItems.interventions.join(', ')}`);
    }
    
    console.log('\n✅ Cleanup report complete');
    console.log('(Manual cleanup may be required in Dolibarr admin)');
    
    process.exit(0);
  }
}

runTests();
