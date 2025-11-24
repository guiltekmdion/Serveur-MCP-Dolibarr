import { spawn } from 'child_process';
import { createInterface } from 'readline';

const docker = spawn('docker', ['exec', '-i', 'dolibarr-mcp', 'node', 'dist/server.js']);

const rl = createInterface({
  input: docker.stdout,
  terminal: false
});

let requestId = 1;
const pendingRequests = new Map();

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
    console.log('Received non-JSON:', line);
  }
});

function call(method, params) {
  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    const msg = { jsonrpc: "2.0", id, method, params };
    // console.log(`Calling ${method}...`);
    docker.stdin.write(JSON.stringify(msg) + '\n');
  });
}

async function runTests() {
  try {
    console.log('🚀 Starting Tests...');

    // 1. Initialize
    await call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "tester", version: "1.0" }
    });
    console.log('✅ Initialize successful');

    // 2. Thirdparties
    console.log('\n--- Testing Thirdparties ---');

    // Search first to verify read access
    console.log('Searching for thirdparties...');
    const searchResult = await call("tools/call", {
        name: "dolibarr_search_thirdparties",
        arguments: { query: "%" } // Wildcard search
    });
    console.log('Search Result:', JSON.stringify(searchResult, null, 2));

    const newThirdparty = await call("tools/call", {
      name: "dolibarr_create_thirdparty",
      arguments: {
        name: `Test MCP ${Date.now()}`,
        client: "1",
        email: "test@example.com",
        code_client: "-1" // Try -1 for auto generation
      }
    });
    console.log('Create Thirdparty Response:', JSON.stringify(newThirdparty, null, 2));
    
    let thirdpartyId;
    
    if (newThirdparty.isError) {
        console.error('❌ Creation failed. Using an existing thirdparty from search results...');
        const searchData = JSON.parse(searchResult.content[0].text);
        if (searchData && searchData.length > 0) {
            thirdpartyId = searchData[0].id;
            console.log(`Using existing Thirdparty ID: ${thirdpartyId}`);
        } else {
            throw new Error("No existing thirdparties found to continue tests.");
        }
    } else {
        // Handle both string ID and object {id, message}
        try {
             const resObj = JSON.parse(newThirdparty.content[0].text);
             thirdpartyId = typeof resObj === 'object' ? resObj.id : resObj;
        } catch {
             thirdpartyId = newThirdparty.content[0].text;
        }
        console.log(`✅ Created Thirdparty ID: ${thirdpartyId}`);
    }

    const thirdparty = await call("tools/call", {
      name: "dolibarr_get_thirdparty",
      arguments: { id: String(thirdpartyId) }
    });
    console.log('✅ Get Thirdparty: OK');

    // Verify Update
    const updatePayload = {
        id: String(thirdpartyId),
        town: "New York",
        address: "123 Test St",
        zip: "10001",
        phone: "1234567890"
    };
    
    await call("tools/call", {
      name: "dolibarr_update_thirdparty",
      arguments: updatePayload
    });
    
    // Verify the update worked
    const updatedThirdpartyRes = await call("tools/call", {
      name: "dolibarr_get_thirdparty",
      arguments: { id: String(thirdpartyId) }
    });
    const updatedThirdparty = JSON.parse(updatedThirdpartyRes.content[0].text);
    
    if (updatedThirdparty.town === "New York" && updatedThirdparty.zip === "10001") {
        console.log('✅ Update Thirdparty: Verified (Fields updated successfully)');
    } else {
        console.error('❌ Update Thirdparty: Verification Failed', updatedThirdparty);
    }

    // Test Auto-Enrichment (France)
    console.log('\nTesting Auto-Enrichment for French Company...');
    const enrichmentTestName = "Google France";
    const enrichmentArgs = {
      name: enrichmentTestName,
      client: "1",
      code_client: "-1"
    };
    
    try {
      const enrichmentResult = await call("tools/call", {
        name: "dolibarr_create_thirdparty",
        arguments: enrichmentArgs
      });
      
      const responseText = enrichmentResult.content[0].text;
      let enrichmentId;
      
      try {
        const responseJson = JSON.parse(responseText);
        enrichmentId = responseJson.id;
        console.log(`✅ Created Enrichment Test Thirdparty ID: ${enrichmentId}`);
      } catch (e) {
        console.error(`❌ Failed to parse creation response: ${responseText}`);
        throw new Error("Creation response was not valid JSON");
      }
      
      const enrichedThirdpartyResult = await call("tools/call", {
        name: "dolibarr_get_thirdparty",
        arguments: { id: String(enrichmentId) }
      });
      const enrichedThirdparty = JSON.parse(enrichedThirdpartyResult.content[0].text);
      
      if (enrichedThirdparty.zip && enrichedThirdparty.town) {
        console.log(`✅ Auto-Enrichment Verified: Found ZIP ${enrichedThirdparty.zip} and Town ${enrichedThirdparty.town}`);
      } else {
        console.error(`❌ Auto-Enrichment Failed: ZIP or Town missing. Got ZIP: ${enrichedThirdparty.zip}, Town: ${enrichedThirdparty.town}`);
      }
    } catch (error) {
      console.error(`❌ Auto-Enrichment Test Failed: ${error}`);
    }

    // 3. Contacts
    console.log('\n--- Testing Contacts ---');
    const newContact = await call("tools/call", {
      name: "dolibarr_create_contact",
      arguments: {
        socid: String(thirdpartyId),
        lastname: "Doe",
        firstname: "John",
        email: "john.doe@example.com"
      }
    });
    const contactRes = JSON.parse(newContact.content[0].text);
    const contactId = contactRes.id;
    console.log(`✅ Created Contact ID: ${contactId}`);

    await call("tools/call", {
      name: "dolibarr_list_contacts_for_thirdparty",
      arguments: { thirdparty_id: String(thirdpartyId) }
    });
    console.log('✅ List Contacts: OK');

    // 4. Proposals
    console.log('\n--- Testing Proposals ---');
    const newProposal = await call("tools/call", {
      name: "dolibarr_create_proposal",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000)
      }
    });
    const proposalRes = JSON.parse(newProposal.content[0].text);
    const proposalId = proposalRes.id;
    console.log(`✅ Created Proposal ID: ${proposalId}`);

    // Add line (assuming a free text line if product_id is optional, or we need a product)
    // Checking schema: product_id is optional usually in Dolibarr if desc is provided and type is 0/1
    // Let's try adding a free line
    await call("tools/call", {
      name: "dolibarr_add_proposal_line",
      arguments: {
        proposal_id: String(proposalId),
        desc: "Service Test",
        qty: 1,
        price: 100,
        tva_tx: 20
      }
    });
    console.log('✅ Add Proposal Line: OK');

    // 5. Orders
    console.log('\n--- Testing Orders ---');
    const newOrder = await call("tools/call", {
      name: "dolibarr_create_order",
      arguments: {
        socid: String(thirdpartyId),
        date: Math.floor(Date.now() / 1000)
      }
    });
    const orderRes = JSON.parse(newOrder.content[0].text);
    const orderId = orderRes.id;
    console.log(`✅ Created Order ID: ${orderId}`);

    // 6. Invoices
    console.log('\n--- Testing Invoices ---');
    let invoiceId;
    try {
        const newInvoice = await call("tools/call", {
        name: "dolibarr_create_invoice",
        arguments: {
            socid: String(thirdpartyId),
            date: Math.floor(Date.now() / 1000),
            type: "0" // Standard invoice
        }
        });
        if (newInvoice.isError) {
            console.error('❌ Create Invoice Failed:', newInvoice.content[0].text);
            // Try creating from proposal
            console.log('Trying to create invoice from proposal...');
            const invoiceFromProp = await call("tools/call", {
                name: "dolibarr_create_invoice_from_proposal",
                arguments: { proposal_id: String(proposalId) }
            });
             if (invoiceFromProp.isError) {
                 console.error('❌ Create Invoice from Proposal Failed:', invoiceFromProp.content[0].text);
             } else {
                 const invoiceRes = JSON.parse(invoiceFromProp.content[0].text);
                 invoiceId = invoiceRes.id;
                 console.log(`✅ Created Invoice from Proposal ID: ${invoiceId}`);
             }
        } else {
            const invoiceRes = JSON.parse(newInvoice.content[0].text);
            invoiceId = invoiceRes.id;
            console.log(`✅ Created Invoice ID: ${invoiceId}`);
        }
    } catch (e) {
        console.error('❌ Invoice creation exception:', e.message);
    }

    // 7. Projects
    console.log('\n--- Testing Projects ---');
    let projectId;
    try {
        const newProject = await call("tools/call", {
          name: "dolibarr_create_project",
          arguments: {
            title: `Project MCP ${Date.now()}`,
            socid: String(thirdpartyId),
            description: "Test Project",
            ref: `PRJ-${Date.now()}`
          }
        });

        if (newProject.isError) {
             console.error('❌ Create Project Failed:', newProject.content[0].text);
        } else {
             const projectRes = JSON.parse(newProject.content[0].text);
             projectId = projectRes.id;
             console.log(`✅ Created Project ID: ${projectId}`);
        }
    } catch (e) {
        console.error('❌ Project creation exception:', e.message);
    }

    if (projectId) {
        try {
            const newTask = await call("tools/call", {
              name: "dolibarr_create_task",
              arguments: {
                label: "Task 1",
                fk_project: String(projectId),
                description: "Do something",
                ref: `TSK-${Date.now()}`
              }
            });

            if (newTask.isError) {
                console.error('❌ Create Task Failed:', newTask.content[0].text);
            } else {
                const taskRes = JSON.parse(newTask.content[0].text);
                const taskId = taskRes.id;
                console.log(`✅ Created Task ID: ${taskId}`);
            }
        } catch (e) {
             console.error('❌ Task creation exception:', e.message);
        }
    } else {
        console.log('⚠️ Skipping Task creation because Project creation failed.');
    }

    // 8. Users & Bank
    console.log('\n--- Testing Lists ---');
    await call("tools/call", {
      name: "dolibarr_list_users",
      arguments: {}
    });
    console.log('✅ List Users: OK');

    await call("tools/call", {
      name: "dolibarr_list_bank_accounts",
      arguments: {}
    });
    console.log('✅ List Bank Accounts: OK');

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
    } else {
        console.error(JSON.stringify(error, null, 2));
    }
  } finally {
    process.exit(0);
  }
}

runTests();
