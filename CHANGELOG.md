# Changelog - Serveur MCP Dolibarr

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [2.0.0] - 2024-11-26

### 🎉 Ajouté - Modules Avancés

#### 🔐 Permissions & Audit (9 outils)
- `dolibarr_list_user_groups` - Liste tous les groupes d'utilisateurs
- `dolibarr_get_user_group` - Récupère les détails d'un groupe spécifique
- `dolibarr_create_user_group` - Crée un nouveau groupe d'utilisateurs
- `dolibarr_update_user_group` - Modifie un groupe existant
- `dolibarr_delete_user_group` - Supprime un groupe
- `dolibarr_add_user_to_group` - Ajoute un utilisateur à un groupe
- `dolibarr_remove_user_from_group` - Retire un utilisateur d'un groupe
- `dolibarr_set_user_rights` - Définit les permissions par module pour un utilisateur
- `dolibarr_get_audit_logs` - Récupère les journaux d'audit (qui a fait quoi, quand)

#### 🌍 Multi-entités & Devises (5 outils)
- `dolibarr_list_entities` - Liste toutes les entités/filiales
- `dolibarr_get_entity` - Récupère les détails d'une entité
- `dolibarr_create_entity` - Crée une nouvelle entité (filiale)
- `dolibarr_list_currencies` - Liste toutes les devises disponibles
- `dolibarr_convert_currency` - Convertit un montant entre deux devises

#### 📅 Calendrier & Absences (7 outils)
- `dolibarr_list_holidays` - Liste les demandes de congés/absences
- `dolibarr_get_holiday` - Récupère les détails d'une demande de congé
- `dolibarr_create_holiday` - Crée une nouvelle demande de congé
- `dolibarr_validate_holiday` - Approuve ou refuse une demande de congé
- `dolibarr_delete_holiday` - Supprime une demande de congé
- `dolibarr_create_resource_booking` - Réserve une ressource (salle, véhicule, équipement)
- `dolibarr_list_resource_bookings` - Liste les réservations de ressources

#### 💳 Abonnements SaaS (5 outils)
- `dolibarr_list_subscriptions` - Liste tous les abonnements
- `dolibarr_get_subscription` - Récupère les détails d'un abonnement
- `dolibarr_create_subscription` - Crée un nouvel abonnement récurrent
- `dolibarr_renew_subscription` - Renouvelle un abonnement existant
- `dolibarr_cancel_subscription` - Annule un abonnement actif

### 📚 Documentation
- Ajout de `docs/ADVANCED-MODULES.md` - Documentation complète des modules avancés
- Ajout de `docs/QUICKSTART-ADVANCED.md` - Guide de démarrage rapide
- Ajout de `CHANGELOG-V2.md` - Comparatif des versions
- Ajout de `IMPLEMENTATION-SUMMARY.md` - Résumé de l'implémentation

### 🔧 Améliorations Techniques
- Ajout de 30+ nouveaux schémas Zod pour validation
- Ajout de 40+ nouvelles méthodes dans `DolibarrClient`
- Architecture modulaire améliorée
- Support complet TypeScript

### 📊 Métriques
- **Total outils :** 105+ (contre 80 en v1.8.0)
- **Modules couverts :** 27 (contre 19 en v1.8.0)
- **Lignes de code :** ~8000+ (contre ~5000 en v1.8.0)

---

## [1.8.0] - 2024-11-25

### 🎉 Ajouté

#### 📊 Projets Avancés (6 outils)
- `dolibarr_list_time_entries` - Liste les entrées de temps par projet/tâche/utilisateur
- `dolibarr_list_project_tasks` - Liste les tâches d'un projet spécifique
- `dolibarr_list_leads` - Liste les opportunités commerciales
- `dolibarr_get_lead` - Récupère une opportunité spécifique
- `dolibarr_create_lead` - Crée une nouvelle opportunité
- `dolibarr_update_lead` - Met à jour une opportunité

#### 💰 Fonctionnalités Avancées (10 outils)
- `dolibarr_list_payments` - Liste tous les paiements
- `dolibarr_create_payment` - Enregistre un nouveau paiement
- `dolibarr_validate_proposal` - Valide une proposition commerciale
- `dolibarr_close_proposal` - Clôture une proposition
- `dolibarr_validate_order` - Valide une commande
- `dolibarr_close_order` - Clôture une commande
- `dolibarr_ship_order` - Marque une commande comme expédiée
- `dolibarr_assign_task` - Assigne une tâche à un utilisateur
- `dolibarr_list_members` - Liste les adhérents/membres
- `dolibarr_create_member` - Crée un nouveau membre
- `dolibarr_get_stats` - Récupère des statistiques (CA, top clients, etc.)

#### 📁 Gestion Documentaire (5 outils)
- `dolibarr_download_document` - Télécharge un document (retourne base64)
- `dolibarr_delete_document` - Supprime un document
- `dolibarr_list_documents_for_object` - Liste tous les documents d'un objet
- `dolibarr_generate_pdf` - Génère un PDF officiel
- `dolibarr_send_document_email` - Envoie un document par email

### 📚 Documentation
- Ajout de `docs/50-USE-CASES.md` - 50 cas d'usage concrets

---

## [1.5.0] - 2024-11-20

### 🎉 Ajouté

#### 🏭 Gestion des Stocks (5 outils)
- `dolibarr_list_warehouses` - Liste tous les entrepôts
- `dolibarr_get_warehouse` - Récupère un entrepôt spécifique
- `dolibarr_create_warehouse` - Crée un nouvel entrepôt
- `dolibarr_list_stock_movements` - Liste les mouvements de stock
- `dolibarr_create_stock_movement` - Crée un mouvement de stock

#### 🚚 Logistique (3 outils)
- `dolibarr_list_shipments` - Liste les expéditions
- `dolibarr_get_shipment` - Récupère une expédition
- `dolibarr_create_shipment` - Crée une nouvelle expédition

#### 📝 Gestion Administrative (9 outils)
- `dolibarr_list_contracts` - Liste les contrats
- `dolibarr_get_contract` - Récupère un contrat
- `dolibarr_create_contract` - Crée un nouveau contrat
- `dolibarr_list_tickets` - Liste les tickets support
- `dolibarr_get_ticket` - Récupère un ticket
- `dolibarr_create_ticket` - Crée un nouveau ticket
- `dolibarr_list_agenda_events` - Liste les événements d'agenda
- `dolibarr_get_agenda_event` - Récupère un événement
- `dolibarr_create_agenda_event` - Crée un événement

#### 💼 Gestion des Frais (5 outils)
- `dolibarr_list_expense_reports` - Liste les notes de frais
- `dolibarr_get_expense_report` - Récupère une note de frais
- `dolibarr_create_expense_report` - Crée une note de frais
- `dolibarr_list_interventions` - Liste les interventions
- `dolibarr_get_intervention` - Récupère une intervention
- `dolibarr_create_intervention` - Crée une nouvelle intervention

#### 🛒 Achats & Fournisseurs (4 outils)
- `dolibarr_list_supplier_orders` - Liste les commandes fournisseurs
- `dolibarr_create_supplier_order` - Crée une commande fournisseur
- `dolibarr_list_supplier_invoices` - Liste les factures fournisseurs
- `dolibarr_create_supplier_invoice` - Crée une facture fournisseur

#### 🏷️ Organisation (5 outils)
- `dolibarr_list_categories` - Liste les catégories/tags
- `dolibarr_link_category` - Associe une catégorie à un objet
- `dolibarr_send_email` - Envoie un email via Dolibarr
- `dolibarr_get_server_info` - Récupère les infos serveur

---

## [1.0.0] - 2024-10-15

### 🎉 Version Initiale

#### 🏢 CRM & Tiers (4 outils)
- `dolibarr_get_thirdparty` - Récupère un tiers/client
- `dolibarr_search_thirdparties` - Recherche des tiers
- `dolibarr_create_thirdparty` - Crée un nouveau tiers
- `dolibarr_update_thirdparty` - Met à jour un tiers

#### 👤 Contacts (3 outils)
- `dolibarr_get_contact` - Récupère un contact
- `dolibarr_list_contacts_for_thirdparty` - Liste les contacts d'un tiers
- `dolibarr_create_contact` - Crée un nouveau contact

#### 📄 Propositions Commerciales (7 outils)
- `dolibarr_get_proposal` - Récupère une proposition
- `dolibarr_list_proposals` - Liste les propositions
- `dolibarr_create_proposal` - Crée une nouvelle proposition
- `dolibarr_add_proposal_line` - Ajoute une ligne à une proposition
- `dolibarr_update_proposal_line` - Modifie une ligne
- `dolibarr_delete_proposal_line` - Supprime une ligne
- `dolibarr_change_proposal_status` - Change le statut d'une proposition

#### 📦 Commandes (3 outils)
- `dolibarr_get_order` - Récupère une commande
- `dolibarr_create_order` - Crée une nouvelle commande
- `dolibarr_change_order_status` - Change le statut d'une commande

#### 💰 Factures (5 outils)
- `dolibarr_get_invoice` - Récupère une facture
- `dolibarr_list_invoices` - Liste les factures
- `dolibarr_create_invoice` - Crée une nouvelle facture
- `dolibarr_create_invoice_from_proposal` - Crée une facture depuis une proposition
- `dolibarr_record_invoice_payment` - Enregistre un paiement de facture

#### 🏷️ Produits/Services (5 outils)
- `dolibarr_get_product` - Récupère un produit
- `dolibarr_search_products` - Recherche des produits
- `dolibarr_create_product` - Crée un nouveau produit
- `dolibarr_update_product` - Met à jour un produit
- `dolibarr_delete_product` - Supprime un produit

#### 📊 Projets & Tâches (10 outils)
- `dolibarr_get_project` - Récupère un projet
- `dolibarr_list_projects` - Liste les projets
- `dolibarr_create_project` - Crée un nouveau projet
- `dolibarr_update_project` - Met à jour un projet
- `dolibarr_get_task` - Récupère une tâche
- `dolibarr_create_task` - Crée une nouvelle tâche
- `dolibarr_update_task` - Met à jour une tâche
- `dolibarr_add_task_time` - Ajoute du temps passé sur une tâche
- `dolibarr_list_documents` - Liste les documents
- `dolibarr_upload_document` - Upload un document

#### 👥 Utilisateurs (4 outils)
- `dolibarr_get_user` - Récupère un utilisateur
- `dolibarr_list_users` - Liste les utilisateurs
- `dolibarr_create_user` - Crée un nouvel utilisateur
- `dolibarr_update_user` - Met à jour un utilisateur

#### 🏦 Banques (3 outils)
- `dolibarr_list_bank_accounts` - Liste les comptes bancaires
- `dolibarr_get_bank_account_lines` - Récupère les lignes d'un compte
- `dolibarr_create_bank_account` - Crée un nouveau compte bancaire

### 🔧 Infrastructure
- Architecture MCP avec SDK officiel
- Support Docker avec multi-stage build
- Configuration par variables d'environnement
- Support STDIO et SSE (Server-Sent Events)
- Validation Zod pour tous les inputs
- Gestion d'erreurs robuste
- Retry automatique sur échec API
- Support SSL auto-signé

### 📚 Documentation
- `README.md` - Documentation principale
- `docs/01-installation.md` - Guide d'installation
- `docs/02-configuration.md` - Guide de configuration
- `docs/03-tools.md` - Liste complète des outils
- `docs/04-docker.md` - Utilisation Docker
- `docs/QUICKSTART.md` - Démarrage rapide
- `docs/COMPATIBILITY.md` - Compatibilité API

---

## Légende des Types de Changements

- 🎉 **Ajouté** - Nouvelles fonctionnalités
- 🔧 **Modifié** - Changements dans les fonctionnalités existantes
- 🐛 **Corrigé** - Corrections de bugs
- 🗑️ **Supprimé** - Fonctionnalités retirées
- ⚠️ **Déprécié** - Fonctionnalités bientôt supprimées
- 🔒 **Sécurité** - Correctifs de vulnérabilités

---

## Roadmap

### [2.1.0] - Prévu Q1 2025
- 🤖 Webhooks & Notifications temps réel
- ⚡ Workflows automatisés
- 📧 Templates d'emails personnalisables
- 🔄 Déclencheurs événementiels

### [2.2.0] - Prévu Q2 2025
- 📥 Import CSV en masse
- 📤 Export multi-formats (CSV, Excel, PDF)
- 🗂️ Bulk operations
- 🔍 Recherche avancée avec filtres

### [2.3.0] - Prévu Q3 2025
- 📊 Dashboards BI intégrés
- 📈 Prédictions IA
- 🎯 KPIs personnalisables
- 📉 Analyse de tendances

---

## Support des Versions

| Version | Support | Fin de support |
|---------|---------|----------------|
| 2.0.x | ✅ Actif | - |
| 1.8.x | ⚠️ Sécurité uniquement | 2025-03-31 |
| 1.5.x | ❌ Non supporté | 2024-12-31 |
| 1.0.x | ❌ Non supporté | 2024-11-30 |

---

## Migration entre Versions

### De v1.8.0 vers v2.0.0
- ✅ Rétrocompatibilité complète
- ✅ Aucun breaking change
- ✅ Nouveaux outils additionnels uniquement
- 📝 Mise à jour recommandée pour nouveaux modules

### De v1.5.0 vers v1.8.0
- ✅ Rétrocompatibilité complète
- ⚠️ Nouveaux schémas de validation (non bloquants)

### De v1.0.0 vers v1.5.0
- ✅ Rétrocompatibilité complète
- ⚠️ Nouvelles dépendances npm

---

**Développé par Maxime DION (Guiltek)**  
**Site :** https://guiltek.com  
**Email :** contact@guiltek.com  
**GitHub :** https://github.com/guiltekmdion/Serveur-MCP-Dolibarr
