# Documentation API Dolibarr - Référence complète

Ce document détaille toutes les API Dolibarr REST utilisées par le serveur MCP.

## Table des matières

1. [Introduction aux API Dolibarr](#introduction)
2. [Authentification](#authentification)
3. [Structure des réponses](#structure-des-réponses)
4. [API Tiers](#api-tiers)
5. [API Factures](#api-factures)
6. [API Propositions](#api-propositions)
7. [API Produits](#api-produits)
8. [API Commandes](#api-commandes)
9. [Filtres et recherche](#filtres-et-recherche)
10. [Gestion des erreurs](#gestion-des-erreurs)
11. [Limites et pagination](#limites-et-pagination)

---

## Introduction

Les API REST de Dolibarr sont disponibles depuis la version 3.8 et ont été considérablement améliorées dans la version 22.0+.

### URL de base

```
https://votre-dolibarr.com/api/index.php
```

### Documentation officielle

- [Documentation Dolibarr API](https://www.dolibarr.org/documentation-api)
- [Wiki API REST](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(serveur))

---

## Authentification

### Clé API (DOLAPIKEY)

Toutes les requêtes doivent inclure la clé API dans les headers :

```http
DOLAPIKEY: votre_cle_api_ici
Content-Type: application/json
Accept: application/json
```

### Générer une clé API

1. Dolibarr → **Utilisateurs & Groupes**
2. Sélectionner votre utilisateur
3. Onglet **"Token"** ou **"Clé API"**
4. Cliquer sur **"Générer"**
5. Copier la clé (elle ne sera plus affichée)

### Permissions

L'utilisateur associé à la clé API doit avoir les permissions appropriées pour chaque module.

---

## Structure des réponses

### Succès

```json
{
  "id": 123,
  "ref": "CL001",
  "name": "ACME Corporation",
  "email": "contact@acme.com",
  ...
}
```

### Erreur

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Permission denied"
  }
}
```

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 204 | Succès sans contenu |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 500 | Erreur serveur |

---

## API Tiers

### Liste des tiers

**Endpoint** : `GET /thirdparties`

**Paramètres** :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `sortfield` | string | Champ de tri | `t.nom`, `t.code_client` |
| `sortorder` | string | Ordre (ASC/DESC) | `ASC` |
| `limit` | number | Nombre de résultats | `100` |
| `page` | number | Page (commence à 0) | `0` |
| `mode` | number | 0=Clients, 1=Prospects, 2=ProspectsClients, 3=Fournisseurs | `1` |
| `sqlfilters` | string | Filtres SQL | `t.nom:like:'%ACME%'` |

**Exemple de requête** :

```bash
curl -X GET "https://demo.dolibarr.com/api/index.php/thirdparties?sortfield=t.nom&sortorder=ASC&limit=10" \
  -H "DOLAPIKEY: votre_cle_api"
```

**Réponse** :

```json
[
  {
    "id": "1",
    "name": "ACME Corporation",
    "name_alias": "ACME",
    "client": "1",
    "fournisseur": "0",
    "address": "123 Main Street",
    "zip": "75001",
    "town": "Paris",
    "country_code": "FR",
    "phone": "+33123456789",
    "email": "contact@acme.com",
    "url": "https://acme.com",
    "code_client": "CU2401-0001",
    "code_fournisseur": "",
    "idprof1": "123456789",
    "idprof2": "12345678900001",
    "tva_intra": "FR12345678901",
    "date_creation": "1701389472",
    "date_modification": "1732464000"
  }
]
```

### Détails d'un tiers

**Endpoint** : `GET /thirdparties/{id}`

**Exemple** :

```bash
curl -X GET "https://demo.dolibarr.com/api/index.php/thirdparties/1" \
  -H "DOLAPIKEY: votre_cle_api"
```

### Créer un tiers

**Endpoint** : `POST /thirdparties`

**Body** :

```json
{
  "name": "Nouvelle Société",
  "name_alias": "NS",
  "client": 1,
  "fournisseur": 0,
  "address": "456 Rue Example",
  "zip": "69001",
  "town": "Lyon",
  "country_code": "FR",
  "phone": "+33987654321",
  "email": "contact@nouvelle-societe.com",
  "url": "https://nouvelle-societe.com",
  "idprof1": "987654321",
  "idprof2": "98765432100001",
  "tva_intra": "FR98765432101",
  "note_public": "Client important",
  "note_private": "Négocié tarif spécial"
}
```

**Réponse** :

```json
{
  "id": 42,
  "ref": "CU2401-0042"
}
```

### Modifier un tiers

**Endpoint** : `PUT /thirdparties/{id}`

**Body** : Même structure que la création, seuls les champs fournis seront modifiés.

### Supprimer un tiers

**Endpoint** : `DELETE /thirdparties/{id}`

---

## API Factures

### Liste des factures

**Endpoint** : `GET /invoices`

**Paramètres** : Mêmes que pour les tiers, plus :

| Paramètre | Type | Description |
|-----------|------|-------------|
| `thirdparty_ids` | string | IDs des tiers (séparés par virgule) |
| `sqlfilters` | string | Filtres avancés |

**Filtres utiles** :

```sql
-- Factures brouillon
t.fk_statut:=:0

-- Factures validées non payées
t.fk_statut:=:1 and t.paye:=:0

-- Factures payées
t.paye:=:1

-- Factures au-dessus d'un montant
t.total_ttc:>:1000

-- Factures d'un client spécifique
t.fk_soc:=:5

-- Factures de ce mois
t.datef:>=:'2024-11-01' and t.datef:<:'2024-12-01'
```

**Exemple** :

```bash
# Factures impayées
curl -X GET "https://demo.dolibarr.com/api/index.php/invoices?sqlfilters=t.fk_statut:=:1%20and%20t.paye:=:0" \
  -H "DOLAPIKEY: votre_cle_api"
```

**Réponse** :

```json
[
  {
    "id": "1",
    "ref": "FA2401-0001",
    "type": "0",
    "socid": "5",
    "date": 1701389472,
    "date_lim_reglement": 1704067872,
    "fk_statut": "1",
    "paye": "0",
    "total_ht": "1000.00",
    "total_tva": "200.00",
    "total_ttc": "1200.00",
    "multicurrency_code": "EUR",
    "lines": [
      {
        "id": "1",
        "fk_product": "10",
        "description": "Prestation de service",
        "qty": "10",
        "subprice": "100.00",
        "tva_tx": "20.000",
        "total_ht": "1000.00",
        "total_tva": "200.00",
        "total_ttc": "1200.00"
      }
    ]
  }
]
```

### Détails d'une facture

**Endpoint** : `GET /invoices/{id}`

### Créer une facture

**Endpoint** : `POST /invoices`

**Body** :

```json
{
  "socid": 5,
  "type": 0,
  "date": 1732464000,
  "date_lim_reglement": 1735056000,
  "cond_reglement_id": 1,
  "mode_reglement_id": 7,
  "lines": [
    {
      "fk_product": 10,
      "desc": "Prestation développement",
      "subprice": 500,
      "qty": 2,
      "tva_tx": 20,
      "product_type": 1
    },
    {
      "desc": "Matériel informatique",
      "subprice": 1500,
      "qty": 1,
      "tva_tx": 20,
      "product_type": 0
    }
  ],
  "note_public": "Merci de régler sous 30 jours",
  "note_private": "Client prioritaire"
}
```

**Réponse** :

```json
{
  "id": 123,
  "ref": "FA2411-0123"
}
```

### Valider une facture

**Endpoint** : `POST /invoices/{id}/validate`

**Body** (optionnel) :

```json
{
  "notrigger": 0
}
```

### Enregistrer un paiement

**Endpoint** : `POST /invoices/{id}/payments`

**Body** :

```json
{
  "datepaye": 1732464000,
  "paiementid": 7,
  "closepaidinvoices": "yes",
  "accountid": 1,
  "num_paiement": "CHQ12345",
  "comment": "Chèque n°12345",
  "chqemetteur": "Jean Dupont",
  "chqbank": "BNP Paribas"
}
```

---

## API Propositions

### Liste des propositions

**Endpoint** : `GET /proposals`

**Paramètres** : Similaires aux factures

**Statuts des propositions** :

| Code | Statut |
|------|--------|
| 0 | Brouillon |
| 1 | Validée |
| 2 | Signée |
| 3 | Refusée |
| 4 | Non signée |

**Filtres** :

```sql
-- Propositions validées
t.fk_statut:=:1

-- Propositions signées
t.fk_statut:=:2

-- Propositions de ce mois
t.datep:>=:'2024-11-01'
```

### Créer une proposition

**Endpoint** : `POST /proposals`

**Body** :

```json
{
  "socid": 5,
  "date": 1732464000,
  "duree_validite": 30,
  "cond_reglement_id": 1,
  "mode_reglement_id": 7,
  "lines": [
    {
      "fk_product": 15,
      "desc": "Pack Premium",
      "subprice": 2000,
      "qty": 1,
      "tva_tx": 20
    }
  ],
  "note_public": "Proposition valable 30 jours",
  "note_private": "Prospect chaud"
}
```

### Clôturer une proposition

**Endpoint** : `POST /proposals/{id}/close`

**Body** :

```json
{
  "status": 2,
  "note_private": "Signé le 24/11/2024"
}
```

**Status** :
- `2` = Signée
- `3` = Refusée

---

## API Produits

### Liste des produits

**Endpoint** : `GET /products`

**Paramètres** :

| Paramètre | Type | Description |
|-----------|------|-------------|
| `mode` | number | 1=Vente, 0=Achat |
| `category` | number | Filtrer par catégorie |
| `sqlfilters` | string | Filtres SQL |

**Filtres** :

```sql
-- Produits en vente
t.tosell:=:1

-- Services
t.fk_product_type:=:1

-- Prix supérieur à 100€
t.price:>:100

-- Recherche par référence ou label
(t.ref:like:'%ORD%') or (t.label:like:'%ordinateur%')
```

**Réponse** :

```json
[
  {
    "id": "1",
    "ref": "PROD-001",
    "label": "Ordinateur portable",
    "description": "PC portable 15 pouces",
    "price": "899.00",
    "price_ttc": "1078.80",
    "tva_tx": "20.000",
    "stock_reel": "25",
    "tosell": "1",
    "tobuy": "1",
    "fk_product_type": "0",
    "barcode": "3701234567890",
    "weight": "2.5",
    "length": "38",
    "width": "26",
    "height": "2"
  }
]
```

### Détails d'un produit

**Endpoint** : `GET /products/{id}`

Peut également utiliser la référence :

**Endpoint** : `GET /products/ref/{ref}`

### Stock d'un produit

**Endpoint** : `GET /products/{id}/stock`

---

## API Commandes

### Liste des commandes

**Endpoint** : `GET /orders`

**Statuts** :

| Code | Statut |
|------|--------|
| -1 | Annulée |
| 0 | Brouillon |
| 1 | Validée |
| 2 | En traitement |
| 3 | Livrée partiellement |
| 4 | Livrée |

### Créer une commande

**Endpoint** : `POST /orders`

**Body** :

```json
{
  "socid": 5,
  "date": 1732464000,
  "lines": [
    {
      "fk_product": 10,
      "desc": "Produit A",
      "subprice": 50,
      "qty": 10,
      "tva_tx": 20
    }
  ]
}
```

### Valider une commande

**Endpoint** : `POST /orders/{id}/validate`

---

## Filtres et recherche

### Syntaxe SQL Filters

Les `sqlfilters` utilisent une syntaxe spéciale :

```
champ:operateur:valeur
```

**Opérateurs** :

| Opérateur | Signification | Exemple |
|-----------|---------------|---------|
| `=` | Égal | `t.id:=:5` |
| `!=` | Différent | `t.statut:!=:0` |
| `>` | Supérieur | `t.price:>:100` |
| `>=` | Supérieur ou égal | `t.date:>=:'2024-01-01'` |
| `<` | Inférieur | `t.stock:<:10` |
| `<=` | Inférieur ou égal | `t.total:<=:1000` |
| `like` | Contient | `t.nom:like:'%ACME%'` |
| `in` | Dans liste | `t.id:in:(1,2,3)` |

**Combinaison** :

```sql
-- ET logique (espace)
t.client:=:1 and t.fk_pays:=:1

-- OU logique
(t.nom:like:'%ACME%') or (t.nom:like:'%CORP%')

-- Complexe
t.client:=:1 and (t.total_ttc:>:1000 or t.code_client:like:'VIP%')
```

**⚠️ Important** : Dans les URLs, les filtres doivent être URL-encodés :
- Espace → `%20`
- `:` → `%3A`

### Champs disponibles pour les filtres

**Tiers (`t.`)** :
- `id`, `nom`, `name_alias`, `code_client`, `email`, `phone`
- `client`, `fournisseur`, `zip`, `town`, `fk_pays`
- `datec` (date création), `tms` (date modification)

**Factures (`t.`)** :
- `id`, `ref`, `fk_soc`, `fk_statut`, `paye`
- `total_ht`, `total_tva`, `total_ttc`
- `datef` (date facture), `date_lim_reglement`

**Produits (`t.`)** :
- `id`, `ref`, `label`, `price`, `tva_tx`
- `tosell`, `tobuy`, `fk_product_type`, `stock_reel`

---

## Gestion des erreurs

### Types d'erreurs

**401 Unauthorized** :
```json
{
  "error": {
    "code": "401",
    "message": "Access denied. Wrong API key."
  }
}
```

**403 Forbidden** :
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Not enough permissions"
  }
}
```

**404 Not Found** :
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Object not found"
  }
}
```

**500 Internal Server Error** :
```json
{
  "error": {
    "code": "SQL_ERROR",
    "message": "Database error: ..."
  }
}
```

### Gestion dans le code

```javascript
try {
  const response = await axios.get('/thirdparties/999');
} catch (error) {
  if (error.response) {
    // Erreur de l'API
    console.error(`Erreur ${error.response.status}:`, error.response.data);
  } else if (error.request) {
    // Pas de réponse
    console.error('Pas de réponse du serveur');
  } else {
    // Erreur de configuration
    console.error('Erreur:', error.message);
  }
}
```

---

## Limites et pagination

### Limite par défaut

Par défaut, Dolibarr limite les résultats à **100 entrées** par requête.

### Pagination

```javascript
// Page 1 (résultats 0-99)
GET /thirdparties?limit=100&page=0

// Page 2 (résultats 100-199)
GET /thirdparties?limit=100&page=1

// Page 3 (résultats 200-299)
GET /thirdparties?limit=100&page=2
```

### Récupérer tous les résultats

```javascript
async function getAllThirdparties() {
  let allResults = [];
  let page = 0;
  let hasMore = true;
  
  while (hasMore) {
    const results = await dolibarr.get('/thirdparties', {
      limit: 100,
      page: page
    });
    
    allResults = allResults.concat(results);
    hasMore = results.length === 100;
    page++;
  }
  
  return allResults;
}
```

---

## API supplémentaires disponibles

D'autres modules Dolibarr exposent des API REST :

- **Contacts** : `/contacts`
- **Projets** : `/projects`
- **Contrats** : `/contracts`
- **Interventions** : `/interventions`
- **Stocks** : `/warehouses`, `/stockmovements`
- **Comptabilité** : `/bankaccounts`, `/expensereports`
- **Utilisateurs** : `/users`
- **Documents** : `/documents/download`

### Consulter toutes les API disponibles

```bash
# Liste des endpoints disponibles
curl -X GET "https://votre-dolibarr.com/api/index.php/" \
  -H "DOLAPIKEY: votre_cle_api"
```

---

## Exemples pratiques

### Créer une facture complète

```javascript
async function createCompleteInvoice() {
  // 1. Créer la facture
  const invoice = await dolibarr.post('/invoices', {
    socid: 5,
    type: 0,
    date: Math.floor(Date.now() / 1000),
    lines: [
      {
        desc: "Développement site web",
        subprice: 3000,
        qty: 1,
        tva_tx: 20
      }
    ]
  });
  
  console.log(`Facture créée: ${invoice.ref}`);
  
  // 2. Valider la facture
  await dolibarr.post(`/invoices/${invoice.id}/validate`);
  console.log(`Facture validée`);
  
  // 3. Envoyer par email (si configuré)
  await dolibarr.post(`/invoices/${invoice.id}/sendbymail`);
  console.log(`Facture envoyée par email`);
  
  return invoice;
}
```

### Rechercher et mettre à jour un client

```javascript
async function updateClientEmail(clientName, newEmail) {
  // 1. Rechercher le client
  const clients = await dolibarr.get('/thirdparties', {
    sqlfilters: `t.nom:like:'%${clientName}%'`
  });
  
  if (clients.length === 0) {
    throw new Error('Client non trouvé');
  }
  
  const client = clients[0];
  
  // 2. Mettre à jour l'email
  await dolibarr.put(`/thirdparties/${client.id}`, {
    email: newEmail
  });
  
  console.log(`Email mis à jour pour ${client.name}`);
}
```

---

## Ressources

- **Documentation officielle** : https://www.dolibarr.org/documentation-api
- **Wiki API REST** : https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(serveur)
- **Forum Dolibarr** : https://forums.dolibarr.org/
- **Code source API** : https://github.com/Dolibarr/dolibarr/tree/develop/htdocs/api

---

## Notes importantes

1. **Module API doit être activé** dans Configuration → Modules
2. **Permissions utilisateur** requises pour chaque opération
3. **Rate limiting** peut s'appliquer selon votre configuration serveur
4. **HTTPS recommandé** en production
5. **Les timestamps sont en secondes** (Unix timestamp)
6. **Les montants sont en strings** dans les réponses

---

Dernière mise à jour : 24/11/2024 - Compatible Dolibarr 22.0+
