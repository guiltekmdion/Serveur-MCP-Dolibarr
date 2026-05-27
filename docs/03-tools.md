# Outils MCP Disponibles

Le serveur MCP Dolibarr expose les outils suivants pour interagir avec votre instance Dolibarr.

## 📇 Gestion des Tiers

### `dolibarr_get_thirdparty`

Récupérer les détails complets d'un tiers (client, prospect ou fournisseur) par son ID.

**Paramètres:**
- `id` (string, obligatoire) : L'ID du tiers dans Dolibarr

**Exemple d'utilisation dans Claude:**
```
Récupère-moi les informations du tiers avec l'ID 42
```

**Réponse:**
```json
{
  "id": "42",
  "name": "Entreprise ABC",
  "name_alias": "ABC",
  "code_client": "CU2024-001",
  "email": "contact@abc.com",
  "phone": "+33123456789",
  "address": "123 rue Example",
  "zip": "75001",
  "town": "Paris",
  "status": "1"
}
```

---

### `dolibarr_search_thirdparties`

Rechercher des tiers par nom.

**Paramètres:**
- `query` (string, obligatoire) : La requête de recherche (nom du tiers)

**Exemple d'utilisation dans Claude:**
```
Trouve-moi tous les tiers qui contiennent "Entreprise" dans leur nom
```

**Réponse:**
```json
[
  {
    "id": "42",
    "name": "Entreprise ABC",
    "code_client": "CU2024-001",
    "email": "contact@abc.com"
  },
  {
    "id": "43",
    "name": "Entreprise XYZ",
    "code_client": "CU2024-002",
    "email": "contact@xyz.com"
  }
]
```

---

### `dolibarr_create_thirdparty`

Créer un nouveau tiers (client, prospect ou fournisseur).

**Fonctionnalité Spéciale : Enrichissement Automatique**
Si vous créez une entreprise française (ou sans pays spécifié) sans fournir d'adresse, le serveur interrogera automatiquement l'API `api.gouv.fr` pour récupérer :
- L'adresse du siège
- Le code postal et la ville
- Les identifiants légaux (SIREN, SIRET, NAF, RCS)

**Paramètres:**
- `name` (string, obligatoire) : Nom du tiers
- `client` (string, optionnel) : Type (0=ni client ni prospect, 1=client, 2=prospect, 3=client+prospect)
- `fournisseur` (string, optionnel) : Type fournisseur (0=non, 1=oui)
- `email` (string, optionnel) : Email
- `address` (string, optionnel) : Adresse (si omis, tentative d'enrichissement auto)

**Exemple d'utilisation dans Claude:**
```
Crée un nouveau prospect nommé "Google France"
```

**Réponse:**
```json
{
  "id": "44",
  "message": "Tiers créé avec succès"
}
```

---

## 📄 Gestion des Propositions Commerciales

### `dolibarr_create_proposal`

Créer une nouvelle proposition commerciale dans Dolibarr.

**Paramètres:**
- `socid` (string, obligatoire) : L'ID du tiers (client)
- `date` (number, obligatoire) : Date de la proposition (timestamp Unix en secondes)
- `ref` (string, optionnel) : Référence personnalisée (sinon auto-générée)

**Exemple d'utilisation dans Claude:**
```
Crée une proposition commerciale pour le client ID 42, datée d'aujourd'hui
```

---

## 🏭 Gestion des Entrepôts (Warehouses)

### `dolibarr_list_warehouses`

Liste tous les entrepôts disponibles.

**Paramètres:**
- `limit` (number, optionnel) : Nombre maximum d'entrepôts à retourner

### `dolibarr_get_warehouse`

Récupère les détails d'un entrepôt.

**Paramètres:**
- `id` (string, obligatoire) : ID de l'entrepôt

---

## 📦 Gestion des Stocks

### `dolibarr_list_stock_movements`

Liste les mouvements de stock.

**Paramètres:**
- `product_id` (string, optionnel) : Filtrer par produit
- `warehouse_id` (string, optionnel) : Filtrer par entrepôt
- `limit` (number, optionnel) : Nombre maximum de mouvements

### `dolibarr_create_stock_movement`

Crée un mouvement de stock.

**Paramètres:**
- `product_id` (string, obligatoire) : ID du produit
- `warehouse_id` (string, obligatoire) : ID de l'entrepôt
- `qty` (number, obligatoire) : Quantité
- `type` (string, optionnel) : Type (0=entrée, 1=sortie, 2=transfert+, 3=transfert-)
- `label` (string, optionnel) : Libellé du mouvement

---

## 🚚 Gestion des Expéditions

### `dolibarr_list_shipments`

Liste les expéditions.

**Paramètres:**
- `thirdparty_id` (string, optionnel) : Filtrer par tiers
- `status` (string, optionnel) : Filtrer par statut
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_shipment`

Récupère les détails d'une expédition.

**Paramètres:**
- `id` (string, obligatoire) : ID de l'expédition

### `dolibarr_create_shipment`

Crée une expédition à partir d'une commande.

**Paramètres:**
- `socid` (string, obligatoire) : ID du tiers destinataire
- `origin_id` (string, obligatoire) : ID de la commande d'origine
- `date_delivery` (number, optionnel) : Date de livraison (timestamp Unix)

---

## 📝 Gestion des Contrats

### `dolibarr_list_contracts`

Liste les contrats.

**Paramètres:**
- `thirdparty_id` (string, optionnel) : Filtrer par tiers
- `status` (string, optionnel) : Filtrer par statut
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_contract`

Récupère les détails d'un contrat.

**Paramètres:**
- `id` (string, obligatoire) : ID du contrat

### `dolibarr_create_contract`

Crée un nouveau contrat.

**Paramètres:**
- `socid` (string, obligatoire) : ID du tiers client
- `commercial_signature_id` (string, obligatoire) : ID du commercial signataire
- `commercial_suivi_id` (string, obligatoire) : ID du commercial de suivi
- `date_contrat` (number, optionnel) : Date du contrat (timestamp Unix)
- `ref` (string, optionnel) : Référence personnalisée

---

## 🎫 Gestion des Tickets (Support)

### `dolibarr_list_tickets`

Liste les tickets de support.

**Paramètres:**
- `thirdparty_id` (string, optionnel) : Filtrer par tiers
- `status` (string, optionnel) : Filtrer par statut (0=nouveau, 1=lu, 2=assigné...)
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_ticket`

Récupère les détails d'un ticket.

**Paramètres:**
- `id` (string, obligatoire) : ID du ticket

### `dolibarr_create_ticket`

Crée un nouveau ticket de support.

**Paramètres:**
- `subject` (string, obligatoire) : Sujet du ticket
- `message` (string, obligatoire) : Message/description
- `fk_soc` (string, optionnel) : ID du tiers concerné
- `type_code` (string, optionnel) : Type (COM, HELP, ISSUE...)
- `severity_code` (string, optionnel) : Sévérité (LOW, MEDIUM, HIGH, CRITICAL)

---

## 📅 Gestion de l'Agenda

### `dolibarr_list_agenda_events`

Liste les événements de l'agenda.

**Paramètres:**
- `thirdparty_id` (string, optionnel) : Filtrer par tiers
- `user_id` (string, optionnel) : Filtrer par utilisateur propriétaire
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_agenda_event`

Récupère les détails d'un événement.

**Paramètres:**
- `id` (string, obligatoire) : ID de l'événement

### `dolibarr_create_agenda_event`

Crée un événement dans l'agenda.

**Paramètres:**
- `label` (string, obligatoire) : Libellé de l'événement
- `type_code` (string, obligatoire) : Type (AC_TEL, AC_RDV, AC_EMAIL, AC_FAX, AC_OTH)
- `datep` (number, obligatoire) : Date/heure de début (timestamp Unix)
- `datef` (number, optionnel) : Date/heure de fin
- `socid` (string, optionnel) : ID du tiers associé
- `contactid` (string, optionnel) : ID du contact associé
- `userownerid` (string, optionnel) : ID de l'utilisateur propriétaire

---

## 💰 Gestion des Notes de Frais

### `dolibarr_list_expense_reports`

Liste les notes de frais.

**Paramètres:**
- `user_id` (string, optionnel) : Filtrer par utilisateur auteur
- `status` (string, optionnel) : Statut (0=brouillon, 2=validée, 5=approuvée, 6=payée, 99=refusée)
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_expense_report`

Récupère les détails d'une note de frais.

**Paramètres:**
- `id` (string, obligatoire) : ID de la note de frais

### `dolibarr_create_expense_report`

Crée une nouvelle note de frais.

**Paramètres:**
- `user_id` (string, obligatoire) : ID de l'utilisateur auteur
- `date_debut` (number, optionnel) : Date de début (timestamp Unix)
- `date_fin` (number, optionnel) : Date de fin (timestamp Unix)
- `note_private` (string, optionnel) : Note privée
- `note_public` (string, optionnel) : Note publique

---

## 🔧 Gestion des Interventions (Fichinter)

### `dolibarr_list_interventions`

Liste les fiches d'intervention.

**Paramètres:**
- `thirdparty_id` (string, optionnel) : Filtrer par tiers
- `status` (string, optionnel) : Statut (0=brouillon, 1=validée, 2=facturée, 3=fermée)
- `limit` (number, optionnel) : Nombre maximum

### `dolibarr_get_intervention`

Récupère les détails d'une intervention.

**Paramètres:**
- `id` (string, obligatoire) : ID de l'intervention

### `dolibarr_create_intervention`

Crée une fiche d'intervention.

**Paramètres:**
- `socid` (string, obligatoire) : ID du tiers client
- `fk_project` (string, obligatoire) : ID du projet associé
- `description` (string, optionnel) : Description de l'intervention
- `datec` (number, optionnel) : Date de création (timestamp Unix)

---

## 🛠 Contribution

Vous souhaitez ajouter un nouvel outil ? Consultez le [Guide de Contribution](../CONTRIBUTING.md).
