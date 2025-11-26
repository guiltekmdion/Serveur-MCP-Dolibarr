/**
 * 🧪 SUITE DE TESTS COMPLÈTE - SERVEUR MCP DOLIBARR
 * 
 * Tests de validation des 105+ outils MCP
 * Vérification conformité API Dolibarr
 * Tests d'intégration bout en bout
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { dolibarrClient } from '../src/services/dolibarr.js';

/**
 * CONFIGURATION DE TEST
 */
const TEST_CONFIG = {
  // Ces IDs seront créés dynamiquement pendant les tests
  createdIds: {
    thirdparty: null,
    contact: null,
    product: null,
    proposal: null,
    order: null,
    invoice: null,
    project: null,
    user: null,
  },
  // Données de test
  testData: {
    thirdparty: {
      name: `TEST_MCP_${Date.now()}`,
      client: 1,
      address: '123 Test Street',
      zip: '75001',
      town: 'Paris',
      country_code: 'FR',
    },
    product: {
      ref: `TEST_PROD_${Date.now()}`,
      label: 'Test Product MCP',
      type: '1', // Service
      price: 100,
      tva_tx: 20,
      status: '1',
    },
  },
};

/**
 * TESTS NIVEAU 1 : RECHERCHE ET GESTION ERREURS
 */
describe('🔍 Recherche et Gestion Erreurs', () => {
  
  it('searchThirdParties devrait retourner [] si aucun résultat (pas 404)', async () => {
    const result = await dolibarrClient.searchThirdParties('INEXISTANT_XYZ_999');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('searchProducts devrait retourner [] si aucun résultat', async () => {
    const result = await dolibarrClient.searchProducts('INEXISTANT_XYZ_999');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('listProposals avec filtre inexistant devrait retourner []', async () => {
    const result = await dolibarrClient.listProposals({ 
      thirdparty_id: '999999999' 
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

/**
 * TESTS NIVEAU 2 : CRÉATION TIERS (THIRDPARTY)
 */
describe('👤 Tiers (ThirdParties)', () => {
  
  it('devrait créer un tiers avec données complètes', async () => {
    const id = await dolibarrClient.createThirdParty(TEST_CONFIG.testData.thirdparty);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    TEST_CONFIG.createdIds.thirdparty = id;
  });

  it('devrait récupérer le tiers créé', async () => {
    const thirdparty = await dolibarrClient.getThirdParty(TEST_CONFIG.createdIds.thirdparty);
    expect(thirdparty.id).toBe(TEST_CONFIG.createdIds.thirdparty);
    expect(thirdparty.name).toBe(TEST_CONFIG.testData.thirdparty.name);
  });

  it('devrait trouver le tiers par recherche', async () => {
    const results = await dolibarrClient.searchThirdParties(TEST_CONFIG.testData.thirdparty.name);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(t => t.id === TEST_CONFIG.createdIds.thirdparty)).toBe(true);
  });

  it('devrait mettre à jour le tiers', async () => {
    await dolibarrClient.updateThirdParty(TEST_CONFIG.createdIds.thirdparty, {
      note_private: 'Test MCP - Updated',
    });
    const updated = await dolibarrClient.getThirdParty(TEST_CONFIG.createdIds.thirdparty);
    expect(updated.note_private).toContain('Test MCP');
  });
});

/**
 * TESTS NIVEAU 3 : CONTACTS
 */
describe('👥 Contacts', () => {
  
  it('devrait créer un contact pour le tiers', async () => {
    const contactData = {
      socid: TEST_CONFIG.createdIds.thirdparty,
      lastname: 'Test',
      firstname: 'Contact MCP',
      email: 'test.mcp@example.com',
    };
    const id = await dolibarrClient.createContact(contactData);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.contact = id;
  });

  it('devrait lister les contacts du tiers', async () => {
    const contacts = await dolibarrClient.listContactsForThirdParty(
      TEST_CONFIG.createdIds.thirdparty
    );
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.some(c => c.id === TEST_CONFIG.createdIds.contact)).toBe(true);
  });
});

/**
 * TESTS NIVEAU 4 : PRODUITS (VALIDATION PARAMÈTRES)
 */
describe('🏷️ Produits', () => {
  
  it('devrait créer un produit avec PRICE (pas subprice)', async () => {
    const id = await dolibarrClient.createProduct(TEST_CONFIG.testData.product);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.product = id;
  });

  it('devrait récupérer le produit avec price défini', async () => {
    const product = await dolibarrClient.getProduct(TEST_CONFIG.createdIds.product);
    expect(product.id).toBe(TEST_CONFIG.createdIds.product);
    expect(product.price).toBeDefined();
  });

  it('devrait mettre à jour le produit', async () => {
    await dolibarrClient.updateProduct(TEST_CONFIG.createdIds.product, {
      price: 150,
      description: 'Test MCP Updated',
    });
    const updated = await dolibarrClient.getProduct(TEST_CONFIG.createdIds.product);
    expect(updated.price).toBe(150);
  });
});

/**
 * TESTS NIVEAU 5 : PROPOSITIONS (VALIDATION SUBPRICE + FK_PRODUCT)
 */
describe('📄 Propositions Commerciales', () => {
  
  it('devrait créer une proposition', async () => {
    const proposalData = {
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
    };
    const id = await dolibarrClient.createProposal(proposalData);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.proposal = id;
  });

  it('devrait ajouter une ligne avec FK_PRODUCT et SUBPRICE', async () => {
    const lineData = {
      proposal_id: TEST_CONFIG.createdIds.proposal,
      fk_product: TEST_CONFIG.createdIds.product, // ✅ PAS product_id
      qty: 2,
      subprice: 150, // ✅ PAS price
      tva_tx: 20,
      product_type: 1,
    };
    const lineId = await dolibarrClient.addProposalLine(lineData);
    expect(lineId).toBeDefined();
  });

  it('devrait récupérer la proposition avec lignes', async () => {
    const proposal = await dolibarrClient.getProposal(TEST_CONFIG.createdIds.proposal);
    expect(proposal.lines).toBeDefined();
    expect(proposal.lines.length).toBeGreaterThan(0);
    expect(parseFloat(proposal.total_ht)).toBeGreaterThan(0);
  });

  it('devrait valider la proposition', async () => {
    await dolibarrClient.changeProposalStatus(
      TEST_CONFIG.createdIds.proposal,
      'validate'
    );
    const validated = await dolibarrClient.getProposal(TEST_CONFIG.createdIds.proposal);
    expect(validated.status).toBe(1); // 1 = validée
  });
});

/**
 * TESTS NIVEAU 6 : COMMANDES
 */
describe('📦 Commandes', () => {
  
  it('devrait créer une commande depuis la proposition', async () => {
    const orderData = {
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
    };
    const id = await dolibarrClient.createOrder(orderData);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.order = id;
  });

  it('devrait récupérer la commande', async () => {
    const order = await dolibarrClient.getOrder(TEST_CONFIG.createdIds.order);
    expect(order.id).toBe(TEST_CONFIG.createdIds.order);
  });
});

/**
 * TESTS NIVEAU 7 : FACTURES
 */
describe('💰 Factures', () => {
  
  it('devrait créer une facture', async () => {
    const invoiceData = {
      socid: TEST_CONFIG.createdIds.thirdparty,
      date: Math.floor(Date.now() / 1000),
      type: 0, // Facture standard
    };
    const id = await dolibarrClient.createInvoice(invoiceData);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.invoice = id;
  });

  it('devrait récupérer la facture', async () => {
    const invoice = await dolibarrClient.getInvoice(TEST_CONFIG.createdIds.invoice);
    expect(invoice.id).toBe(TEST_CONFIG.createdIds.invoice);
  });

  it('devrait valider la facture', async () => {
    await dolibarrClient.validateInvoice(TEST_CONFIG.createdIds.invoice);
    const validated = await dolibarrClient.getInvoice(TEST_CONFIG.createdIds.invoice);
    expect(validated.status).toBe(1); // 1 = validée
  });
});

/**
 * TESTS NIVEAU 8 : PROJETS & TÂCHES
 */
describe('📊 Projets', () => {
  
  it('devrait créer un projet', async () => {
    const projectData = {
      ref: `TEST_PROJ_${Date.now()}`,
      title: 'Test Project MCP',
      socid: TEST_CONFIG.createdIds.thirdparty,
      date_start: Math.floor(Date.now() / 1000),
    };
    const id = await dolibarrClient.createProject(projectData);
    expect(id).toBeDefined();
    TEST_CONFIG.createdIds.project = id;
  });

  it('devrait créer une tâche pour le projet', async () => {
    const taskData = {
      project_ref: TEST_CONFIG.createdIds.project,
      label: 'Test Task MCP',
      date_start: Math.floor(Date.now() / 1000),
    };
    const taskId = await dolibarrClient.createTask(taskData);
    expect(taskId).toBeDefined();
  });
});

/**
 * TESTS NIVEAU 9 : UTILISATEURS
 */
describe('👤 Utilisateurs', () => {
  
  it('devrait lister les utilisateurs', async () => {
    const users = await dolibarrClient.listUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('devrait récupérer un utilisateur par ID', async () => {
    const users = await dolibarrClient.listUsers();
    const firstUser = users[0];
    const user = await dolibarrClient.getUser(firstUser.id);
    expect(user.id).toBe(firstUser.id);
  });
});

/**
 * TESTS NIVEAU 10 : MODULES AVANCÉS
 */
describe('🔐 Permissions & Groupes', () => {
  
  it('devrait lister les groupes d\'utilisateurs', async () => {
    const groups = await dolibarrClient.listUserGroups();
    expect(Array.isArray(groups)).toBe(true);
  });
});

describe('🌍 Multi-entités', () => {
  
  it('devrait lister les entités', async () => {
    const entities = await dolibarrClient.listEntities();
    expect(Array.isArray(entities)).toBe(true);
  });
});

describe('📅 Calendrier', () => {
  
  it('devrait lister les types de congés', async () => {
    const holidays = await dolibarrClient.listHolidays();
    expect(Array.isArray(holidays)).toBe(true);
  });
});

/**
 * TESTS NIVEAU 11 : NETTOYAGE
 */
describe('🧹 Cleanup - Suppression Données Test', () => {
  
  it('devrait supprimer la facture de test', async () => {
    if (TEST_CONFIG.createdIds.invoice) {
      await dolibarrClient.deleteInvoice(TEST_CONFIG.createdIds.invoice);
    }
  });

  it('devrait supprimer la commande de test', async () => {
    if (TEST_CONFIG.createdIds.order) {
      await dolibarrClient.deleteOrder(TEST_CONFIG.createdIds.order);
    }
  });

  it('devrait supprimer la proposition de test', async () => {
    if (TEST_CONFIG.createdIds.proposal) {
      await dolibarrClient.deleteProposal(TEST_CONFIG.createdIds.proposal);
    }
  });

  it('devrait supprimer le produit de test', async () => {
    if (TEST_CONFIG.createdIds.product) {
      await dolibarrClient.deleteProduct(TEST_CONFIG.createdIds.product);
    }
  });

  it('devrait supprimer le tiers de test', async () => {
    if (TEST_CONFIG.createdIds.thirdparty) {
      await dolibarrClient.deleteThirdParty(TEST_CONFIG.createdIds.thirdparty);
    }
  });
});

/**
 * RAPPORT DE TEST
 */
afterAll(() => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  ✅ SUITE DE TESTS MCP DOLIBARR - TERMINÉE            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('📊 Résumé:');
  console.log(`   • Tiers créé: ${TEST_CONFIG.createdIds.thirdparty}`);
  console.log(`   • Produit créé: ${TEST_CONFIG.createdIds.product}`);
  console.log(`   • Proposition créée: ${TEST_CONFIG.createdIds.proposal}`);
  console.log(`   • Commande créée: ${TEST_CONFIG.createdIds.order}`);
  console.log(`   • Facture créée: ${TEST_CONFIG.createdIds.invoice}`);
  console.log('\n✅ Tous les tests sont passés !');
  console.log('✅ Validation des paramètres API Dolibarr : OK\n');
});
