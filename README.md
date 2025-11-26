# Serveur MCP Dolibarr

Un serveur MCP (Model Context Protocol) pour Dolibarr ERP/CRM permettant aux agents IA comme Claude Desktop d'interagir avec votre instance Dolibarr de manière sécurisée via son API REST.

## ⚠️ Statut du Projet

**Ceci est un POC (Proof of Concept)** en développement actif. Le serveur est fonctionnel et couvre une large partie de l'API Dolibarr, mais il est encore en phase d'amélioration continue. N'hésitez pas à remonter des bugs ou à contribuer !

## 🏗️ Architecture et Positionnement

### Pourquoi un serveur externe plutôt qu'une intégration directe ?

Ce serveur MCP fonctionne **en dehors de Dolibarr** pour plusieurs raisons stratégiques :

1. **Découplage et Maintenabilité** : Le serveur utilise uniquement l'API REST publique de Dolibarr. Il ne dépend pas du code interne de Dolibarr et n'est pas impacté par les mises à jour de ce dernier.

2. **Compatibilité Universelle** : Compatible avec n'importe quelle instance Dolibarr (SaaS, on-premise, Docker) dès lors que l'API REST est activée. Pas besoin de modifier le code de Dolibarr.

3. **Sécurité et Isolation** : Le serveur peut être déployé dans un environnement sécurisé distinct, avec ses propres règles de firewall et d'accès.

4. **Indépendance Technologique** : Développé en TypeScript/Node.js avec le SDK officiel MCP, ce qui permet d'évoluer indépendamment de la stack PHP de Dolibarr.

### Position dans la chaîne d'interaction

```
┌─────────────────┐      MCP Protocol       ┌──────────────────────┐      REST API      ┌─────────────────┐
│                 │  (stdio/SSE/WebSocket)   │                      │   (HTTP + DOLAPIKEY)│                 │
│  Agent IA       │ ◄──────────────────────► │  Serveur MCP         │ ◄─────────────────►│  Dolibarr       │
│  (Claude, etc.) │                          │  Dolibarr            │                    │  ERP/CRM        │
│                 │                          │                      │                    │                 │
└─────────────────┘                          └──────────────────────┘                    └─────────────────┘
```

**Le serveur MCP agit comme un pont** :
- Il reçoit des **requêtes structurées** de l'agent IA via le protocole MCP
- Il les **traduit en appels REST API** compréhensibles par Dolibarr
- Il **renvoie les réponses** formatées à l'agent, qui peut alors raisonner et agir

Cela permet à n'importe quel agent compatible MCP (Claude Desktop, ChatGPT avec adaptateur, agents autonomes...) de manipuler votre ERP sans connaître les spécificités de l'API Dolibarr.

## 🚀 Fonctionnalités

- **Autonome** : Fonctionne indépendamment du code interne de Dolibarr. Utilise uniquement l'API REST.
- **Stack Moderne** : Construit avec TypeScript et Node.js LTS.
- **Standardisé** : Utilise le SDK officiel `@modelcontextprotocol/sdk`.
- **Prêt pour Docker** : Inclut un Dockerfile optimisé et une configuration Compose.
- **Sécurisé** : Configuration par variables d'environnement, aucun identifiant en dur.
- **Enrichissement Automatique** : Complète automatiquement les données des entreprises françaises (SIREN, SIRET, NAF, RCS, Adresse) via l'API `api.gouv.fr` lors de la création si l'adresse est manquante.
- **Couverture Complète** : 105+ outils MCP couvrant l'ensemble de l'API Dolibarr.

## 💡 Qu'est-ce que ce serveur permet de faire ?

Une fois connecté à Claude Desktop (ou tout autre client MCP), vous pouvez interagir avec votre Dolibarr **en langage naturel**. Exemples :

- *"Crée un nouveau client nommé ABC Corp avec l'email contact@abc.com"*
- *"Trouve-moi tous les tiers qui contiennent 'Google' dans leur nom"*
- *"Récupère la facture numéro FA2024-123"*
- *"Liste les 10 dernières propositions commerciales"*
- *"Crée un ticket de support pour le client ID 42 avec le sujet 'Problème de facturation'"*
- *"Ajoute un événement agenda demain à 14h : rendez-vous client XYZ"*
- *"Fais-moi un mouvement de stock : ajoute 50 unités du produit ID 12 dans l'entrepôt ID 3"*
- *"Gère les droits utilisateurs et les permissions de groupe"*
- *"Crée un abonnement mensuel pour ce client"*

L'agent IA traduit automatiquement vos demandes en appels aux bons outils MCP, qui eux-mêmes appellent l'API Dolibarr.

## 🛠 Outils MCP Disponibles

Le serveur expose **plus de 105 outils MCP** couvrant l'ensemble des modules Dolibarr. Chaque outil correspond à une opération précise sur l'API REST.

### Vue d'ensemble par catégorie

| Catégorie | Outils | Description |
|-----------|--------|-------------|
| 📇 **Tiers** | 4 | Gestion des clients, prospects et fournisseurs (CRUD + recherche) |
| 👤 **Contacts** | 3 | Gestion des contacts rattachés aux tiers |
| 📄 **Propositions** | 7 | Création et gestion complète des devis (lignes, statuts) |
| 📦 **Commandes** | 3 | Création et suivi des commandes clients |
| 💰 **Factures** | 5 | Facturation complète (création, génération depuis devis, paiements) |
| 🏷️ **Produits/Services** | 2 | Consultation et recherche du catalogue |
| 📁 **Documents** | 2 | Upload et liste des documents (PDF, images, etc.) |
| 📊 **Projets & Tâches** | 5 | Gestion de projets et tâches associées |
| 👥 **Utilisateurs** | 2 | Consultation des utilisateurs Dolibarr |
| 🏦 **Banques** | 2 | Consultation des comptes bancaires et lignes d'écritures |
| 🏭 **Entrepôts** | 2 | Liste et détails des entrepôts |
| 📦 **Stock** | 2 | Mouvements de stock (entrées/sorties/transferts) |
| 🚚 **Expéditions** | 3 | Gestion des expéditions clients |
| 📝 **Contrats** | 3 | Gestion des contrats clients |
| 🎫 **Tickets** | 3 | Support client / helpdesk |
| 📅 **Agenda** | 3 | Événements et rendez-vous |
| 💳 **Notes de Frais** | 2 | Consultation des notes de frais |
| 🔧 **Interventions** | 3 | Fiches d'intervention (SAV, maintenance) |
| 🏢 **Fournisseurs** | 8+ | Gestion complète des fournisseurs et achats |
| 🏷️ **Catégories** | 3+ | Gestion des catégories d'objets |
| 🔧 **Opérations Communes** | 2+ | Opérations transverses (statuts, liens, etc.) |
| 🔐 **Droits & Permissions** | 5 | Gestion des groupes, utilisateurs et droits d'accès |
| 🌍 **Multi-entités & Devises** | 4 | Gestion multi-entités et conversion de devises |
| 📅 **Calendrier & Absences** | 5 | Gestion des congés, absences et réservations de ressources |
| 💳 **Abonnements** | 4 | Gestion complète des abonnements récurrents |

### Exemples d'outils par catégorie

<details>
<summary><b>📇 Tiers (Thirdparties)</b></summary>

- `dolibarr_get_thirdparty` : Récupérer un tiers par ID
- `dolibarr_search_thirdparties` : Rechercher des tiers par nom
- `dolibarr_create_thirdparty` : Créer un nouveau tiers (avec enrichissement auto pour les entreprises françaises)
- `dolibarr_update_thirdparty` : Mettre à jour un tiers existant

</details>

<details>
<summary><b>📄 Propositions Commerciales</b></summary>

- `dolibarr_get_proposal` : Récupérer une proposition par ID
- `dolibarr_list_proposals` : Lister les propositions
- `dolibarr_create_proposal` : Créer une nouvelle proposition
- `dolibarr_add_proposal_line` : Ajouter une ligne de produit/service
- `dolibarr_update_proposal_line` : Modifier une ligne existante
- `dolibarr_delete_proposal_line` : Supprimer une ligne
- `dolibarr_change_proposal_status` : Changer le statut (brouillon, validée, signée, refusée...)

</details>

<details>
<summary><b>💰 Factures</b></summary>

- `dolibarr_get_invoice` : Récupérer une facture par ID
- `dolibarr_list_invoices` : Lister les factures
- `dolibarr_create_invoice` : Créer une nouvelle facture
- `dolibarr_create_invoice_from_proposal` : Générer une facture depuis une proposition validée
- `dolibarr_record_invoice_payment` : Enregistrer un paiement

</details>

<details>
<summary><b>📦 Stock & Entrepôts</b></summary>

- `dolibarr_list_warehouses` : Lister les entrepôts
- `dolibarr_get_warehouse` : Détails d'un entrepôt
- `dolibarr_list_stock_movements` : Liste des mouvements de stock
- `dolibarr_create_stock_movement` : Créer un mouvement (entrée, sortie, transfert)

</details>

<details>
<summary><b>🎫 Support & Interventions</b></summary>

- `dolibarr_list_tickets` : Lister les tickets de support
- `dolibarr_get_ticket` : Détails d'un ticket
- `dolibarr_create_ticket` : Créer un nouveau ticket
- `dolibarr_list_interventions` : Lister les fiches d'intervention
- `dolibarr_get_intervention` : Détails d'une intervention
- `dolibarr_create_intervention` : Créer une fiche d'intervention

</details>

<details>
<summary><b>📅 Agenda & Projets</b></summary>

- `dolibarr_list_agenda_events` : Lister les événements
- `dolibarr_create_agenda_event` : Créer un événement (rendez-vous, appel, email...)
- `dolibarr_list_projects` : Lister les projets
- `dolibarr_create_project` : Créer un projet
- `dolibarr_create_task` : Créer une tâche dans un projet

</details>

<details>
<summary><b>🔐 Droits & Permissions (Nouveau)</b></summary>

- `dolibarr_list_user_groups` : Lister les groupes d'utilisateurs
- `dolibarr_create_user_group` : Créer un groupe d'utilisateurs
- `dolibarr_add_user_to_group` : Ajouter un utilisateur à un groupe
- `dolibarr_set_user_rights` : Définir les droits d'un utilisateur
- `dolibarr_get_audit_logs` : Consulter les logs d'audit

</details>

<details>
<summary><b>🌍 Multi-entités & Devises (Nouveau)</b></summary>

- `dolibarr_list_entities` : Lister les entités (multi-company)
- `dolibarr_create_entity` : Créer une nouvelle entité
- `dolibarr_list_currencies` : Lister les devises disponibles
- `dolibarr_convert_currency` : Convertir un montant entre devises

</details>

<details>
<summary><b>📅 Calendrier & Absences (Nouveau)</b></summary>

- `dolibarr_list_holidays` : Lister les demandes de congés
- `dolibarr_create_holiday` : Créer une demande de congé
- `dolibarr_validate_holiday` : Valider/refuser une demande de congé
- `dolibarr_create_resource_booking` : Réserver une ressource
- `dolibarr_list_resource_bookings` : Lister les réservations de ressources

</details>

<details>
<summary><b>💳 Abonnements (Nouveau)</b></summary>

- `dolibarr_list_subscriptions` : Lister les abonnements
- `dolibarr_create_subscription` : Créer un nouvel abonnement
- `dolibarr_renew_subscription` : Renouveler un abonnement
- `dolibarr_cancel_subscription` : Annuler un abonnement

</details>

**📚 [Documentation détaillée de tous les outils](./docs/03-tools.md)** - Consultez ce fichier pour la liste exhaustive avec paramètres et exemples d'utilisation.

**🚀 [Modules avancés détaillés](./docs/ADVANCED-MODULES.md)** - Guide complet des fonctionnalités avancées (droits, multi-entités, abonnements, etc.)

## 💼 Cas d'Usage Concrets

Voici quelques exemples de ce que vous pouvez demander à Claude une fois le serveur connecté :

### Scénario 1 : Création d'un devis complet
```
Utilisateur : "Crée un nouveau client 'Acme Corp' avec l'email contact@acme.com,
puis crée une proposition commerciale pour ce client avec 3 produits :
- Produit ID 5 (quantité 10)
- Produit ID 12 (quantité 2)
- Produit ID 8 (quantité 1)"
```
Claude va automatiquement :
1. Créer le tiers avec `dolibarr_create_thirdparty`
2. Créer la proposition avec `dolibarr_create_proposal`
3. Ajouter les 3 lignes avec `dolibarr_add_proposal_line`

### Scénario 2 : Suivi des factures impayées
```
Utilisateur : "Montre-moi toutes les factures impayées et leur montant total"
```
Claude va :
1. Lister les factures avec `dolibarr_list_invoices`
2. Filtrer celles non payées
3. Calculer le total et présenter un résumé

### Scénario 3 : Gestion du support client
```
Utilisateur : "Un client signale un problème sur la commande #CMD-2024-456.
Crée un ticket de support prioritaire et une intervention pour demain."
```
Claude va :
1. Rechercher le client concerné
2. Créer un ticket avec `dolibarr_create_ticket`
3. Créer une intervention avec `dolibarr_create_intervention`
4. Créer un événement agenda avec `dolibarr_create_agenda_event`

### Scénario 4 : Analyse et reporting
```
Utilisateur : "Donne-moi un résumé des propositions commerciales du mois dernier :
combien ont été validées, refusées, et signées ?"
```
Claude va récupérer les propositions et produire une analyse statistique.

### Scénario 5 : Gestion des droits utilisateurs
```
Utilisateur : "Crée un groupe 'Commercial' et ajoute l'utilisateur ID 15 dedans avec les droits de lecture sur les tiers"
```
Claude va :
1. Créer le groupe avec `dolibarr_create_user_group`
2. Ajouter l'utilisateur avec `dolibarr_add_user_to_group`
3. Configurer les droits avec `dolibarr_set_user_rights`

**📖 [50+ Cas d'usage détaillés](./docs/50-USE-CASES.md)** - Découvrez tous les scénarios possibles avec des exemples concrets

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

### Déploiement Docker (Recommandé)

Docker est la méthode recommandée pour utiliser ce serveur avec Claude Desktop, car elle garantit un environnement isolé et reproductible.

#### 1. Préparer l'environnement

Créez un fichier `.env` à la racine du projet :
```bash
cp .env.example .env
```

Éditez `.env` avec vos informations Dolibarr :
```env
DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
DOLIBARR_API_KEY=votre_cle_api
LOG_LEVEL=info
```

#### 2. Construire l'image Docker

```bash
docker build -t dolibarr-mcp .
```

Cette commande crée une image Docker optimisée avec Node.js 20 Alpine et toutes les dépendances nécessaires.

#### 3. Tester le serveur (optionnel)

Avant de connecter à Claude Desktop, vous pouvez tester que le serveur fonctionne :

```bash
docker run -i --rm --env-file .env dolibarr-mcp
```

Le serveur démarre en mode STDIO et attend des commandes MCP. Vous pouvez le tester avec le [MCP Inspector](https://github.com/modelcontextprotocol/inspector) :

```bash
npx @modelcontextprotocol/inspector docker run -i --rm --env-file .env dolibarr-mcp
```

#### 4. Connecter à Claude Desktop

Une fois l'image construite, vous êtes prêt à connecter le serveur à Claude Desktop (voir section suivante).

## 🤖 Configuration pour Claude Desktop

Claude Desktop utilise un fichier de configuration JSON pour déclarer les serveurs MCP disponibles. Ce fichier se trouve à différents emplacements selon votre système :

- **macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows** : `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux** : `~/.config/Claude/claude_desktop_config.json`

### Méthode 1 : Via Docker (Recommandé pour la production)

Cette méthode lance un conteneur Docker à chaque démarrage de Claude Desktop. Elle garantit l'isolation et la reproductibilité.

**Configuration à ajouter dans `claude_desktop_config.json` :**

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
        "-e", "LOG_LEVEL=info",
        "dolibarr-mcp"
      ]
    }
  }
}
```

**Important :**
- Remplacez `https://votre-dolibarr.com/api/index.php` par l'URL de votre API Dolibarr
- Remplacez `votre_cle_api` par votre clé API Dolibarr (générée dans les paramètres utilisateur de Dolibarr)
- L'image `dolibarr-mcp` doit avoir été construite au préalable (voir section Docker ci-dessus)
- Le flag `--rm` supprime automatiquement le conteneur après chaque session
- Le flag `-i` active le mode interactif (STDIO) nécessaire pour MCP

**Redémarrer Claude Desktop** après avoir modifié la configuration. Le serveur Dolibarr devrait apparaître dans la liste des outils disponibles (icône 🔌).

### Méthode 2 : Via Node.js Local (Recommandé pour le développement)

Cette méthode exécute directement le serveur avec Node.js installé sur votre machine. Plus rapide pour le développement.

**Prérequis :**
- Node.js >= 18 installé
- Avoir exécuté `npm install` et `npm run build` dans le répertoire du projet

**Configuration à ajouter dans `claude_desktop_config.json` :**

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
        "DOLIBARR_API_KEY": "votre_cle_api",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important :**
- Utilisez le **chemin absolu** vers `dist/server.js` (pas de `~` ou de chemin relatif)
- Exemple macOS/Linux : `/Users/votreuser/serveur-mcp-dolibarr/dist/server.js`
- Exemple Windows : `C:\\Users\\votreuser\\serveur-mcp-dolibarr\\dist\\server.js`

### Vérification

Après avoir ajouté la configuration et redémarré Claude Desktop :

1. Ouvrez Claude Desktop
2. Cliquez sur l'icône 🔌 (en bas à droite ou dans la barre latérale)
3. Vous devriez voir **"dolibarr"** dans la liste des serveurs connectés
4. Vérifiez que tous les outils sont bien chargés (105+ outils disponibles)

Si le serveur n'apparaît pas, consultez les logs de Claude Desktop :
- **macOS** : `~/Library/Logs/Claude/mcp*.log`
- **Windows** : `%APPDATA%\Claude\logs\mcp*.log`
- **Linux** : `~/.config/Claude/logs/mcp*.log`

## 🐛 Débogage

### Utiliser le MCP Inspector

Le [MCP Inspector](https://github.com/modelcontextprotocol/inspector) est un outil officiel pour tester les serveurs MCP de manière interactive.

**Avec Node.js local :**
```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

**Avec Docker :**
```bash
npx @modelcontextprotocol/inspector docker run -i --rm --env-file .env dolibarr-mcp
```

L'Inspector ouvre une interface web où vous pouvez :
- Lister tous les outils disponibles
- Tester chaque outil avec des paramètres personnalisés
- Voir les requêtes/réponses en temps réel
- Déboguer les erreurs

### Logs et Diagnostics

**Logs du serveur MCP :**
Le serveur log toutes les opérations sur `stderr`. Vous pouvez ajuster le niveau de log avec la variable `LOG_LEVEL` :
- `error` : Erreurs uniquement
- `warn` : Avertissements + erreurs
- `info` : Informations + warn + error (par défaut)
- `debug` : Tout, y compris les détails des requêtes/réponses

**Logs de Claude Desktop :**
- **macOS** : `~/Library/Logs/Claude/mcp*.log`
- **Windows** : `%APPDATA%\Claude\logs\mcp*.log`
- **Linux** : `~/.config/Claude/logs/mcp*.log`

### Problèmes Courants

**Le serveur n'apparaît pas dans Claude Desktop :**
1. Vérifiez la syntaxe JSON de `claude_desktop_config.json`
2. Vérifiez que le chemin vers `dist/server.js` est absolu (pas de `~`)
3. Pour Docker, vérifiez que l'image `dolibarr-mcp` est bien construite (`docker images | grep dolibarr-mcp`)
4. Consultez les logs de Claude Desktop

**Erreurs d'authentification Dolibarr :**
1. Vérifiez que l'API REST est activée dans Dolibarr (Configuration > Modules)
2. Vérifiez que votre clé API est valide (Paramètres utilisateur > API)
3. Testez l'URL de l'API avec curl :
   ```bash
   curl -H "DOLAPIKEY: votre_cle" https://votre-dolibarr.com/api/index.php/users
   ```

**Timeout ou lenteur :**
1. Vérifiez la latence réseau vers votre instance Dolibarr
2. Augmentez le timeout dans `src/services/dolibarr.ts` si nécessaire

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
│   ├── advanced.ts     # Modules avancés (droits, multi-entités, etc.)
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
- [Référence API Complète](./docs/API-REFERENCE.md) - **105+ outils documentés**
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

## ❓ FAQ

### Est-ce que ce serveur fonctionne avec DoliCloud (SaaS) ?

Oui, tant que l'API REST est activée et que vous avez une clé API valide. DoliCloud active généralement l'API par défaut.

### Puis-je utiliser ce serveur avec d'autres agents IA que Claude ?

Oui, en théorie tout client compatible MCP peut utiliser ce serveur. Cependant, Claude Desktop est le client le plus mature et testé à ce jour. D'autres clients comme ChatGPT nécessitent un adaptateur MCP.

### Le serveur modifie-t-il directement la base de données Dolibarr ?

Non, le serveur utilise **exclusivement l'API REST publique** de Dolibarr. Il n'accède jamais directement à la base de données. Toutes les opérations passent par l'API officielle, ce qui garantit l'intégrité des données et le respect des règles métier de Dolibarr.

### Quelles versions de Dolibarr sont supportées ?

Le serveur est compatible avec Dolibarr 10.0 et supérieur. Il a été testé principalement avec les versions 16.x, 17.x et 18.x.

### Puis-je utiliser ce serveur en production ?

Ce projet est actuellement un **POC (Proof of Concept)**. Il est fonctionnel et couvre une large partie de l'API, mais il est recommandé de :
1. Tester en profondeur sur un environnement de staging
2. Mettre en place une surveillance des erreurs
3. Limiter les droits de la clé API aux opérations strictement nécessaires
4. Surveiller les performances et les timeouts

### Comment contribuer ou signaler un bug ?

Les contributions sont les bienvenues ! Vous pouvez :
- Ouvrir une issue sur GitHub pour signaler un bug
- Proposer une Pull Request pour ajouter des fonctionnalités
- Améliorer la documentation

### Le serveur supporte-t-il le multi-tenancy ?

Actuellement, une instance du serveur est liée à une seule instance Dolibarr (une URL + une clé API). Pour gérer plusieurs instances Dolibarr, vous devez lancer plusieurs instances du serveur MCP avec des configurations différentes.

Cependant, si votre Dolibarr utilise le module multi-entités (multi-company), le serveur fournit des outils dédiés (`dolibarr_list_entities`, `dolibarr_create_entity`) pour gérer plusieurs entités au sein de la même instance.

### Puis-je personnaliser les outils disponibles ?

Oui ! Le code est open-source. Vous pouvez :
- Modifier les outils existants dans `src/tools/`
- Ajouter de nouveaux outils en suivant le pattern des outils existants
- Retirer des outils en les commentant dans `src/server.ts`

### L'enrichissement automatique fonctionne pour quels pays ?

Actuellement, l'enrichissement automatique des entreprises (SIREN, SIRET, adresse) fonctionne uniquement pour la **France** via l'API `api.gouv.fr`. D'autres pays pourraient être ajoutés à l'avenir.

### Quels sont les nouveaux modules avancés disponibles ?

La version récente inclut des modules avancés :
- **Droits & Permissions** : Gestion complète des groupes, utilisateurs et droits d'accès
- **Multi-entités & Devises** : Support multi-company et conversion de devises
- **Calendrier & Absences** : Gestion des congés et réservation de ressources
- **Abonnements** : Gestion des abonnements récurrents avec renouvellement automatique

Consultez le [Guide des Modules Avancés](./docs/ADVANCED-MODULES.md) pour plus de détails.

## 👥 Auteurs et Crédits

Ce projet a été initié et développé par **Maxime DION** pour **Guiltek**.

- **Auteur Principal** : Maxime DION
- **Organisation** : [Guiltek](https://guiltek.com)

## 📜 Licence

MIT
