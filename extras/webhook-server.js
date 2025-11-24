#!/usr/bin/env node

/**
 * Dolibarr Webhook Server
 * Serveur HTTP pour recevoir les webhooks de Dolibarr V22+
 * 
 * @author Dolibarr Community
 * @license MIT
 */

import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Middleware pour parser le JSON
app.use(express.json());

/**
 * Vérifie la signature du webhook
 */
function verifyWebhookSignature(payload, signature) {
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️  WEBHOOK_SECRET non défini - validation de signature désactivée');
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Gestionnaires d'événements par type
 */
const eventHandlers = {
  // ========== TIERS ==========
  'THIRDPARTY_CREATE': (data) => {
    console.log(`📝 Nouveau tiers créé: ${data.name} (ID: ${data.id})`);
    // Ici vous pouvez ajouter votre logique métier
    // Exemple: envoyer une notification, mettre à jour un cache, etc.
  },

  'THIRDPARTY_MODIFY': (data) => {
    console.log(`✏️  Tiers modifié: ${data.name} (ID: ${data.id})`);
  },

  'THIRDPARTY_DELETE': (data) => {
    console.log(`🗑️  Tiers supprimé: ID ${data.id}`);
  },

  // ========== FACTURES ==========
  'INVOICE_CREATE': (data) => {
    console.log(`💰 Nouvelle facture: ${data.ref} - ${data.total_ttc}€ TTC`);
  },

  'INVOICE_MODIFY': (data) => {
    console.log(`✏️  Facture modifiée: ${data.ref}`);
  },

  'INVOICE_VALIDATE': (data) => {
    console.log(`✅ Facture validée: ${data.ref}`);
    // Exemple: envoyer la facture par email automatiquement
  },

  'INVOICE_SENTBYMAIL': (data) => {
    console.log(`📧 Facture envoyée: ${data.ref}`);
  },

  'INVOICE_PAYED': (data) => {
    console.log(`💳 Facture payée: ${data.ref} - ${data.total_ttc}€`);
    // Exemple: déclencher un processus de livraison
  },

  'INVOICE_DELETE': (data) => {
    console.log(`🗑️  Facture supprimée: ${data.ref}`);
  },

  // ========== PROPOSITIONS ==========
  'PROPOSAL_CREATE': (data) => {
    console.log(`📄 Nouvelle proposition: ${data.ref} - ${data.total_ht}€ HT`);
  },

  'PROPOSAL_MODIFY': (data) => {
    console.log(`✏️  Proposition modifiée: ${data.ref}`);
  },

  'PROPOSAL_VALIDATE': (data) => {
    console.log(`✅ Proposition validée: ${data.ref}`);
  },

  'PROPOSAL_SENTBYMAIL': (data) => {
    console.log(`📧 Proposition envoyée: ${data.ref}`);
  },

  'PROPOSAL_CLOSE_SIGNED': (data) => {
    console.log(`🎉 Proposition signée: ${data.ref}`);
    // Exemple: créer automatiquement une commande ou une facture
  },

  'PROPOSAL_CLOSE_REFUSED': (data) => {
    console.log(`❌ Proposition refusée: ${data.ref}`);
  },

  // ========== COMMANDES ==========
  'ORDER_CREATE': (data) => {
    console.log(`🛒 Nouvelle commande: ${data.ref} - ${data.total_ttc}€`);
  },

  'ORDER_MODIFY': (data) => {
    console.log(`✏️  Commande modifiée: ${data.ref}`);
  },

  'ORDER_VALIDATE': (data) => {
    console.log(`✅ Commande validée: ${data.ref}`);
  },

  'ORDER_SENTBYMAIL': (data) => {
    console.log(`📧 Commande envoyée: ${data.ref}`);
  },

  'ORDER_CLOSE': (data) => {
    console.log(`📦 Commande clôturée: ${data.ref}`);
  },

  // ========== PRODUITS ==========
  'PRODUCT_CREATE': (data) => {
    console.log(`🏷️  Nouveau produit: ${data.label} (Ref: ${data.ref})`);
  },

  'PRODUCT_MODIFY': (data) => {
    console.log(`✏️  Produit modifié: ${data.label}`);
  },

  'PRODUCT_DELETE': (data) => {
    console.log(`🗑️  Produit supprimé: ${data.ref}`);
  },

  // ========== PROJETS ==========
  'PROJECT_CREATE': (data) => {
    console.log(`📁 Nouveau projet: ${data.title}`);
  },

  'PROJECT_MODIFY': (data) => {
    console.log(`✏️  Projet modifié: ${data.title}`);
  },

  'PROJECT_DELETE': (data) => {
    console.log(`🗑️  Projet supprimé: ${data.title}`);
  },

  // ========== CONTACTS ==========
  'CONTACT_CREATE': (data) => {
    console.log(`👤 Nouveau contact: ${data.firstname} ${data.lastname}`);
  },

  'CONTACT_MODIFY': (data) => {
    console.log(`✏️  Contact modifié: ${data.firstname} ${data.lastname}`);
  },

  'CONTACT_DELETE': (data) => {
    console.log(`🗑️  Contact supprimé: ID ${data.id}`);
  },

  // Handler par défaut
  'DEFAULT': (data, eventType) => {
    console.log(`🔔 Événement reçu: ${eventType}`);
    console.log(`   Données:`, JSON.stringify(data, null, 2));
  }
};

/**
 * Endpoint principal pour recevoir les webhooks
 */
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-dolibarr-signature'];
  const eventType = req.body.event || req.body.action;
  const payload = req.body;

  console.log('\n' + '='.repeat(60));
  console.log(`🔔 Webhook reçu: ${eventType}`);
  console.log('='.repeat(60));

  // Vérification de la signature
  if (WEBHOOK_SECRET && !verifyWebhookSignature(payload, signature)) {
    console.error('❌ Signature invalide !');
    return res.status(401).json({ 
      error: 'Invalid signature',
      message: 'La signature du webhook ne correspond pas'
    });
  }

  try {
    // Récupération des données
    const data = payload.data || payload.object || {};
    
    // Log des informations de base
    console.log(`📅 Date: ${new Date(payload.timestamp || Date.now()).toLocaleString('fr-FR')}`);
    console.log(`🏢 Instance: ${payload.dolibarr_url || 'N/A'}`);
    console.log(`📋 Type d'objet: ${payload.object_type || 'N/A'}`);
    
    // Traitement de l'événement
    const handler = eventHandlers[eventType] || eventHandlers.DEFAULT;
    handler(data, eventType);

    // Réponse success
    res.status(200).json({ 
      success: true,
      message: 'Webhook traité avec succès',
      event: eventType,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Webhook traité avec succès');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
});

/**
 * Endpoint de santé (health check)
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'dolibarr-webhook-server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint pour tester les webhooks
 */
app.post('/webhook/test', (req, res) => {
  console.log('\n🧪 Test de webhook reçu');
  console.log('Données:', JSON.stringify(req.body, null, 2));
  
  res.json({ 
    success: true,
    message: 'Test webhook reçu',
    received: req.body 
  });
});

/**
 * Documentation des événements disponibles
 */
app.get('/webhook/events', (req, res) => {
  res.json({
    message: 'Liste des événements supportés',
    events: Object.keys(eventHandlers).filter(k => k !== 'DEFAULT'),
    documentation: 'https://github.com/votre-username/dolibarr-mcp-server/wiki/Webhooks'
  });
});

/**
 * Middleware de gestion d'erreurs
 */
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Server error',
    message: err.message 
  });
});

/**
 * Route 404
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} non trouvée`,
    availableEndpoints: [
      'POST /webhook',
      'GET /health',
      'POST /webhook/test',
      'GET /webhook/events'
    ]
  });
});

/**
 * Démarrage du serveur
 */
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Serveur Webhook Dolibarr démarré');
  console.log('='.repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔒 Secret configuré: ${WEBHOOK_SECRET ? 'Oui' : 'Non (⚠️  recommandé)'}`);
  console.log(`🌐 URL locale: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: curl -X POST http://localhost:${PORT}/webhook/test`);
  console.log('='.repeat(60));
  console.log('\n✨ En attente de webhooks...\n');
});

/**
 * Gestion de l'arrêt gracieux
 */
process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du serveur webhook...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur webhook (Ctrl+C)...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

export default app;
