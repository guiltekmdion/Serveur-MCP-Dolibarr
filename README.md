# Serveur MCP Dolibarr

Un serveur MCP (Model Context Protocol) robuste et prêt pour la production pour Dolibarr ERP/CRM.
Ce serveur permet aux agents IA comme Claude Desktop, ChatGPT (via adaptateur MCP) et autres d'interagir avec votre instance Dolibarr de manière sécurisée via son API REST.

## 🚀 Fonctionnalités

- **Autonome** : Fonctionne indépendamment du code interne de Dolibarr. Utilise uniquement l'API REST.
- **Stack Moderne** : Construit avec TypeScript et Node.js LTS.
- **Standardisé** : Utilise le SDK officiel `@modelcontextprotocol/sdk`.
- **Prêt pour Docker** : Inclut un Dockerfile optimisé et une configuration Compose.
- **Sécurisé** : Configuration par variables d'environnement, aucun identifiant en dur.
- **Enrichissement Automatique** : Complète automatiquement les données des entreprises françaises (SIREN, SIRET, NAF, RCS, Adresse) via l'API `api.gouv.fr` lors de la création si l'adresse est manquante.

## 🛠 Outils Inclus

Le serveur expose **212 outils MCP** couvrant toute l'API Dolibarr :

### 📇 Tiers (Thirdparties)
- `dolibarr_get_thirdparty` - `dolibarr_search_thirdparties`
- `dolibarr_create_thirdparty` - `dolibarr_update_thirdparty`

### 👤 Contacts
- `dolibarr_get_contact` - `dolibarr_list_contacts_for_thirdparty`
- `dolibarr_create_contact`

### 📄 Propositions Commerciales
- `dolibarr_get_proposal` - `dolibarr_list_proposals` - `dolibarr_create_proposal`
- `dolibarr_add_proposal_line` - `dolibarr_update_proposal_line` - `dolibarr_delete_proposal_line`
- `dolibarr_change_proposal_status`

### 📦 Commandes
- `dolibarr_get_order` - `dolibarr_create_order` - `dolibarr_change_order_status`

### 💰 Factures
- `dolibarr_get_invoice` - `dolibarr_list_invoices` - `dolibarr_create_invoice`
- `dolibarr_create_invoice_from_proposal` - `dolibarr_record_invoice_payment`

### 🏷️ Produits/Services
- `dolibarr_get_product` - `dolibarr_search_products`

### 📁 Documents
- `dolibarr_list_documents_for_object` - `dolibarr_upload_document_for_object`

### 📊 Projets & Tâches
- `dolibarr_get_project` - `dolibarr_list_projects` - `dolibarr_create_project`
- `dolibarr_get_task` - `dolibarr_create_task`

### 👥 Utilisateurs
- `dolibarr_get_user` - `dolibarr_list_users`

### 🏦 Banques
- `dolibarr_list_bank_accounts` - `dolibarr_get_bank_account_lines`

### 🏭 Entrepôts (Warehouses) - NOUVEAU
- `dolibarr_list_warehouses` - `dolibarr_get_warehouse`

### 📦 Stock - NOUVEAU
- `dolibarr_list_stock_movements` - `dolibarr_create_stock_movement`

### 🚚 Expéditions - NOUVEAU
- `dolibarr_list_shipments` - `dolibarr_get_shipment` - `dolibarr_create_shipment`

### 📝 Contrats - NOUVEAU
- `dolibarr_list_contracts` - `dolibarr_get_contract` - `dolibarr_create_contract`

### 🎫 Tickets (Support) - NOUVEAU
- `dolibarr_list_tickets` - `dolibarr_get_ticket` - `dolibarr_create_ticket`

### 📅 Agenda - NOUVEAU
- `dolibarr_list_agenda_events` - `dolibarr_get_agenda_event` - `dolibarr_create_agenda_event`

### 💳 Notes de Frais - NOUVEAU

- `dolibarr_list_expense_reports` - `dolibarr_get_expense_report` - `dolibarr_create_expense_report`

### 🔧 Interventions (Fichinter) - NOUVEAU
- `dolibarr_list_interventions` - `dolibarr_get_intervention` - `dolibarr_create_intervention`

### 🔐 Droits & Permissions - NOUVEAU
- `dolibarr_list_user_groups` - `dolibarr_create_user_group` - `dolibarr_add_user_to_group`
- `dolibarr_set_user_rights` - `dolibarr_get_audit_logs`

### 🌍 Multi-entités & Devises - NOUVEAU
- `dolibarr_list_entities` - `dolibarr_create_entity`
- `dolibarr_list_currencies` - `dolibarr_convert_currency`

### 📅 Calendrier & Absences - NOUVEAU
- `dolibarr_list_holidays` - `dolibarr_create_holiday` - `dolibarr_validate_holiday`
- `dolibarr_create_resource_booking` - `dolibarr_list_resource_bookings`

### 💳 Abonnements (Subscriptions) - NOUVEAU
- `dolibarr_list_subscriptions` - `dolibarr_create_subscription`
- `dolibarr_renew_subscription` - `dolibarr_cancel_subscription`

### 📊 Analyse & Dashboard - NOUVEAU

- `dolibarr_get_sales_stats` - `dolibarr_get_top_customers`
- `dolibarr_get_global_status`

[📚 Documentation complète des outils](./docs/03-tools.md)
[🚀 Modules avancés détaillés](./docs/ADVANCED-MODULES.md)

## 📋 Prérequis

- Node.js >= 18
- Une instance Dolibarr fonctionnelle (v10+)
- Clé API Dolibarr (générée dans les paramètres utilisateur)

## 📦 Installation

### Développement Local

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/votre-repo/serveur-mcp-dolibarr.git
    cd serveur-mcp-dolibarr
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Configurer l'environnement :**
    Copiez `.env.example` vers `.env` et remplissez vos informations.
    ```bash
    cp .env.example .env
    ```
    Éditez `.env` :
    ```env
    DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
    DOLIBARR_API_KEY=votre_cle_api
    LOG_LEVEL=info
    ```

4.  **Construire et Lancer :**
    ```bash
    npm run build
    npm start
    ```

### Déploiement Docker

1.  **Construire l'image :**
    ```bash
    docker build -t dolibarr-mcp .
    ```

2.  **Lancer avec Docker Compose :**
    ```bash
    docker-compose up -d
    ```

3.  **Lancer en interactif (mode STDIO) :**
    ```bash
    docker run -i --env-file .env dolibarr-mcp
    ```

## 🤖 Configuration pour Claude Desktop

Ajoutez ce qui suit à votre `claude_desktop_config.json` :

### Via Docker (Recommandé)

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php",
        "-e", "DOLIBARR_API_KEY=votre_cle_api",
        "dolibarr-mcp"
      ]
    }
  }
}
```

### Via Node.js Local

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": [
        "/chemin/absolu/vers/serveur-mcp-dolibarr/dist/server.js"
      ],
      "env": {
        "DOLIBARR_BASE_URL": "https://votre-dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

## 🐛 Débogage

Vous pouvez utiliser le [MCP Inspector](https://github.com/modelcontextprotocol/inspector) pour tester le serveur.

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

## 🏗 Structure du Projet

```
src/
├── server.ts           # Point d'entrée du serveur MCP
├── services/
│   ├── dolibarr.ts     # Client API REST Dolibarr
│   └── company-search.ts # Service d'enrichissement (api.gouv.fr)
├── tools/              # Définitions des outils MCP
│   ├── thirdparties.ts # Outils de gestion des tiers
│   ├── proposals.ts    # Outils de gestion des propositions
│   └── ...
├── types/              # Définitions TypeScript et Schémas Zod
└── utils/
    └── config.ts       # Configuration de l'environnement
docs/                   # Documentation détaillée
extras/                 # Scripts et outils supplémentaires
tests/                  # Tests unitaires
```

## 📚 Documentation

### 🚀 Démarrage
- [Installation](./docs/01-installation.md)
- [Configuration](./docs/02-configuration.md)
- [Démarrage Rapide](./docs/QUICKSTART.md)
- [Déploiement Docker](./docs/04-docker.md)

### 📖 Référence API
- [Référence API Complète](./docs/API-REFERENCE.md) - **212 outils documentés**
- [Liste des Outils MCP](./docs/03-tools.md)
- [Exploration API](./docs/API_EXPLORATION.md)

### 🎯 Guides & Cas d'Usage
- [50 Cas d'Usage](./docs/50-USE-CASES.md)
- [Modules Avancés](./docs/ADVANCED-MODULES.md)
- [Quick Start Modules Avancés](./docs/QUICKSTART-ADVANCED.md)

### 📝 Changelog & Migration
- [Changelog Complet](./CHANGELOG.md)
- [Comparatif des Versions](./CHANGELOG-V2.md)
- [Résumé Implémentation v2.0](./IMPLEMENTATION-SUMMARY.md)

### 🔧 Compatibilité
- [Compatibilité API Dolibarr](./docs/COMPATIBILITY.md)
- [Structure du Projet](./docs/PROJECT_STRUCTURE.md)

## 👥 Auteurs et Crédits

Ce projet a été initié et développé par **Maxime DION** pour **Guiltek**.

- **Auteur Principal** : Maxime DION
- **Organisation** : [Guiltek](https://guiltek.com)

## 📜 Licence

MIT
