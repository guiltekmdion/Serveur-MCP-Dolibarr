# Guide des Webhooks - Dolibarr MCP Server

Ce guide explique comment configurer les webhooks dans Dolibarr 22+ pour recevoir des notifications en temps réel.

## Table des matières

1. [Qu'est-ce qu'un webhook ?](#quest-ce-quun-webhook)
2. [Prérequis](#prérequis)
3. [Installation du serveur webhook](#installation-du-serveur-webhook)
4. [Configuration dans Dolibarr](#configuration-dans-dolibarr)
5. [Événements disponibles](#événements-disponibles)
6. [Personnalisation](#personnalisation)
7. [Tests et débogage](#tests-et-débogage)
8. [Production](#production)

---

## Qu'est-ce qu'un webhook ?

Un **webhook** est une méthode permettant à Dolibarr d'envoyer automatiquement des notifications HTTP lorsqu'un événement se produit (création de facture, nouveau client, paiement reçu, etc.).

### Avantages

- ✅ **Notifications en temps réel** : Réagir immédiatement aux événements
- ✅ **Automatisation** : Déclencher des actions automatiques
- ✅ **Intégration** : Connecter Dolibarr à d'autres systèmes
- ✅ **Monitoring** : Surveiller l'activité de votre ERP

### Cas d'usage

- Envoyer un email de bienvenue quand un nouveau client est créé
- Notifier votre équipe commerciale d'une nouvelle proposition signée
- Mettre à jour un système externe quand une facture est payée
- Synchroniser les données avec un autre logiciel
- Déclencher un processus de livraison automatique

---

## Prérequis

### Logiciels

- **Dolibarr 22.0.0+** avec le module Webhooks
- **Node.js 18+** (déjà installé si vous avez suivi INSTALL.md)
- **Serveur accessible** depuis internet (pour la production) ou en local (pour les tests)

### Réseau

Pour la production, vous aurez besoin de :
- Un **nom de domaine** ou une **IP publique**
- Un **port ouvert** (par défaut 3000)
- Optionnel : Un **reverse proxy** (nginx, Apache) pour HTTPS

---

## Installation du serveur webhook

### 1. Vérifier l'installation

Le serveur webhook est déjà inclus dans le projet :

```bash
cd dolibarr-mcp-server
ls webhook-server.js  # Doit exister
```

### 2. Configuration

Éditez le fichier `.env` :

```bash
nano .env
```

Ajoutez ou modifiez ces lignes :

```bash
# Port du serveur webhook
WEBHOOK_PORT=3000

# Secret partagé (IMPORTANT pour la sécurité)
WEBHOOK_SECRET=votre_secret_ici
```

### 3. Générer un secret sécurisé

**macOS/Linux** :

```bash
openssl rand -hex 32
```

**Windows (PowerShell)** :

```powershell
$random = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($random)
[System.BitConverter]::ToString($random).Replace("-","").ToLower()
```

**Ou simplement** :

Utilisez un générateur en ligne : [randomkeygen.com](https://randomkeygen.com/)

### 4. Démarrer le serveur

```bash
# Démarrage normal
npm run webhook

# Démarrage avec logs détaillés (développement)
npm run webhook:dev
```

Vous devriez voir :

```
============================================================
🚀 Serveur Webhook Dolibarr démarré
============================================================
📡 Port: 3000
🔒 Secret configuré: Oui
🌐 URL locale: http://localhost:3000
📋 Health check: http://localhost:3000/health
🧪 Test: curl -X POST http://localhost:3000/webhook/test
============================================================

✨ En attente de webhooks...
```

### 5. Test de santé

Dans un autre terminal :

```bash
curl http://localhost:3000/health
```

Résultat attendu :

```json
{
  "status": "ok",
  "service": "dolibarr-webhook-server",
  "uptime": 12.345,
  "timestamp": "2024-11-24T10:30:00.000Z"
}
```

---

## Configuration dans Dolibarr

### 1. Activer le module Webhooks

1. Connectez-vous à Dolibarr en tant qu'administrateur
2. Allez dans **Accueil → Configuration → Modules/Applications**
3. Cherchez "**Webhooks**" ou "**Triggers**"
4. Activez le module

### 2. Créer un webhook

1. Allez dans **Accueil → Configuration → Webhooks** (ou **Triggers**)
2. Cliquez sur "**Nouveau webhook**" ou "**Créer**"
3. Remplissez le formulaire :

#### Configuration du webhook

| Champ | Valeur |
|-------|--------|
| **Libellé** | Dolibarr MCP Server |
| **URL cible** | `http://votre-serveur:3000/webhook` |
| **Méthode** | POST |
| **Secret** | Le secret généré précédemment |
| **Actif** | ✅ Oui |

#### URL cible selon votre configuration

**Développement local** :
```
http://localhost:3000/webhook
```

**Production avec IP publique** :
```
http://123.45.67.89:3000/webhook
```

**Production avec domaine** :
```
https://votre-domaine.com/webhook
```

### 3. Sélectionner les événements

Cochez les événements qui vous intéressent. Exemples :

#### Tiers
- ☑️ THIRDPARTY_CREATE
- ☑️ THIRDPARTY_MODIFY
- ☑️ THIRDPARTY_DELETE

#### Factures
- ☑️ INVOICE_CREATE
- ☑️ INVOICE_VALIDATE
- ☑️ INVOICE_PAYED
- ☑️ INVOICE_SENTBYMAIL

#### Propositions
- ☑️ PROPOSAL_CREATE
- ☑️ PROPOSAL_VALIDATE
- ☑️ PROPOSAL_CLOSE_SIGNED
- ☑️ PROPOSAL_CLOSE_REFUSED

#### Commandes
- ☑️ ORDER_CREATE
- ☑️ ORDER_VALIDATE
- ☑️ ORDER_CLOSE

### 4. Sauvegarder

Cliquez sur "**Enregistrer**" ou "**Créer**"

---

## Événements disponibles

### Tiers (Thirdparties)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `THIRDPARTY_CREATE` | Nouveau tiers créé | Création d'un client/fournisseur |
| `THIRDPARTY_MODIFY` | Tiers modifié | Mise à jour des informations |
| `THIRDPARTY_DELETE` | Tiers supprimé | Suppression |

### Factures (Invoices)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `INVOICE_CREATE` | Nouvelle facture | Création d'une facture |
| `INVOICE_MODIFY` | Facture modifiée | Modification du contenu |
| `INVOICE_VALIDATE` | Facture validée | Passage de brouillon → validée |
| `INVOICE_SENTBYMAIL` | Facture envoyée | Email envoyé au client |
| `INVOICE_PAYED` | Facture payée | Paiement enregistré |
| `INVOICE_DELETE` | Facture supprimée | Suppression |

### Propositions commerciales (Proposals)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `PROPOSAL_CREATE` | Nouvelle proposition | Création d'un devis |
| `PROPOSAL_MODIFY` | Proposition modifiée | Modification |
| `PROPOSAL_VALIDATE` | Proposition validée | Validation |
| `PROPOSAL_SENTBYMAIL` | Proposition envoyée | Email envoyé |
| `PROPOSAL_CLOSE_SIGNED` | Proposition signée | Client accepte ✅ |
| `PROPOSAL_CLOSE_REFUSED` | Proposition refusée | Client refuse ❌ |

### Commandes (Orders)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `ORDER_CREATE` | Nouvelle commande | Création |
| `ORDER_MODIFY` | Commande modifiée | Modification |
| `ORDER_VALIDATE` | Commande validée | Validation |
| `ORDER_SENTBYMAIL` | Commande envoyée | Email envoyé |
| `ORDER_CLOSE` | Commande clôturée | Livraison terminée |

### Produits (Products)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `PRODUCT_CREATE` | Nouveau produit | Création |
| `PRODUCT_MODIFY` | Produit modifié | Modification |
| `PRODUCT_DELETE` | Produit supprimé | Suppression |

### Projets (Projects)

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `PROJECT_CREATE` | Nouveau projet | Création |
| `PROJECT_MODIFY` | Projet modifié | Modification |
| `PROJECT_DELETE` | Projet supprimé | Suppression |

### Contacts

| Événement | Description | Quand ? |
|-----------|-------------|---------|
| `CONTACT_CREATE` | Nouveau contact | Création |
| `CONTACT_MODIFY` | Contact modifié | Modification |
| `CONTACT_DELETE` | Contact supprimé | Suppression |

---

## Personnalisation

### Modifier les gestionnaires d'événements

Éditez le fichier `webhook-server.js` :

```javascript
// Trouvez la section eventHandlers
const eventHandlers = {
  'INVOICE_PAYED': (data) => {
    console.log(`💳 Facture payée: ${data.ref}`);
    
    // 🔧 VOTRE CODE ICI
    // Exemple: Envoyer un email
    sendEmail({
      to: 'comptabilite@entreprise.com',
      subject: `Paiement reçu - ${data.ref}`,
      body: `La facture ${data.ref} de ${data.total_ttc}€ a été payée.`
    });
    
    // Exemple: Mettre à jour un système externe
    updateExternalSystem({
      invoice_id: data.id,
      status: 'paid'
    });
  },
  
  'PROPOSAL_CLOSE_SIGNED': (data) => {
    console.log(`🎉 Proposition signée: ${data.ref}`);
    
    // 🔧 Créer automatiquement une facture
    createInvoiceFromProposal(data.id);
    
    // Notifier l'équipe commerciale
    notifySlack({
      channel: '#ventes',
      message: `🎉 ${data.ref} signée ! Montant: ${data.total_ht}€ HT`
    });
  }
};
```

### Ajouter de nouveaux événements

```javascript
// Ajoutez un nouveau gestionnaire
const eventHandlers = {
  // ... autres handlers ...
  
  'MON_EVENEMENT_CUSTOM': (data) => {
    console.log('Mon événement custom déclenché !');
    // Votre logique ici
  }
};
```

### Intégrations populaires

#### Envoyer un email avec Nodemailer

```bash
npm install nodemailer
```

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const eventHandlers = {
  'INVOICE_VALIDATE': async (data) => {
    await transporter.sendMail({
      from: 'erp@entreprise.com',
      to: data.client_email,
      subject: `Nouvelle facture ${data.ref}`,
      html: `<p>Votre facture ${data.ref} est disponible.</p>`
    });
  }
};
```

#### Notifier sur Slack

```bash
npm install @slack/webhook
```

```javascript
import { IncomingWebhook } from '@slack/webhook';

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

const eventHandlers = {
  'PROPOSAL_CLOSE_SIGNED': async (data) => {
    await webhook.send({
      text: `🎉 Proposition ${data.ref} signée pour ${data.total_ht}€ HT !`
    });
  }
};
```

---

## Tests et débogage

### 1. Test manuel avec curl

```bash
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "event": "INVOICE_CREATE",
    "data": {
      "id": 123,
      "ref": "FA2024-001",
      "total_ttc": 1200.00
    }
  }'
```

### 2. Test depuis Dolibarr

1. Dans Dolibarr, allez dans la configuration du webhook
2. Cliquez sur "**Tester**" ou créez un objet réel (facture, client, etc.)
3. Vérifiez les logs du serveur webhook

### 3. Logs détaillés

Démarrez le serveur en mode debug :

```bash
LOG_LEVEL=debug npm run webhook
```

### 4. Vérifier les événements reçus

Le serveur affiche chaque webhook reçu :

```
============================================================
🔔 Webhook reçu: INVOICE_CREATE
============================================================
📅 Date: 24/11/2024 10:30:15
🏢 Instance: https://demo.dolibarr.com
📋 Type d'objet: invoice
💰 Nouvelle facture: FA2024-001 - 1200.0€ TTC
✅ Webhook traité avec succès
============================================================
```

### 5. Endpoint de diagnostic

```bash
# Liste des événements supportés
curl http://localhost:3000/webhook/events

# Health check
curl http://localhost:3000/health
```

---

## Production

### 1. Utiliser HTTPS (recommandé)

#### Option A : Reverse proxy avec nginx

Installez nginx :

```bash
# Ubuntu/Debian
sudo apt install nginx

# macOS
brew install nginx

# CentOS
sudo yum install nginx
```

Configuration nginx (`/etc/nginx/sites-available/dolibarr-webhook`) :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/dolibarr-webhook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option B : Certificat Let's Encrypt

```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique (cron)
sudo certbot renew --dry-run
```

### 2. Démarrage automatique avec systemd

Créez un service systemd (`/etc/systemd/system/dolibarr-webhook.service`) :

```ini
[Unit]
Description=Dolibarr Webhook Server
After=network.target

[Service]
Type=simple
User=votre-user
WorkingDirectory=/chemin/vers/dolibarr-mcp-server
ExecStart=/usr/bin/node webhook-server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment=NODE_ENV=production
EnvironmentFile=/chemin/vers/dolibarr-mcp-server/.env

[Install]
WantedBy=multi-user.target
```

Activez et démarrez :

```bash
sudo systemctl daemon-reload
sudo systemctl enable dolibarr-webhook
sudo systemctl start dolibarr-webhook
sudo systemctl status dolibarr-webhook
```

### 3. Gestion des logs

Utilisez PM2 pour la gestion en production :

```bash
# Installer PM2
npm install -g pm2

# Démarrer le serveur
pm2 start webhook-server.js --name dolibarr-webhook

# Logs
pm2 logs dolibarr-webhook

# Monitoring
pm2 monit

# Redémarrage automatique au boot
pm2 startup
pm2 save
```

### 4. Sécurité

#### Filtrage IP

Si vous connaissez l'IP de votre Dolibarr, restreignez l'accès :

```javascript
// Dans webhook-server.js, ajoutez :
const ALLOWED_IPS = ['123.45.67.89'];

app.use('/webhook', (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!ALLOWED_IPS.includes(clientIP)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

#### Rate limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes max
});

app.use('/webhook', limiter);
```

---

## Résumé

1. ✅ Configurez le fichier `.env` avec un secret sécurisé
2. ✅ Démarrez le serveur webhook : `npm run webhook`
3. ✅ Activez le module Webhooks dans Dolibarr
4. ✅ Créez un webhook pointant vers votre serveur
5. ✅ Sélectionnez les événements désirés
6. ✅ Testez avec une action réelle dans Dolibarr
7. ✅ Personnalisez les handlers selon vos besoins
8. ✅ En production : utilisez HTTPS, systemd/PM2, et sécurisez l'accès

Besoin d'aide ?
- 📖 [Documentation complète](https://github.com/votre-username/dolibarr-mcp-server/wiki)
- 💬 [Forum Dolibarr](https://forums.dolibarr.org/)
- 🐛 [Signaler un bug](https://github.com/votre-username/dolibarr-mcp-server/issues)
