# Changelog - Serveur MCP Dolibarr

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

**Note :** Ce projet a été développé en 3 jours intensifs (24-26 novembre 2025).

---

## [1.4.0] - 2025-11-27

### 🚀 Mise à Jour Stack Novembre 2025

**Upgrade majeur des dépendances :**

| Package | Avant | Après |
|---------|-------|-------|
| **Zod** | 3.22.4 | **4.1.13** |
| **MCP SDK** | 1.0.4 | **1.23.0** |
| **dotenv** | 16.4.7 | **17.2.3** |
| **TypeScript** | 5.3.3 | **5.8.x** |
| **ESLint** | 9.17.0 | **9.28.x** |
| **Node.js** | 20 | **22 LTS** |

**Changements notables :**

- Migration **Zod 3 → Zod 4** : API `.issues` au lieu de `.errors`
- Node.js **22 LTS** (Alpine) dans Docker
- `npm ci --omit=dev` (nouvelle syntaxe npm)
- Exigence minimale : Node.js >= 20.0.0

---

## [1.3.1] - 2025-11-27

### 🔒 Correctifs de Sécurité

**Résolution des vulnérabilités CVE :**

- 🔴 **CVE-2024-21538** (cross-spawn) : 7.0.3 → 7.0.5
- 🔴 **CVE-2025-64756** (glob) : 10.4.2 → 11.1.0
- 🟡 **CVE-2025-13466** (body-parser) : 2.2.0 → 2.2.1
- 🟢 **CVE-2025-5889** (brace-expansion) : 2.0.1 → 2.0.2

**Améliorations Docker :**

- Mise à jour de l'image de base : `node:20-alpine` → `node:20.18-alpine`
- Ajout de `overrides` dans package.json pour forcer les versions sécurisées
- 0 vulnérabilités détectées après audit

---

## [1.3.0] - 2025-11-27

### 🚀 Détection Intelligente des Modules (Commit `083c942`)

**Système de détection automatique des modules Dolibarr :**

- Mapping de 25+ endpoints vers leurs modules Dolibarr
- Récupération des modules actifs via `/status` au démarrage
- Vérification avant chaque appel API
- Messages d'erreur clairs avec chemin de navigation Dolibarr

**Exemple d'erreur :**
```
Module Dolibarr "Tickets (Support)" (ticket) non activé. 
Activez-le dans Dolibarr: Accueil → Configuration → Modules/Applications.
```

### 🐛 Corrections Logiques Métier (Commit `49342ce`)

**Corrections critiques :**
- `createInvoiceFromProposal` : Utilise maintenant `/invoices/createfromproposal/{id}` avec fallback
- `sendEmail` : Crée un événement agenda AC_EMAIL au lieu de setup/checkemail
- `listAgendaEvents` : Les filtres thirdparty_id et user_id ne s'écrasent plus
- `shipOrder` : Crée maintenant les lignes d'expédition depuis les lignes de commande

**Gestion d'erreurs améliorée :**
- Ajout de try/catch à 15+ méthodes (fournisseurs, catégories, notes de frais...)
- Retour de tableaux vides pour les 404 sur les méthodes de liste
- Validation Zod cohérente sur toutes les méthodes create/update

### ⚡ Optimisations de Performance (Commit `98b4a6d`)

**Améliorations significatives :**
- Remplacement de `require()` par imports statiques (-50ms par appel)
- HTTP Keep-Alive avec pool de 10 sockets
- Cache simple de 30s pour les requêtes GET fréquentes
- Timeout réduit de 30s à 15s (fail-fast)
- Retries plus rapides (500ms au lieu d'exponential)
- Logging conditionnel (debug mode uniquement)

**Impact estimé : 50-70% plus rapide sur requêtes répétées**

### 🐛 Correction Docker Build (Commit `2e0db5b`)

- Chargement de configuration différé (lazy loading via Proxy)
- Résout l'erreur "DOLIBARR_BASE_URL required" pendant le build Docker

### 🐛 Alias de Paramètres API (Commit `cccc6c6`)

**Compatibilité améliorée :**
- `AddProposalLineArgsSchema` accepte maintenant :
  - `product_id` OU `fk_product`
  - `price` OU `subprice`
- `UpdateProposalLineArgsSchema` accepte `price` comme alias de `subprice`
- Transformation automatique vers les noms Dolibarr corrects

---

## [1.2.0] - 2025-11-26

### 🚀 Modules Avancés Ajoutés (Commit `a6ba923`)

**26 nouveaux outils MCP** répartis sur 4 modules entreprise :

**🔐 Permissions & Audit (9 outils)**
- Gestion des groupes d'utilisateurs (CRUD complet)
- Configuration des permissions par groupe
- Consultation des logs d'audit
- Conformité RGPD/ISO 27001

**🌍 Multi-entités & Devises (5 outils)**
- Gestion multi-filiales/multi-sociétés
- Conversion automatique de devises
- Facturation internationale

**📅 Calendrier & Planning (7 outils)**
- Demandes de congés/absences (CRUD + workflow validation)
- Réservation de ressources (salles, matériel)

**💳 Abonnements SaaS (5 outils)**
- Gestion complète du cycle d'abonnement
- Suivi MRR/ARR et churn

### 📚 Documentation

- `docs/ADVANCED-MODULES.md` - 500+ lignes de documentation des modules
- `docs/API-REFERENCE.md` - 2200+ lignes couvrant 212 outils
- `docs/QUICKSTART-ADVANCED.md` - Guide rapide modules avancés
- `docs/INDEX.md` - Index complet de la documentation

### 🔧 Technique

- 30+ nouveaux schémas Zod de validation
- Intégration des 4 modules dans `server.ts`
- Tests de bout en bout validés

**Métriques :** 212 outils total | ~8000 lignes de code

---

## [1.1.0] - 2025-11-25

### 🎉 Fonctionnalités Avancées (Commit `e1ddd05`)

**16 nouveaux outils** :

- **Projets** : Entrées de temps, tâches, opportunités commerciales (leads)
- **Finance** : Paiements, validation de propositions, contrats
- **Support** : Tickets, événements d'agenda
- **Frais** : Notes de frais, interventions
- **Achats** : Commandes et factures fournisseurs
- **Organisation** : Catégories/tags, envoi d'emails

---

## [1.0.0] - 2025-11-24

### 🎊 Lancement Initial (Commits `24e93bc` à `c3d0f1f`)

**80 outils MCP de base** couvrant l'essentiel de Dolibarr :

**Core Business :**
- 👤 Tiers (thirdparties) - 5 outils CRUD
- 👥 Contacts - 3 outils de gestion
- 📄 Propositions commerciales - 7 outils avec gestion des lignes
- 📦 Commandes - 3 outils avec statuts
- 💰 Factures - 5 outils incluant paiements
- 🏷️ Produits/Services - 5 outils CRUD complets
- 📊 Projets & Tâches - 10 outils avec timesheet
- 👥 Utilisateurs - 4 outils
- 🏦 Banques - 3 outils

**Infrastructure MCP :**
- Architecture SDK officiel @modelcontextprotocol
- Support STDIO + SSE (Server-Sent Events)
- Validation Zod sur tous les inputs
- Retry automatique + gestion erreurs
- Docker Alpine multi-stage optimisé
- Configuration par variables d'environnement (.env)
- Support SSL auto-signé

**Documentation :**
- Guide d'installation (`docs/01-installation.md`)
- Configuration détaillée (`docs/02-configuration.md`)
- Liste complète des outils (`docs/03-tools.md`)
- Docker guide (`docs/04-docker.md`)
- Quickstart (`docs/QUICKSTART.md`)
- Compatibilité API (`docs/COMPATIBILITY.md`)

---

## Légende

- 🚀 **Ajouté** - Nouvelles fonctionnalités
- 🔧 **Modifié** - Changements dans l'existant
- 🐛 **Corrigé** - Corrections de bugs
- 🗑️ **Supprimé** - Fonctionnalités retirées
- 🔒 **Sécurité** - Correctifs de vulnérabilités

---

## Roadmap Prévue

### [1.4.0] - Q1 2025
- 🤖 Webhooks & Notifications temps réel
- ⚡ Workflows automatisés
- 📧 Templates d'emails personnalisables

### [1.5.0] - Q2 2025
- 📥 Import CSV en masse
- 📤 Export multi-formats (CSV, Excel, PDF)
- 🗂️ Opérations groupées (bulk)
- 🔍 Recherche avancée avec filtres

### [1.6.0] - Q3 2025
- 📊 Dashboards BI intégrés
- 📈 Prédictions IA
- 🎯 KPIs personnalisables
- 🔄 Synchronisation bidirectionnelle

---

## Contributeurs

Projet développé pour la communauté Model Context Protocol (MCP) et Dolibarr.

**Support :** Dolibarr 17.0+ | Claude Desktop | Node.js 20+
