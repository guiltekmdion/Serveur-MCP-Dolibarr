# Exploration de l'API Dolibarr

Ce document recense les modules et fonctionnalités de l'API Dolibarr qui ont été identifiés comme pertinents pour une future intégration dans le serveur MCP, suite à l'analyse de la documentation et de la structure de l'API.

## 🔍 Modules Actuellement Couverts

- **Tiers (Thirdparties)** : CRUD complet, Recherche, Enrichissement Auto (SIREN/RCS).
- **Contacts** : CRUD, Liaison Tiers.
- **Propositions Commerciales** : CRUD, Lignes, Statuts.
- **Commandes** : CRUD, Statuts.
- **Factures** : CRUD, Conversion depuis Devis, Paiements.
- **Produits/Services** : Lecture, Recherche.
- **Documents** : Liste, Upload.
- **Projets & Tâches** : CRUD de base.
- **Utilisateurs** : Lecture.
- **Banques** : Lecture des comptes.

## 🚀 Opportunités d'Extension (Roadmap)

Voici les modules disponibles dans l'API Dolibarr qui pourraient enrichir le serveur MCP :

### 1. Gestion des Stocks et Entrepôts (`/warehouses`, `/stockmovements`)
- **Fonctionnalités** :
  - Lister les entrepôts.
  - Consulter le stock par produit/entrepôt.
  - Créer des mouvements de stock (inventaire, transfert).
- **Cas d'usage IA** : "Quel est le stock actuel du produit X ?", "Transfère 5 unités de l'entrepôt A vers B".

### 2. Expéditions (`/shipments`)
- **Fonctionnalités** :
  - Créer une expédition à partir d'une commande.
  - Générer le bon de livraison.
  - Suivre le statut de livraison.
- **Cas d'usage IA** : "Prépare l'expédition pour la commande CO2401-005".

### 3. Contrats et Abonnements (`/contracts`)
- **Fonctionnalités** :
  - Créer des contrats de service.
  - Gérer les dates d'expiration et renouvellements.
- **Cas d'usage IA** : "Crée un contrat de maintenance pour le client Y".

### 4. Tickets et Support (`/tickets`)
- **Fonctionnalités** :
  - Créer des tickets de support.
  - Lire et répondre aux messages.
  - Assigner des tickets.
- **Cas d'usage IA** : "Ouvre un ticket pour le problème signalé par email par M. Dupont".

### 5. Notes de Frais (`/expensereports`)
- **Fonctionnalités** :
  - Créer des notes de frais.
  - Valider/Refuser des notes.
- **Cas d'usage IA** : "Saisis une note de frais de 50€ pour le déplacement à Lyon".

### 6. Agenda et Événements (`/agendaevents`)
- **Fonctionnalités** :
  - Lister les événements (RDV, appels).
  - Créer des événements dans le calendrier.
- **Cas d'usage IA** : "Planifie un appel avec le prospect Z demain à 14h".

### 7. Interventions (`/fichinter`)
- **Fonctionnalités** :
  - Gérer les fiches d'intervention technique.
- **Cas d'usage IA** : "Crée une fiche d'intervention pour la réparation chez le client".

## 🛠 Analyse Technique

L'API Dolibarr est une API REST standard documentée via OpenAPI (Swagger).
- **Point d'entrée** : `/api/index.php/explorer/`
- **Authentification** : `DOLAPIKEY` (Header)
- **Format** : JSON

### Points d'attention pour l'intégration
- **Droits d'accès** : Certains endpoints (comme `/invoices` ou `/bankaccounts`) nécessitent des permissions spécifiques qui peuvent bloquer l'IA si l'utilisateur API n'est pas admin ou correctement configuré (Erreur 401/403).
- **Champs Obligatoires** : Comme vu avec `idprof4` pour les tiers français, certains champs sont obligatoires selon la configuration du pays, ce qui nécessite une logique métier dans le serveur MCP (comme l'enrichissement auto).
