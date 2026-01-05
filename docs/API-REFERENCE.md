# 📖 API Reference - Serveur MCP Dolibarr

Documentation exhaustive de tous les outils MCP et méthodes API disponibles.

---

## Table des Matières

1. [CRM & Tiers](#crm--tiers)
2. [Contacts](#contacts)
3. [Propositions Commerciales](#propositions-commerciales)
4. [Commandes](#commandes)
5. [Factures](#factures)
6. [Produits/Services](#produitsservices)
7. [Projets](#projets)
8. [Tâches](#tâches)
9. [Documents](#documents)
10. [Utilisateurs](#utilisateurs)
11. [Banques](#banques)
12. [Entrepôts](#entrepôts)
13. [Stock](#stock)
14. [Expéditions](#expéditions)
15. [Contrats](#contrats)
16. [Tickets Support](#tickets-support)
17. [Fournisseurs](#fournisseurs)
18. [Catégories](#catégories)
19. [Agenda](#agenda)
20. [Notes de Frais](#notes-de-frais)
21. [Interventions](#interventions)
22. [Leads/Opportunités](#leadsopportunités)
23. [Paiements](#paiements)
24. [Membres/Adhérents](#membresadhérents)
25. [Statistiques](#statistiques)
26. [Permissions & Audit](#permissions--audit)
27. [Multi-entités & Devises](#multi-entités--devises)
28. [Calendrier & Absences](#calendrier--absences)
29. [Abonnements](#abonnements)
30. [Utilitaires](#utilitaires)

---

## CRM & Tiers

### `dolibarr_get_thirdparty`

Récupère les informations détaillées d'un tiers/client.

**Paramètres :**
```typescript
{
  id: string;  // ID du tiers
}
```

**Retour :**
```typescript
{
  id: string;
  nom: string;
  name_alias?: string;
  client: string;  // 0=Ni client ni prospect, 1=Client, 2=Prospect, 3=Client et prospect
  fournisseur: string;
  address?: string;
  zip?: string;
  town?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  url?: string;
  siren?: string;
  siret?: string;
  ape?: string;
  tva_intra?: string;
  // ... autres champs
}
```

**Exemple :**
```typescript
dolibarr_get_thirdparty({ id: "42" })
```

---

### `dolibarr_search_thirdparties`

Recherche des tiers selon des critères.

**Paramètres :**
```typescript
{
  sqlfilters?: string;  // Filtres SQL (ex: "(t.nom:like:'%ACME%')")
  limit?: number;       // Nombre max de résultats (défaut: 100)
  sortfield?: string;   // Champ de tri (ex: "t.nom")
  sortorder?: string;   // Ordre: "ASC" ou "DESC"
}
```

**Retour :** Array de ThirdParty

**Exemple :**
```typescript
dolibarr_search_thirdparties({
  sqlfilters: "(t.nom:like:'%Consulting%')",
  limit: 50,
  sortfield: "t.nom",
  sortorder: "ASC"
})
```

---

### `dolibarr_create_thirdparty`

Crée un nouveau tiers/client.

**Paramètres :**
```typescript
{
  name: string;           // Nom du tiers (requis)
  name_alias?: string;    // Nom commercial
  client: string;         // "1"=Client, "2"=Prospect, "3"=Les deux
  address?: string;
  zip?: string;
  town?: string;
  country_code?: string;  // Code ISO (FR, US, GB, etc.)
  phone?: string;
  email?: string;
  url?: string;
  siren?: string;         // SIREN (France)
  siret?: string;         // SIRET (France)
  code_compta?: string;   // Code comptable
  code_compta_fournisseur?: string;
}
```

**Retour :**
```typescript
{
  success: boolean;
  id: string;
  message: string;
}
```

**Exemple :**
```typescript
dolibarr_create_thirdparty({
  name: "ACME Corporation",
  name_alias: "ACME",
  client: "1",
  address: "123 Main Street",
  zip: "75001",
  town: "Paris",
  country_code: "FR",
  email: "contact@acme.com",
  phone: "+33 1 23 45 67 89"
})
```

---

### `dolibarr_update_thirdparty`

Met à jour un tiers existant.

**Paramètres :**
```typescript
{
  id: string;             // ID du tiers (requis)
  name?: string;
  name_alias?: string;
  address?: string;
  zip?: string;
  town?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  url?: string;
  client?: string;
  // ... autres champs modifiables
}
```

**Retour :**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## Contacts

### `dolibarr_get_contact`

Récupère un contact spécifique.

**Paramètres :**
```typescript
{
  id: string;  // ID du contact
}
```

**Retour :**
```typescript
{
  id: string;
  lastname: string;
  firstname: string;
  email?: string;
  phone?: string;
  socid?: string;  // ID du tiers associé
  poste?: string;  // Fonction
  statut: string;  // 0=Inactif, 1=Actif
  // ... autres champs
}
```

---

### `dolibarr_list_contacts_for_thirdparty`

Liste tous les contacts d'un tiers.

**Paramètres :**
```typescript
{
  thirdparty_id: string;  // ID du tiers
}
```

**Retour :** Array de Contact

---

### `dolibarr_create_contact`

Crée un nouveau contact.

**Paramètres :**
```typescript
{
  socid: string;         // ID du tiers (requis)
  lastname: string;      // Nom (requis)
  firstname: string;     // Prénom (requis)
  email?: string;
  phone?: string;
  poste?: string;        // Fonction (ex: "Directeur", "Chef de projet")
  address?: string;
  zip?: string;
  town?: string;
  country_code?: string;
}
```

**Retour :**
```typescript
{
  success: boolean;
  id: string;
  message: string;
}
```

---

## Propositions Commerciales

### `dolibarr_get_proposal`

Récupère une proposition commerciale.

**Paramètres :**
```typescript
{
  id: string;  // ID de la proposition
}
```

**Retour :**
```typescript
{
  id: string;
  ref: string;
  socid: string;
  date: number;
  fin_validite?: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  statut: string;  // 0=Brouillon, 1=Validée, 2=Signée, 3=Refusée, 4=Pas de réponse
  lines: Array<{
    id: string;
    fk_product?: string;
    desc: string;
    qty: number;
    subprice: number;
    tva_tx: number;
    total_ht: number;
    total_ttc: number;
  }>;
  // ... autres champs
}
```

---

### `dolibarr_list_proposals`

Liste les propositions avec filtres.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
  sortfield?: string;
  sortorder?: string;
}
```

**Retour :** Array de Proposal

---

### `dolibarr_create_proposal`

Crée une nouvelle proposition commerciale.

**Paramètres :**
```typescript
{
  socid: string;           // ID du tiers (requis)
  date?: number;           // Timestamp UNIX (défaut: maintenant)
  duree_validite?: number; // Durée de validité en jours
  cond_reglement_id?: string;
  mode_reglement_id?: string;
  note_public?: string;
  note_private?: string;
}
```

**Retour :**
```typescript
{
  success: boolean;
  id: string;
  message: string;
}
```

---

### `dolibarr_add_proposal_line`

Ajoute une ligne à une proposition.

**Paramètres :**
```typescript
{
  proposal_id: string;     // ID de la proposition (requis)
  fk_product?: string;     // ID du produit (si produit existant)
  desc: string;            // Description (requis)
  qty: number;             // Quantité (requis)
  subprice: number;        // Prix unitaire HT (requis)
  tva_tx?: number;         // Taux de TVA (défaut: 20)
  remise_percent?: number; // Remise en %
}
```

**Retour :**
```typescript
{
  success: boolean;
  line_id: string;
  message: string;
}
```

---

### `dolibarr_update_proposal_line`

Modifie une ligne d'une proposition.

**Paramètres :**
```typescript
{
  proposal_id: string;
  line_id: string;
  desc?: string;
  qty?: number;
  subprice?: number;
  tva_tx?: number;
  remise_percent?: number;
}
```

---

### `dolibarr_delete_proposal_line`

Supprime une ligne d'une proposition.

**Paramètres :**
```typescript
{
  proposal_id: string;
  line_id: string;
}
```

---

### `dolibarr_change_proposal_status`

Change le statut d'une proposition.

**Paramètres :**
```typescript
{
  proposal_id: string;
  status: string;  // "0"=Brouillon, "1"=Validée, "2"=Signée, "3"=Refusée, "4"=Pas de réponse
}
```

---

## Commandes

### `dolibarr_get_order`

Récupère une commande client.

**Paramètres :**
```typescript
{
  id: string;
}
```

**Retour :** Structure similaire à Proposal

---

### `dolibarr_create_order`

Crée une nouvelle commande.

**Paramètres :**
```typescript
{
  socid: string;
  date?: number;
  cond_reglement_id?: string;
  mode_reglement_id?: string;
  note_public?: string;
  note_private?: string;
}
```

---

### `dolibarr_change_order_status`

Change le statut d'une commande.

**Paramètres :**
```typescript
{
  order_id: string;
  status: string;  // "0"=Brouillon, "1"=Validée, "2"=Expédiée, "3"=Facturée, "-1"=Annulée
}
```

---

## Factures

### `dolibarr_get_invoice`

Récupère une facture.

**Paramètres :**
```typescript
{
  id: string;
}
```

**Retour :**
```typescript
{
  id: string;
  ref: string;
  socid: string;
  type: string;  // 0=Standard, 1=Acompte, 2=Avoir
  date: number;
  date_lim_reglement?: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  paye: string;  // 0=Impayée, 1=Payée
  statut: string;
  lines: Array<InvoiceLine>;
  // ... autres champs
}
```

---

### `dolibarr_list_invoices`

Liste les factures avec filtres.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
  sortfield?: string;
  sortorder?: string;
}
```

---

### `dolibarr_create_invoice`

Crée une nouvelle facture.

**Paramètres :**
```typescript
{
  socid: string;
  type?: string;           // "0"=Standard (défaut)
  date?: number;
  date_lim_reglement?: number;
  cond_reglement_id?: string;
  mode_reglement_id?: string;
  note_public?: string;
  note_private?: string;
}
```

---

### `dolibarr_create_invoice_from_proposal`

Crée une facture à partir d'une proposition validée.

**Paramètres :**
```typescript
{
  proposal_id: string;
}
```

---

### `dolibarr_record_invoice_payment`

Enregistre un paiement sur une facture.

**Paramètres :**
```typescript
{
  invoice_id: string;
  date: number;         // Timestamp UNIX
  payment_mode_id: string;
  amount: number;       // Montant du paiement
  num_payment?: string; // Numéro de chèque/virement
  note?: string;
}
```

---

## Produits/Services

### `dolibarr_get_product`

Récupère un produit/service.

**Paramètres :**
```typescript
{
  id: string;
}
```

**Retour :**
```typescript
{
  id: string;
  ref: string;
  label: string;
  description?: string;
  type: string;  // "0"=Produit, "1"=Service
  price: number;
  price_ttc: number;
  tva_tx: number;
  stock_reel?: number;
  seuil_stock_alerte?: number;
  status: string;  // "0"=Hors vente, "1"=En vente
  // ... autres champs
}
```

---

### `dolibarr_search_products`

Recherche des produits.

**Paramètres :**
```typescript
{
  sqlfilters?: string;
  limit?: number;
  sortfield?: string;
  sortorder?: string;
}
```

---

### `dolibarr_create_product`

Crée un nouveau produit/service.

**Paramètres :**
```typescript
{
  ref: string;          // Référence unique (requis)
  label: string;        // Libellé (requis)
  type: string;         // "0"=Produit, "1"=Service (requis)
  description?: string;
  price?: number;       // Prix HT
  tva_tx?: number;      // Taux de TVA (défaut: 20)
  status?: string;      // "1"=En vente (défaut)
  stock_reel?: number;
  seuil_stock_alerte?: number;
}
```

---

### `dolibarr_update_product`

Met à jour un produit.

**Paramètres :**
```typescript
{
  id: string;
  ref?: string;
  label?: string;
  description?: string;
  price?: number;
  tva_tx?: number;
  status?: string;
  // ... autres champs modifiables
}
```

---

### `dolibarr_delete_product`

Supprime un produit.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

## Projets

### `dolibarr_get_project`

Récupère un projet.

**Paramètres :**
```typescript
{
  id: string;
}
```

**Retour :**
```typescript
{
  id: string;
  ref: string;
  title: string;
  description?: string;
  socid?: string;
  date_start?: number;
  date_end?: number;
  budget_amount?: number;
  statut: string;  // "0"=Brouillon, "1"=Validé, "2"=Terminé
  // ... autres champs
}
```

---

### `dolibarr_list_projects`

Liste les projets avec filtres.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_project`

Crée un nouveau projet.

**Paramètres :**
```typescript
{
  ref: string;
  title: string;
  socid?: string;
  description?: string;
  date_start?: number;
  date_end?: number;
  budget_amount?: number;
  usage_opportunity?: number;  // 1=Opportunité commerciale
}
```

---

### `dolibarr_update_project`

Met à jour un projet.

**Paramètres :**
```typescript
{
  id: string;
  ref?: string;
  title?: string;
  description?: string;
  date_start?: number;
  date_end?: number;
  budget_amount?: number;
}
```

---

## Tâches

### `dolibarr_get_task`

Récupère une tâche.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_task`

Crée une nouvelle tâche.

**Paramètres :**
```typescript
{
  fk_project: string;   // ID du projet (requis)
  ref: string;          // Référence (requis)
  label: string;        // Libellé (requis)
  description?: string;
  date_start?: number;
  date_end?: number;
  planned_workload?: number;  // Charge prévisionnelle en secondes
}
```

---

### `dolibarr_update_task`

Met à jour une tâche.

**Paramètres :**
```typescript
{
  id: string;
  ref?: string;
  label?: string;
  description?: string;
  date_start?: number;
  date_end?: number;
  progress?: number;  // % d'avancement (0-100)
}
```

---

### `dolibarr_add_task_time`

Enregistre du temps passé sur une tâche.

**Paramètres :**
```typescript
{
  task_id: string;
  date: number;         // Timestamp UNIX
  duration: number;     // Durée en secondes
  user_id: string;      // ID de l'utilisateur
  note?: string;
}
```

---

### `dolibarr_list_time_entries`

Liste les entrées de temps avec filtres.

**Paramètres :**
```typescript
{
  project_id?: string;
  task_id?: string;
  user_id?: string;
  year?: number;
  month?: number;
  limit?: number;
}
```

**Retour :**
```typescript
Array<{
  id: string;
  fk_task: string;
  fk_user: string;
  datec: number;
  task_duration: number;  // En secondes
  note?: string;
}>
```

---

### `dolibarr_list_project_tasks`

Liste toutes les tâches d'un projet.

**Paramètres :**
```typescript
{
  project_id: string;
}
```

---

### `dolibarr_assign_task`

Assigne une tâche à un utilisateur.

**Paramètres :**
```typescript
{
  task_id: string;
  user_id: string;
}
```

---

## Documents

### `dolibarr_list_documents`

Liste les documents d'un objet.

**Paramètres :**
```typescript
{
  module: string;       // Type: "invoice", "propal", "order", "project", etc.
  id: string;           // ID de l'objet
}
```

---

### `dolibarr_upload_document`

Upload un document.

**Paramètres :**
```typescript
{
  module: string;
  id: string;
  filename: string;
  filebase64: string;   // Contenu du fichier en base64
  subdir?: string;
  overwrite?: string;   // "0" ou "1"
}
```

---

### `dolibarr_download_document`

Télécharge un document.

**Paramètres :**
```typescript
{
  module: string;
  id: string;
  filename: string;
}
```

**Retour :**
```typescript
{
  filename: string;
  content: string;      // Contenu en base64
  mime_type: string;
}
```

---

### `dolibarr_delete_document`

Supprime un document.

**Paramètres :**
```typescript
{
  module: string;
  id: string;
  filename: string;
}
```

---

### `dolibarr_list_documents_for_object`

Liste tous les documents d'un objet avec métadonnées.

**Paramètres :**
```typescript
{
  module: string;
  id: string;
}
```

**Retour :**
```typescript
Array<{
  name: string;
  path: string;
  size: number;
  date: number;
  type: string;  // "file" ou "dir"
}>
```

---

### `dolibarr_generate_pdf`

Génère le PDF officiel d'un document.

**Paramètres :**
```typescript
{
  module: string;  // "invoice", "propal", "order"
  id: string;
}
```

---

### `dolibarr_send_document_email`

Envoie un document par email.

**Paramètres :**
```typescript
{
  module: string;
  id: string;
  sendto: string;      // Email destinataire
  subject?: string;
  message?: string;
}
```

---

## Utilisateurs

### `dolibarr_get_user`

Récupère un utilisateur.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_list_users`

Liste tous les utilisateurs.

**Paramètres :**
```typescript
{
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_user`

Crée un nouvel utilisateur.

**Paramètres :**
```typescript
{
  login: string;
  lastname: string;
  firstname: string;
  email?: string;
  phone?: string;
  admin?: string;      // "0" ou "1"
  password?: string;
}
```

---

### `dolibarr_update_user`

Met à jour un utilisateur.

**Paramètres :**
```typescript
{
  id: string;
  login?: string;
  lastname?: string;
  firstname?: string;
  email?: string;
  phone?: string;
}
```

---

## Banques

### `dolibarr_list_bank_accounts`

Liste tous les comptes bancaires.

**Paramètres :**
```typescript
{
  limit?: number;
}
```

---

### `dolibarr_get_bank_account_lines`

Récupère les lignes d'un compte bancaire.

**Paramètres :**
```typescript
{
  account_id: string;
  sqlfilters?: string;
}
```

---

### `dolibarr_create_bank_account`

Crée un nouveau compte bancaire.

**Paramètres :**
```typescript
{
  label: string;
  bank?: string;         // Nom de la banque
  code_banque?: string;
  code_guichet?: string;
  number?: string;       // Numéro de compte
  cle_rib?: string;
  bic?: string;
  iban?: string;
  currency_code?: string;
  account_number?: string;
}
```

---

## Entrepôts

### `dolibarr_list_warehouses`

Liste tous les entrepôts.

**Paramètres :**
```typescript
{
  limit?: number;
}
```

---

### `dolibarr_get_warehouse`

Récupère un entrepôt spécifique.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_warehouse`

Crée un nouvel entrepôt.

**Paramètres :**
```typescript
{
  label: string;
  description?: string;
  lieu?: string;         // Adresse
  fk_parent?: string;    // ID entrepôt parent
}
```

---

## Stock

### `dolibarr_list_stock_movements`

Liste les mouvements de stock.

**Paramètres :**
```typescript
{
  product_id?: string;
  warehouse_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_stock_movement`

Crée un mouvement de stock.

**Paramètres :**
```typescript
{
  product_id: string;
  warehouse_id: string;
  qty: number;          // Quantité (positif=entrée, négatif=sortie)
  type: string;         // "0"=Mouvement interne, "1"=Entrée, "2"=Sortie, "3"=Transfert
  label?: string;
  price?: number;
  lot?: string;
  dlc?: number;         // Date limite de consommation
  dluo?: number;        // Date limite d'utilisation optimale
}
```

---

## Expéditions

### `dolibarr_list_shipments`

Liste les expéditions.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_shipment`

Récupère une expédition.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_shipment`

Crée une nouvelle expédition.

**Paramètres :**
```typescript
{
  socid: string;
  origin_id?: string;    // ID de la commande source
  date_expedition?: number;
  note_public?: string;
  note_private?: string;
}
```

---

## Contrats

### `dolibarr_list_contracts`

Liste les contrats.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_contract`

Récupère un contrat.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_contract`

Crée un nouveau contrat.

**Paramètres :**
```typescript
{
  socid: string;
  commercial_signature_id: string; // ID du commercial signataire (requis)
  commercial_suivi_id: string;     // ID du commercial de suivi (requis)
  ref?: string;
  date_contrat?: number;
  note_public?: string;
  note_private?: string;
}
```

---

## Tickets Support

### `dolibarr_list_tickets`

Liste les tickets de support.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_ticket`

Récupère un ticket.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_ticket`

Crée un nouveau ticket.

**Paramètres :**
```typescript
{
  subject: string;
  message: string;
  category_code?: string;
  severity_code?: string;
  socid?: string;
  fk_user_create?: string;
  notify_tiers_at_create?: string;  // "0" ou "1"
}
```

---

## Fournisseurs

### `dolibarr_list_supplier_orders`

Liste les commandes fournisseurs.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_supplier_order`

Crée une commande fournisseur.

**Paramètres :**
```typescript
{
  socid: string;
  ref_supplier: string;
  date?: number;
  cond_reglement_id?: string;
  mode_reglement_id?: string;
}
```

---

### `dolibarr_list_supplier_invoices`

Liste les factures fournisseurs.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_supplier_invoice`

Crée une facture fournisseur.

**Paramètres :**
```typescript
{
  socid: string;
  ref_supplier: string;
  date?: number;
  type?: string;  // "0"=Standard, "2"=Avoir
}
```

---

## Catégories

### `dolibarr_list_categories`

Liste les catégories/tags.

**Paramètres :**
```typescript
{
  type: string;    // "customer", "supplier", "product", "member", etc.
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_link_category`

Associe une catégorie à un objet.

**Paramètres :**
```typescript
{
  category_id: string;
  object_type: string;  // "customer", "product", etc.
  object_id: string;
}
```

---

## Agenda

### `dolibarr_list_agenda_events`

Liste les événements d'agenda.

**Paramètres :**
```typescript
{
  user_id?: string;
  project_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_agenda_event`

Récupère un événement.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_agenda_event`

Crée un événement.

**Paramètres :**
```typescript
{
  label: string;
  datep: number;        // Timestamp début
  datef?: number;       // Timestamp fin
  type_code?: string;
  note?: string;
  fk_project?: string;
  userownerid?: string;
}
```

---

## Notes de Frais

### `dolibarr_list_expense_reports`

Liste les notes de frais.

**Paramètres :**
```typescript
{
  user_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_expense_report`

Récupère une note de frais.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_expense_report`

Crée une note de frais.

**Paramètres :**
```typescript
{
  user_id: string;      // ID utilisateur (requis)
  date_debut: number;
  date_fin: number;
  note_public?: string;
  note_private?: string;
}
```

---

## Interventions

### `dolibarr_list_interventions`

Liste les interventions (fichinter).

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_intervention`

Récupère une intervention.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_intervention`

Crée une intervention.

**Paramètres :**
```typescript
{
  socid: string;
  fk_project: string;   // ID du projet (requis)
  description: string;
  date?: number;
  duration?: number;
}
```

---

## Leads/Opportunités

### `dolibarr_list_leads`

Liste les opportunités commerciales.

**Paramètres :**
```typescript
{
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_get_lead`

Récupère une opportunité.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_lead`

Crée une opportunité.

**Paramètres :**
```typescript
{
  ref: string;
  title: string;
  socid?: string;
  amount?: number;
  percent?: number;      // % de chance de réussite
  fk_opp_status?: string;
  date_close?: number;   // Date de clôture prévue
}
```

---

### `dolibarr_update_lead`

Met à jour une opportunité.

**Paramètres :**
```typescript
{
  id: string;
  title?: string;
  amount?: number;
  percent?: number;
  fk_opp_status?: string;
}
```

---

## Paiements

### `dolibarr_list_payments`

Liste tous les paiements.

**Paramètres :**
```typescript
{
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_payment`

Enregistre un nouveau paiement.

**Paramètres :**
```typescript
{
  datepaye: number;
  paiementid: string;   // Mode de paiement
  closepaidinvoices: string;  // "yes" ou "no"
  accountid: string;    // ID du compte bancaire
  num_paiement?: string;
  comment?: string;
  amounts: Record<string, number>;  // { "invoice_id": amount }
}
```

---

## Membres/Adhérents

### `dolibarr_list_members`

Liste les membres/adhérents.

**Paramètres :**
```typescript
{
  sqlfilters?: string;
  limit?: number;
}
```

---

### `dolibarr_create_member`

Crée un nouveau membre.

**Paramètres :**
```typescript
{
  civility_id?: string;
  lastname: string;
  firstname: string;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  town?: string;
  typeid: string;       // Type de membre
  morphy: string;       // "phy"=Physique, "mor"=Morale
}
```

---

## Statistiques

### `dolibarr_get_stats`

Récupère diverses statistiques.

**Paramètres :**
```typescript
{
  type: string;  // "ca", "proposals", "orders", "invoices", "payments", "top_customers"
  year?: number;
  month?: number;
  limit?: number;
}
```

**Types disponibles :**
- `ca` : Chiffre d'affaires
- `proposals` : Stats des propositions
- `orders` : Stats des commandes
- `invoices` : Stats des factures
- `payments` : Stats des paiements
- `top_customers` : Top clients par CA

---

## Permissions & Audit

### `dolibarr_list_user_groups`

Liste tous les groupes d'utilisateurs.

**Paramètres :**
```typescript
{
  limit?: number;
}
```

---

### `dolibarr_get_user_group`

Récupère un groupe spécifique.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_user_group`

Crée un nouveau groupe.

**Paramètres :**
```typescript
{
  name: string;
  note?: string;
}
```

---

### `dolibarr_update_user_group`

Met à jour un groupe.

**Paramètres :**
```typescript
{
  id: string;
  name?: string;
  note?: string;
}
```

---

### `dolibarr_delete_user_group`

Supprime un groupe.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_add_user_to_group`

Ajoute un utilisateur à un groupe.

**Paramètres :**
```typescript
{
  group_id: string;
  user_id: string;
}
```

---

### `dolibarr_remove_user_from_group`

Retire un utilisateur d'un groupe.

**Paramètres :**
```typescript
{
  group_id: string;
  user_id: string;
}
```

---

### `dolibarr_set_user_rights`

Définit une permission spécifique.

**Paramètres :**
```typescript
{
  user_id: string;
  module: string;       // "societe", "facture", "propale", "projet", etc.
  permission: string;   // "lire", "creer", "modifier", "supprimer", "valider"
  value: string;        // "0"=Refusé, "1"=Accordé
}
```

---

### `dolibarr_get_audit_logs`

Récupère les journaux d'audit.

**Paramètres :**
```typescript
{
  user_id?: string;
  action?: string;      // "CREATE", "UPDATE", "DELETE", "LOGIN", "VALIDATE"
  limit?: number;
  date_start?: number;
  date_end?: number;
}
```

---

## Multi-entités & Devises

### `dolibarr_list_entities`

Liste toutes les entités.

**Paramètres :**
```typescript
{
  limit?: number;
}
```

---

### `dolibarr_get_entity`

Récupère une entité.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_entity`

Crée une nouvelle entité/filiale.

**Paramètres :**
```typescript
{
  label: string;
  description?: string;
}
```

---

### `dolibarr_list_currencies`

Liste toutes les devises.

**Paramètres :**
```typescript
{
  active?: string;  // "0"=Toutes, "1"=Actives uniquement
}
```

---

### `dolibarr_convert_currency`

Convertit un montant entre devises.

**Paramètres :**
```typescript
{
  amount: number;
  from_currency: string;  // Code ISO (EUR, USD, GBP, etc.)
  to_currency: string;
  date?: number;          // Date pour le taux de change
}
```

**Retour :**
```typescript
{
  original_amount: number;
  original_currency: string;
  converted_amount: number;
  target_currency: string;
  exchange_rate: number;
  date: number;
}
```

---

## Calendrier & Absences

### `dolibarr_list_holidays`

Liste les demandes de congés.

**Paramètres :**
```typescript
{
  user_id?: string;
  status?: string;  // "1"=Brouillon, "2"=Validée, "3"=Approuvée, "4"=Refusée
  year?: number;
  limit?: number;
}
```

---

### `dolibarr_get_holiday`

Récupère une demande de congé.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_holiday`

Crée une demande de congé.

**Paramètres :**
```typescript
{
  fk_user: string;
  date_debut: number;
  date_fin: number;
  halfday?: string;     // "0"=Jour entier, "1"=Matin, "2"=Après-midi
  fk_type?: string;     // Type de congé
  description?: string;
}
```

---

### `dolibarr_validate_holiday`

Approuve/Refuse un congé.

**Paramètres :**
```typescript
{
  id: string;
  approve: boolean;
}
```

---

### `dolibarr_delete_holiday`

Supprime une demande.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_resource_booking`

Réserve une ressource.

**Paramètres :**
```typescript
{
  resource_id: string;
  user_id: string;
  date_start: number;
  date_end: number;
  note?: string;
}
```

---

### `dolibarr_list_resource_bookings`

Liste les réservations.

**Paramètres :**
```typescript
{
  resource_id?: string;
  user_id?: string;
}
```

---

## Abonnements

### `dolibarr_list_subscriptions`

Liste les abonnements.

**Paramètres :**
```typescript
{
  thirdparty_id?: string;
  status?: string;  // "0"=Brouillon, "1"=Validé, "-1"=Annulé
  limit?: number;
}
```

---

### `dolibarr_get_subscription`

Récupère un abonnement.

**Paramètres :**
```typescript
{
  id: string;
}
```

---

### `dolibarr_create_subscription`

Crée un abonnement.

**Paramètres :**
```typescript
{
  socid: string;
  fk_product?: string;
  date_start: number;
  date_end?: number;
  amount: number;
  note?: string;
  recurring?: boolean;
  frequency?: string;   // "monthly", "quarterly", "yearly"
}
```

---

### `dolibarr_renew_subscription`

Renouvelle un abonnement.

**Paramètres :**
```typescript
{
  id: string;
  duration?: number;    // Durée en mois (défaut: 12)
}
```

---

### `dolibarr_cancel_subscription`

Annule un abonnement.

**Paramètres :**
```typescript
{
  id: string;
  note?: string;
}
```

---

## Utilitaires

### `dolibarr_send_email`

Envoie un email via Dolibarr.

**Paramètres :**
```typescript
{
  sendto: string;
  subject: string;
  message: string;
  from?: string;
  sendtocc?: string;
  sendtobcc?: string;
}
```

---

### `dolibarr_get_server_info`

Récupère les informations serveur.

**Paramètres :** Aucun

**Retour :**
```typescript
{
  dolibarr_version: string;
  dolibarr_api_version: string;
  modules: string[];
}
```

---

## Codes d'Erreur

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 204 | Succès (pas de contenu) |
| 400 | Bad Request (paramètres invalides) |
| 401 | Non authentifié (token invalide) |
| 403 | Interdit (permissions insuffisantes) |
| 404 | Non trouvé |
| 409 | Conflit (ex: ref déjà existante) |
| 500 | Erreur serveur |

---

## Formats de Date

Toutes les dates utilisent des **timestamps UNIX** (secondes depuis le 1er janvier 1970).

**Exemple :**
```typescript
const now = Math.floor(Date.now() / 1000);
const demain = now + 86400;  // +24h
```

---

## Pagination & Limites

Par défaut, les listes retournent max **100 résultats**.

Pour paginer :
```typescript
// Page 1
dolibarr_list_proposals({ limit: 50, sortfield: "t.rowid", sortorder: "ASC" })

// Page 2
dolibarr_list_proposals({ 
  limit: 50, 
  sortfield: "t.rowid", 
  sortorder: "ASC",
  sqlfilters: "(t.rowid:>:50)"
})
```

---

## Filtres SQL

Format : `(champ:operateur:valeur)`

**Opérateurs :**
- `:=:` : Égal
- `:>:` : Supérieur
- `:<:` : Inférieur
- `:>=:` : Supérieur ou égal
- `:<=:` : Inférieur ou égal
- `:like:` : Contient
- `:!=:` : Différent

**Exemples :**
```typescript
"(t.nom:like:'%ACME%')"
"(t.datec:>:'2024-01-01')"
"(t.client:=:1)"
```

---

**Total : 212 outils documentés**

**Version : 2.0.0**  
**Auteur : Maxime DION (Guiltek)**  
**Dernière mise à jour : 26 Novembre 2024**
