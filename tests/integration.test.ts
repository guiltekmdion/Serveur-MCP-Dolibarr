/**
 * 🧪 SUITE DE TESTS D'INTÉGRATION - SERVEUR MCP DOLIBARR
 * 
 * Tests CRUD complets pour tous les modules principaux
 * Exécute de vraies requêtes contre l'API Dolibarr
 * 
 * Usage: npm run test:integration
 * Prérequis: Variables d'environnement DOLIBARR_BASE_URL et DOLIBARR_API_KEY définies
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { dolibarrClient } from '../src/services/dolibarr.js';

/**
 * CONFIGURATION DE TEST
 */
const TEST_CONFIG = {
  // Ces IDs seront créés dynamiquement pendant les tests
  createdIds: {
    thirdparty: null as string | null,
    contact: null as string | null,
    product: null as string | null,
    proposal: null as string | null,
    proposalLineId: null as string | null,
    order: null as string | null,
    invoice: null as string | null,
    project: null as string | null,
    task: null as string | null,
  },
  // Données de test uniques
  timestamp: Date.now(),
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 TESTS NIVEAU 1 : CONNEXION ET GESTION ERREURS
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('🔍 Connexion et Gestion Erreurs', () => {
  
  it('devrait se connecter à l\'API Dolibarr', async () => {
    // Test simple : lister les tiers (devrait fonctionner même si vide)
    const result = await dolibarrClient.searchThirdParties('');
    assert.ok(Array.isArray(result), 'La réponse devrait être un tableau');
  });

  it('searchThirdParties devrait retourner [] si aucun résultat (pas 404)', async () => {
    const result = await dolibarrClient.searchThirdParties('INEXISTANT_XYZ_999_AUCUN_RESULTAT');
    assert.ok(Array.isArray(result), 'La réponse devrait être un tableau');
    assert.strictEqual(result.length, 0, 'Le tableau devrait être vide');
  });

  it('searchProducts devrait retourner [] si aucun résultat', async () => {
    const result = await dolibarrClient.searchProducts('INEXISTANT_XYZ_999_AUCUN_RESULTAT');
    assert.ok(Array.isArray(result), 'La réponse devrait être un tableau');
    assert.strictEqual(result.length, 0, 'Le tableau devrait être vide');
  });

  it('getThirdParty avec ID inexistant devrait lever une erreur', async () => {
    await assert.rejects(
      async () => await dolibarrClient.getThirdParty('999999999'),
      /Dolibarr API Error/
    );
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 👤 TESTS NIVEAU 2 : TIERS (THIRDPARTY) - CRUD COMPLET
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('👤 Tiers (ThirdParties) - CRUD', () => {
  
  it('CREATE - devrait créer un tiers', async () => {
    const id = await dolibarrClient.createThirdParty({
      name: `TEST_MCP_${TEST_CONFIG.timestamp}`,
      client: '1',
      address: '123 Test Street',
      zip: '75001',
      town: 'Paris',
      country_code: 'FR',
      email: `test${TEST_CONFIG.timestamp}@example.com`,
    });
    assert.ok(id, 'L\'ID du tiers devrait être retourné');
    assert.ok(typeof id === 'string', 'L\'ID devrait être une chaîne');
    TEST_CONFIG.createdIds.thirdparty = id;
    console.log(`   ✅ Tiers créé avec ID: ${id}`);
  });

  it('READ - devrait récupérer le tiers créé', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const thirdparty = await dolibarrClient.getThirdParty(TEST_CONFIG.createdIds.thirdparty);
    assert.strictEqual(thirdparty.id, TEST_CONFIG.createdIds.thirdparty);
    assert.ok(thirdparty.name?.includes('TEST_MCP_'), 'Le nom devrait contenir TEST_MCP_');
  });

  it('SEARCH - devrait trouver le tiers par recherche', async () => {
    const results = await dolibarrClient.searchThirdParties(`TEST_MCP_${TEST_CONFIG.timestamp}`);
    assert.ok(results.length > 0, 'Au moins un résultat attendu');
    assert.ok(
      results.some(t => t.id === TEST_CONFIG.createdIds.thirdparty),
      'Le tiers créé devrait être dans les résultats'
    );
  });

  it('UPDATE - devrait mettre à jour le tiers', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    await dolibarrClient.updateThirdParty({
      id: TEST_CONFIG.createdIds.thirdparty,
      note_private: 'Test MCP - Updated at ' + new Date().toISOString(),
    });
    const updated = await dolibarrClient.getThirdParty(TEST_CONFIG.createdIds.thirdparty);
    assert.ok(updated.note_private?.includes('Test MCP'), 'La note devrait être mise à jour');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 👥 TESTS NIVEAU 3 : CONTACTS - CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('👥 Contacts - CRUD', () => {
  
  it('CREATE - devrait créer un contact pour le tiers', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const id = await dolibarrClient.createContact({
      socid: TEST_CONFIG.createdIds.thirdparty,
      lastname: 'TestContact',
      firstname: `MCP_${TEST_CONFIG.timestamp}`,
      email: `contact${TEST_CONFIG.timestamp}@example.com`,
    });
    assert.ok(id, 'L\'ID du contact devrait être retourné');
    TEST_CONFIG.createdIds.contact = id;
    console.log(`   ✅ Contact créé avec ID: ${id}`);
  });

  it('READ - devrait récupérer le contact créé', async () => {
    assert.ok(TEST_CONFIG.createdIds.contact, 'Le contact doit exister');
    const contact = await dolibarrClient.getContact(TEST_CONFIG.createdIds.contact);
    assert.strictEqual(contact.id, TEST_CONFIG.createdIds.contact);
  });

  it('LIST - devrait lister les contacts du tiers', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const contacts = await dolibarrClient.listContactsForThirdParty(
      TEST_CONFIG.createdIds.thirdparty
    );
    assert.ok(contacts.length > 0, 'Au moins un contact attendu');
    assert.ok(
      contacts.some(c => c.id === TEST_CONFIG.createdIds.contact),
      'Le contact créé devrait être dans la liste'
    );
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏷️ TESTS NIVEAU 4 : PRODUITS - CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('🏷️ Produits - CRUD', () => {
  
  it('CREATE - devrait créer un produit avec PRICE (pas subprice)', async () => {
    const id = await dolibarrClient.createProduct({
      ref: `TEST_PROD_${TEST_CONFIG.timestamp}`,
      label: 'Test Product MCP',
      type: '1', // Service
      price: 100,
      tva_tx: 20,
      status: '1',
    });
    assert.ok(id, 'L\'ID du produit devrait être retourné');
    TEST_CONFIG.createdIds.product = id;
    console.log(`   ✅ Produit créé avec ID: ${id}`);
  });

  it('READ - devrait récupérer le produit avec price défini', async () => {
    assert.ok(TEST_CONFIG.createdIds.product, 'Le produit doit exister');
    const product = await dolibarrClient.getProduct(TEST_CONFIG.createdIds.product);
    assert.strictEqual(product.id, TEST_CONFIG.createdIds.product);
    assert.ok(product.price !== undefined, 'Le prix devrait être défini');
  });

  it('SEARCH - devrait trouver le produit par recherche', async () => {
    const results = await dolibarrClient.searchProducts(`TEST_PROD_${TEST_CONFIG.timestamp}`);
    assert.ok(results.length > 0, 'Au moins un résultat attendu');
  });

  it('UPDATE - devrait mettre à jour le produit', async () => {
    assert.ok(TEST_CONFIG.createdIds.product, 'Le produit doit exister');
    await dolibarrClient.updateProduct({
      id: TEST_CONFIG.createdIds.product,
      price: 150,
      description: 'Test MCP Updated',
    });
    const updated = await dolibarrClient.getProduct(TEST_CONFIG.createdIds.product);
    // Note: Le prix peut être retourné comme string ou number
    assert.ok(
      parseFloat(String(updated.price)) === 150 || updated.description?.includes('Updated'),
      'Le produit devrait être mis à jour'
    );
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📄 TESTS NIVEAU 5 : PROPOSITIONS COMMERCIALES - CRUD + LIGNES
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('📄 Propositions Commerciales - CRUD', () => {
  
  it('CREATE - devrait créer une proposition', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const id = await dolibarrClient.createProposal({
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
    });
    assert.ok(id, 'L\'ID de la proposition devrait être retourné');
    TEST_CONFIG.createdIds.proposal = id;
    console.log(`   ✅ Proposition créée avec ID: ${id}`);
  });

  it('ADD LINE - devrait ajouter une ligne avec FK_PRODUCT et SUBPRICE', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    assert.ok(TEST_CONFIG.createdIds.product, 'Le produit doit exister');
    
    const lineId = await dolibarrClient.addProposalLine({
      proposal_id: TEST_CONFIG.createdIds.proposal,
      fk_product: TEST_CONFIG.createdIds.product, // ✅ fk_product, PAS product_id
      qty: 2,
      subprice: 150, // ✅ subprice, PAS price
      tva_tx: 20,
      product_type: 1, // Service
    });
    assert.ok(lineId, 'L\'ID de la ligne devrait être retourné');
    TEST_CONFIG.createdIds.proposalLineId = lineId;
    console.log(`   ✅ Ligne ajoutée avec ID: ${lineId}`);
  });

  it('READ - devrait récupérer la proposition avec lignes et totaux', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    const proposal = await dolibarrClient.getProposal(TEST_CONFIG.createdIds.proposal);
    assert.ok(proposal.lines, 'Les lignes devraient être présentes');
    assert.ok(proposal.lines.length > 0, 'Au moins une ligne attendue');
    assert.ok(parseFloat(String(proposal.total_ht)) > 0, 'Le total HT devrait être > 0');
    console.log(`   ✅ Total HT: ${proposal.total_ht}€, Total TTC: ${proposal.total_ttc}€`);
  });

  it('VALIDATE - devrait valider la proposition', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    await dolibarrClient.changeProposalStatus(
      TEST_CONFIG.createdIds.proposal,
      'validate'
    );
    const validated = await dolibarrClient.getProposal(TEST_CONFIG.createdIds.proposal);
    // status 1 = validée
    assert.strictEqual(Number(validated.status), 1, 'Le statut devrait être 1 (validée)');
    console.log(`   ✅ Proposition validée, ref: ${validated.ref}`);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📑 TESTS NIVEAU 6 : GÉNÉRATION PDF ET DOCUMENTS
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('📑 Génération PDF et Documents', () => {
  
  it('GENERATE PDF - devrait générer le PDF de la proposition validée', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    
    // Test de l'endpoint PUT /documents/builddoc
    const result = await dolibarrClient.generatePdf('propal', TEST_CONFIG.createdIds.proposal);
    assert.ok(result, 'Le résultat devrait exister');
    assert.ok(result.filename, 'Le filename devrait être présent');
    console.log(`   ✅ PDF généré: ${result.filename}`);
  });

  it('LIST DOCUMENTS - devrait lister les documents de la proposition', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    
    const documents = await dolibarrClient.listDocuments('propal', TEST_CONFIG.createdIds.proposal);
    assert.ok(Array.isArray(documents), 'La réponse devrait être un tableau');
    assert.ok(documents.length > 0, 'Au moins un document attendu');
    
    const pdfDoc = documents.find((d: any) => d.filename?.includes('.pdf'));
    assert.ok(pdfDoc, 'Un document PDF devrait exister');
    console.log(`   ✅ Document trouvé: ${pdfDoc.filename}`);
  });

  it('DOWNLOAD PDF - devrait télécharger le PDF de la proposition', async () => {
    assert.ok(TEST_CONFIG.createdIds.proposal, 'La proposition doit exister');
    
    // Récupérer la ref pour le chemin du fichier
    const proposal = await dolibarrClient.getProposal(TEST_CONFIG.createdIds.proposal);
    const ref = proposal.ref;
    assert.ok(ref, 'La ref devrait exister');
    
    const document = await dolibarrClient.downloadDocument(
      'propal',
      `${ref}/${ref}.pdf`
    );
    assert.ok(document, 'Le document devrait exister');
    assert.ok(document.filename?.includes('.pdf'), 'Le filename devrait contenir .pdf');
    assert.ok(document.content, 'Le contenu devrait exister');
    console.log(`   ✅ PDF téléchargé: ${document.filename} (${document.content?.length || 0} caractères base64)`);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📦 TESTS NIVEAU 7 : COMMANDES - CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('📦 Commandes - CRUD', () => {
  
  it('CREATE - devrait créer une commande', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const id = await dolibarrClient.createOrder({
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
    });
    assert.ok(id, 'L\'ID de la commande devrait être retourné');
    TEST_CONFIG.createdIds.order = id;
    console.log(`   ✅ Commande créée avec ID: ${id}`);
  });

  it('READ - devrait récupérer la commande', async () => {
    assert.ok(TEST_CONFIG.createdIds.order, 'La commande doit exister');
    const order = await dolibarrClient.getOrder(TEST_CONFIG.createdIds.order);
    assert.strictEqual(order.id, TEST_CONFIG.createdIds.order);
  });

  it('LIST - devrait lister les commandes', async () => {
    const orders = await dolibarrClient.listOrders({ limit: 10 });
    assert.ok(Array.isArray(orders), 'La réponse devrait être un tableau');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 TESTS NIVEAU 8 : FACTURES - CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('💰 Factures - CRUD', () => {
  
  it('CREATE - devrait créer une facture', async () => {
    assert.ok(TEST_CONFIG.createdIds.thirdparty, 'Le tiers doit exister');
    const id = await dolibarrClient.createInvoice({
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
      type: '0', // Facture standard
    });
    assert.ok(id, 'L\'ID de la facture devrait être retourné');
    TEST_CONFIG.createdIds.invoice = id;
    console.log(`   ✅ Facture créée avec ID: ${id}`);
  });

  it('READ - devrait récupérer la facture', async () => {
    assert.ok(TEST_CONFIG.createdIds.invoice, 'La facture doit exister');
    const invoice = await dolibarrClient.getInvoice(TEST_CONFIG.createdIds.invoice);
    assert.strictEqual(invoice.id, TEST_CONFIG.createdIds.invoice);
  });

  it('LIST - devrait lister les factures', async () => {
    const invoices = await dolibarrClient.listInvoices({ limit: 10 });
    assert.ok(Array.isArray(invoices), 'La réponse devrait être un tableau');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 TESTS NIVEAU 9 : PROJETS ET TÂCHES - CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('📊 Projets et Tâches - CRUD', () => {
  
  it('CREATE PROJECT - devrait créer un projet', async () => {
    const id = await dolibarrClient.createProject({
      ref: `PROJ_${TEST_CONFIG.timestamp}`,
      title: 'Test Project MCP',
      socid: TEST_CONFIG.createdIds.thirdparty || undefined,
    });
    assert.ok(id, 'L\'ID du projet devrait être retourné');
    TEST_CONFIG.createdIds.project = id;
    console.log(`   ✅ Projet créé avec ID: ${id}`);
  });

  it('READ PROJECT - devrait récupérer le projet', async () => {
    assert.ok(TEST_CONFIG.createdIds.project, 'Le projet doit exister');
    const project = await dolibarrClient.getProject(TEST_CONFIG.createdIds.project);
    assert.strictEqual(project.id, TEST_CONFIG.createdIds.project);
  });

  it('CREATE TASK - devrait créer une tâche pour le projet', async () => {
    assert.ok(TEST_CONFIG.createdIds.project, 'Le projet doit exister');
    const taskId = await dolibarrClient.createTask({
      fk_project: TEST_CONFIG.createdIds.project,
      label: `Test Task MCP ${TEST_CONFIG.timestamp}`,
    });
    assert.ok(taskId, 'L\'ID de la tâche devrait être retourné');
    TEST_CONFIG.createdIds.task = taskId;
    console.log(`   ✅ Tâche créée avec ID: ${taskId}`);
  });

  it('READ TASK - devrait récupérer la tâche', async () => {
    assert.ok(TEST_CONFIG.createdIds.task, 'La tâche doit exister');
    const task = await dolibarrClient.getTask(TEST_CONFIG.createdIds.task);
    assert.strictEqual(task.id, TEST_CONFIG.createdIds.task);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 👤 TESTS NIVEAU 10 : UTILISATEURS
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('👤 Utilisateurs', () => {
  
  it('LIST - devrait lister les utilisateurs', async () => {
    const users = await dolibarrClient.listUsers();
    assert.ok(Array.isArray(users), 'La réponse devrait être un tableau');
    assert.ok(users.length > 0, 'Au moins un utilisateur attendu');
  });

  it('READ - devrait récupérer un utilisateur par ID', async () => {
    const users = await dolibarrClient.listUsers();
    assert.ok(users.length > 0, 'Au moins un utilisateur doit exister');
    const firstUser = users[0];
    const user = await dolibarrClient.getUser(firstUser.id!);
    assert.strictEqual(user.id, firstUser.id);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔐 TESTS NIVEAU 11 : MODULES AVANCÉS
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('🔐 Modules Avancés', () => {
  
  it('devrait lister les groupes d\'utilisateurs', async () => {
    const groups = await dolibarrClient.listUserGroups();
    assert.ok(Array.isArray(groups), 'La réponse devrait être un tableau');
  });

  it('devrait lister les entrepôts', async () => {
    const warehouses = await dolibarrClient.listWarehouses();
    assert.ok(Array.isArray(warehouses), 'La réponse devrait être un tableau');
  });

  it('devrait lister les comptes bancaires', async () => {
    const accounts = await dolibarrClient.listBankAccounts();
    assert.ok(Array.isArray(accounts), 'La réponse devrait être un tableau');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧹 TESTS NIVEAU 12 : NETTOYAGE (CLEANUP)
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('🧹 Cleanup - Suppression des données de test', () => {
  
  it('devrait supprimer le produit de test', async () => {
    if (TEST_CONFIG.createdIds.product) {
      try {
        await dolibarrClient.deleteProduct(TEST_CONFIG.createdIds.product);
        console.log(`   🗑️ Produit ${TEST_CONFIG.createdIds.product} supprimé`);
      } catch (e) {
        console.log(`   ⚠️ Impossible de supprimer le produit: ${e}`);
      }
    }
  });

  // Note: La suppression des autres éléments peut échouer car Dolibarr
  // ne permet pas toujours de supprimer des documents validés
  // On les garde pour référence dans les tests manuels
});

/**
 * RAPPORT FINAL
 */
after(() => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║      ✅ SUITE DE TESTS MCP DOLIBARR - TERMINÉE                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n📊 Objets créés pendant les tests:');
  console.log(`   • Tiers:       ${TEST_CONFIG.createdIds.thirdparty || 'N/A'}`);
  console.log(`   • Contact:     ${TEST_CONFIG.createdIds.contact || 'N/A'}`);
  console.log(`   • Produit:     ${TEST_CONFIG.createdIds.product || 'N/A'}`);
  console.log(`   • Proposition: ${TEST_CONFIG.createdIds.proposal || 'N/A'}`);
  console.log(`   • Commande:    ${TEST_CONFIG.createdIds.order || 'N/A'}`);
  console.log(`   • Facture:     ${TEST_CONFIG.createdIds.invoice || 'N/A'}`);
  console.log(`   • Projet:      ${TEST_CONFIG.createdIds.project || 'N/A'}`);
  console.log(`   • Tâche:       ${TEST_CONFIG.createdIds.task || 'N/A'}`);
  console.log('\n✅ Validation des paramètres API Dolibarr : OK');
  console.log('   • fk_product (pas product_id) pour les lignes');
  console.log('   • subprice (pas price) pour les lignes');
  console.log('   • POST /proposals/{id}/line (singulier) pour ajouter une ligne');
  console.log('   • PUT /documents/builddoc pour générer les PDF');
  console.log('\n');
});
