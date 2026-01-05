# Structure du Projet - Dolibarr MCP Server

Ce document décrit tous les fichiers du projet et leur rôle.

## 📁 Structure complète

```
dolibarr-mcp-server/
│
├── 📄 README.md                    # Documentation principale
├── 📄 package.json                 # Dépendances et scripts npm
├── 📄 tsconfig.json                # Configuration TypeScript
├── 📄 Dockerfile                   # Configuration Docker
├── 📄 docker-compose.yml           # Orchestration Docker
│
├── 📂 src/                         # Code source TypeScript
│   ├── 📄 server.ts                # Point d'entrée du serveur MCP
│   │
│   ├── 📂 services/                # Services métier
│   │   ├── 📄 dolibarr.ts          # Client API Dolibarr (Axios)
│   │   └── 📄 company-search.ts    # Service d'enrichissement (api.gouv.fr)
│   │
│   ├── 📂 tools/                   # Définitions des outils MCP
│   │   ├── 📄 thirdparties.ts      # Gestion des tiers
│   │   ├── 📄 contacts.ts          # Gestion des contacts
│   │   ├── 📄 proposals.ts         # Gestion des propositions
│   │   ├── 📄 orders-invoices...   # Commandes, Factures, Produits
│   │   └── 📄 advanced.ts          # Documents, Projets, Tâches...
│   │
│   ├── 📂 types/                   # Définitions de types
│   │   └── 📄 index.ts             # Interfaces et Schémas Zod
│   │
│   └── 📂 utils/                   # Utilitaires
│       ├── 📄 config.ts            # Gestion de la configuration (env)
│       └── 📄 logger.ts            # Système de logs
│
├── 📂 docs/                        # Documentation détaillée
│   ├── 📄 01-installation.md
│   ├── 📄 02-configuration.md
│   ├── 📄 03-tools.md
│   ├── 📄 04-docker.md
│   └── 📄 API_EXPLORATION.md
│
└── 📂 tests/                       # Tests d'intégration
    ├── 📄 dolibarr.test.ts
    └── 📄 mcp.test.ts
```

---

## 📚 Documentation

### README.md
**Rôle** : Documentation principale du projet  
**Contenu** :
- Vue d'ensemble du projet
- Liste complète des fonctionnalités
- Instructions d'installation
- API disponibles
- Exemples d'utilisation
- Architecture du système

**Quand le lire** : En premier, pour comprendre le projet

---

### INSTALL.md
**Rôle** : Guide d'installation pas à pas  
**Contenu** :
- Installation de Node.js selon l'OS
- Configuration de Dolibarr
- Installation du serveur MCP
- Configuration de Claude Desktop
- Tests et vérifications
- Dépannage détaillé

**Quand le lire** : Pour installer le projet de A à Z

---

### QUICKSTART.md
**Rôle** : Démarrage ultra-rapide (10 minutes)  
**Contenu** :
- Installation express
- Configuration minimale
- Tests rapides
- Dépannage courant

**Quand le lire** : Si vous voulez être opérationnel rapidement

---

### WEBHOOK.md
**Rôle** : Configuration des webhooks Dolibarr  
**Contenu** :
- Explication des webhooks
- Installation du serveur webhook
- Configuration dans Dolibarr V22+
- Liste complète des événements
- Personnalisation des handlers
- Déploiement en production

**Quand le lire** : Pour recevoir des notifications en temps réel

---

### CONTRIBUTING.md
**Rôle** : Guide pour contribuer au projet  
**Contenu** :
- Code de conduite
- Comment signaler un bug
- Comment proposer une fonctionnalité
- Standards de code
- Processus de Pull Request
- Structure des tests

**Quand le lire** : Si vous voulez contribuer au projet

---

### LICENSE
**Rôle** : Licence du projet (MIT)  
**Contenu** : Conditions d'utilisation et de distribution

**Quand le lire** : Pour connaître vos droits d'utilisation

---

### PROJECT_STRUCTURE.md
**Rôle** : Ce fichier - Description de la structure  
**Contenu** : Liste et description de tous les fichiers

**Quand le lire** : Pour comprendre l'organisation du projet

---

## 🔧 Configuration

### package.json
**Rôle** : Configuration du projet Node.js  
**Contenu** :
- Métadonnées du projet (nom, version, description)
- Dépendances npm
- Scripts de démarrage
- Configuration ESM

**Ne pas modifier** sauf pour ajouter des dépendances

---

### .env.example
**Rôle** : Template de configuration  
**Contenu** :
- Variables d'environnement nécessaires
- Explications pour chaque variable
- Valeurs par défaut

**Action** : Copier vers `.env` et remplir les valeurs

---

### .env
**Rôle** : Configuration personnelle (git-ignoré)  
**Contenu** :
- URL de votre Dolibarr
- Clé API
- Configuration webhook
- Paramètres avancés

**⚠️ IMPORTANT** : Ne JAMAIS committer ce fichier (contient des secrets)

**Exemple** :
```bash
DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
DOLIBARR_API_KEY=votre_cle_api
WEBHOOK_PORT=3000
WEBHOOK_SECRET=votre_secret
```

---

### .gitignore
**Rôle** : Fichiers à exclure de git  
**Contenu** :
- `.env` (secrets)
- `node_modules/` (dépendances)
- Logs et fichiers temporaires
- Fichiers système (`.DS_Store`, etc.)

**Ne pas modifier** sauf besoin spécifique

---

## 🚀 Code Source

### index.js
**Rôle** : ⭐ **Serveur MCP principal** - Point d'entrée  
**Taille** : ~700 lignes  
**Contenu** :

#### Classes principales

1. **DolibarrClient**
   - Gère la communication avec l'API REST Dolibarr
   - Configuration HTTP (axios)
   - Gestion des erreurs
   - Intercepteurs pour logs et authentification

2. **DolibarrToolHandler**
   - Définit tous les outils MCP disponibles
   - Schémas de validation des paramètres
   - Exécution des outils
   - Mapping vers l'API Dolibarr

#### Outils disponibles

**Tiers** :
- `list_thirdparties` - Liste les clients/fournisseurs
- `get_thirdparty` - Détails d'un tiers
- `create_thirdparty` - Créer un tiers
- `update_thirdparty` - Modifier un tiers

**Factures** :
- `list_invoices` - Liste les factures
- `get_invoice` - Détails d'une facture
- `create_invoice` - Créer une facture
- `validate_invoice` - Valider une facture

**Propositions** :
- `list_proposals` - Liste les devis
- `get_proposal` - Détails d'un devis
- `create_proposal` - Créer un devis
- `close_proposal` - Clôturer un devis

**Produits** :
- `list_products` - Liste les produits
- `get_product` - Détails d'un produit
- `search_products` - Rechercher des produits

**Commandes** :
- `list_orders` - Liste les commandes
- `get_order` - Détails d'une commande
- `create_order` - Créer une commande

#### Démarrage

```bash
npm start           # Démarrage normal
npm run dev         # Avec logs détaillés
node index.js       # Direct
```

#### Logs

Le serveur affiche :
- ✅ Connexion réussie/échec
- 📋 Outils demandés par Claude
- ⚙️ Exécution des outils
- ❌ Erreurs détaillées

---

### webhook-server.js
**Rôle** : Serveur HTTP pour recevoir les webhooks de Dolibarr  
**Taille** : ~400 lignes  
**Contenu** :

#### Serveur Express

- Port : 3000 (configurable)
- Endpoints :
  - `POST /webhook` - Réception des webhooks
  - `GET /health` - Vérification de santé
  - `POST /webhook/test` - Tests
  - `GET /webhook/events` - Liste des événements

#### Sécurité

- Validation de signature HMAC
- Vérification du secret partagé
- Rate limiting (optionnel)
- Filtrage IP (optionnel)

#### Gestionnaires d'événements

**Événements supportés** :
- Tiers : CREATE, MODIFY, DELETE
- Factures : CREATE, MODIFY, VALIDATE, PAYED, SENTBYMAIL
- Propositions : CREATE, MODIFY, VALIDATE, CLOSE_SIGNED, CLOSE_REFUSED
- Commandes : CREATE, MODIFY, VALIDATE, CLOSE
- Produits : CREATE, MODIFY, DELETE
- Projets : CREATE, MODIFY, DELETE
- Contacts : CREATE, MODIFY, DELETE

#### Personnalisation

Chaque événement peut déclencher :
- Envoi d'email
- Notification Slack
- Mise à jour système externe
- Déclenchement de workflow

#### Démarrage

```bash
npm run webhook        # Démarrage normal
npm run webhook:dev    # Avec logs détaillés
node webhook-server.js # Direct
```

---

## 🛠️ Utilitaires

### setup.sh
**Rôle** : Script d'installation automatique  
**Taille** : ~400 lignes  
**Compatibilité** : macOS, Linux  

**Fonctionnalités** :
1. ✅ Vérification de Node.js
2. 📦 Installation des dépendances npm
3. 🔧 Configuration interactive de `.env`
4. 🔐 Génération de secret webhook
5. 🧪 Test de connexion à Dolibarr
6. ⚙️ Configuration de Claude Desktop
7. 📋 Instructions finales

**Usage** :

```bash
# Rendre exécutable
chmod +x setup.sh

# Exécuter
bash setup.sh
# ou
./setup.sh
```

**Avantages** :
- Installation guidée
- Validation à chaque étape
- Génération automatique de secrets
- Configuration Claude Desktop automatique
- Messages colorés et clairs

---

## 📊 Statistiques du projet

| Métrique | Valeur |
|----------|--------|
| **Fichiers de code** | 2 (index.js, webhook-server.js) |
| **Fichiers de doc** | 6 (README, INSTALL, QUICKSTART, etc.) |
| **Lignes de code** | ~1200 |
| **Lignes de doc** | ~2500 |
| **Outils MCP** | 20+ |
| **Événements webhook** | 25+ |
| **Dépendances** | 4 principales |

---

## 🔄 Workflow typique

### Installation initiale

```
1. Cloner le repo
2. Exécuter setup.sh (ou installation manuelle)
3. Configurer .env
4. Tester npm start
5. Configurer Claude Desktop
6. Redémarrer Claude
7. Tester avec Claude
```

### Utilisation quotidienne

```
1. Claude Desktop se lance
2. MCP server démarre automatiquement
3. Vous conversez avec Claude
4. Claude utilise les outils MCP
5. MCP communique avec Dolibarr
6. Résultats retournés à Claude
```

### Avec webhooks

```
1. Démarrer webhook-server
2. Configurer dans Dolibarr
3. Événement se produit dans Dolibarr
4. Webhook envoyé au serveur
5. Handler personnalisé exécuté
6. Actions automatiques déclenchées
```

---

## 📦 Dépendances npm

### Production

| Package | Version | Rôle |
|---------|---------|------|
| `@modelcontextprotocol/sdk` | ^1.0.4 | SDK MCP officiel d'Anthropic |
| `axios` | ^1.7.9 | Client HTTP pour l'API Dolibarr |
| `dotenv` | ^16.4.7 | Gestion des variables d'environnement |
| `express` | ^4.21.2 | Serveur web pour webhooks |

### Développement

| Package | Version | Rôle |
|---------|---------|------|
| `eslint` | ^9.17.0 | Linting du code JavaScript |
| `prettier` | ^3.4.2 | Formatage automatique du code |

---

## 🎯 Points d'entrée

### Pour Claude Desktop

```json
{
  "command": "node",
  "args": ["/chemin/vers/index.js"]
}
```

### Pour le webhook

```bash
npm run webhook
# ou
node webhook-server.js
```

### Pour les tests

```bash
npm test
```

---

## 🔐 Fichiers sensibles

**⚠️ NE JAMAIS COMMITTER** :

- `.env` - Contient les secrets
- `node_modules/` - Dépendances (gros et régénérable)
- `*.log` - Logs peuvent contenir des données sensibles
- `*.key`, `*.pem` - Certificats SSL

**Vérification** :

```bash
# Ces fichiers doivent être dans .gitignore
cat .gitignore | grep -E "(\.env|node_modules|\.log)"
```

---

## 🚦 Fichiers de statut

### En développement

- `package-lock.json` - Versions exactes des dépendances
- `.env` - Configuration locale

### En production

- `package-lock.json` - Versions verrouillées
- `.env` - Configuration production
- Logs dans `/var/log/` ou via PM2

---

## 💡 Conseils d'organisation

### Pour les contributeurs

1. Lisez `CONTRIBUTING.md` en premier
2. Créez une branche pour chaque feature
3. Testez avant de commit
4. Mettez à jour la doc si nécessaire

### Pour les utilisateurs

1. Commencez par `QUICKSTART.md`
2. Consultez `INSTALL.md` si problème
3. `WEBHOOK.md` pour les fonctionnalités avancées
4. `README.md` comme référence complète

### Pour la maintenance

1. Gardez les dépendances à jour
2. Testez après chaque mise à jour
3. Documentez les changements importants
4. Suivez les conventions de commit

---

## 📞 Où trouver de l'aide

**Pour chaque sujet, consultez** :

| Sujet | Fichier | Section |
|-------|---------|---------|
| Installation rapide | QUICKSTART.md | Tout |
| Installation détaillée | INSTALL.md | Tout |
| Liste des outils | README.md | API disponibles |
| Webhooks | WEBHOOK.md | Tout |
| Bugs | GitHub Issues | - |
| Contribution | CONTRIBUTING.md | Tout |
| Architecture | README.md | Architecture |
| Exemples | README.md | Utilisation |

---

## 🎓 Apprentissage progressif

**Niveau débutant** :
1. QUICKSTART.md - Installation rapide
2. Testez les commandes de base
3. Explorez avec Claude

**Niveau intermédiaire** :
1. INSTALL.md - Comprenez l'installation
2. README.md - Tous les outils disponibles
3. Personnalisez votre utilisation

**Niveau avancé** :
1. WEBHOOK.md - Notifications temps réel
2. index.js - Comprenez le code
3. CONTRIBUTING.md - Contribuez au projet

---

## 🔄 Maintenance du projet

### Mises à jour

```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour les dépendances
npm update

# Mise à jour majeure (attention aux breaking changes)
npm install package@latest
```

### Nettoyage

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force
```

---

## ✨ Évolution future

**Roadmap possible** :

```
src/
├── client/
│   ├── dolibarr.js           # Client API
│   └── cache.js              # Gestion du cache
├── tools/
│   ├── thirdparty.js         # Outils tiers
│   ├── invoice.js            # Outils factures
│   └── ...
├── webhook/
│   ├── server.js             # Serveur HTTP
│   ├── handlers/             # Handlers par module
│   └── security.js           # Sécurité
├── utils/
│   ├── logger.js             # Logging
│   ├── validator.js          # Validation
│   └── errors.js             # Gestion erreurs
└── index.js                  # Point d'entrée
```

---

**Ce fichier est maintenu à jour à chaque évolution majeure du projet.**

Dernière mise à jour : 24/11/2024
