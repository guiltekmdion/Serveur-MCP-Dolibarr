# 📚 Standards API Dolibarr - Guide de Référence

**Version :** 1.0  
**Date :** 26 novembre 2025  
**Pour :** Serveur MCP Dolibarr v1.2+

---

## 🎯 Vue d'Ensemble

Ce document définit les conventions de nommage et patterns obligatoires pour garantir la compatibilité avec l'API REST Dolibarr 17.0+.

---

## 🔗 Foreign Keys (Clés Étrangères)

### Règle Générale

Les relations vers d'autres objets utilisent le préfixe `fk_` (foreign key).

### ✅ Paramètres Corrects

| Relation | Paramètre API | Contexte |
|----------|---------------|----------|
| Produit | `fk_product` | Lignes de documents |
| Projet | `fk_project` | Tâches, temps passé |
| Utilisateur | `fk_user` | Assignations |
| Entrepôt | `fk_warehouse` | Mouvements stock |
| Compte bancaire | `fk_account` | Paiements |

### ❌ À Éviter

- `product_id` ← Utiliser `fk_product`
- `project_id` ← Utiliser `fk_project`
- `user_id` ← Utiliser `fk_user`

### ⚠️ Exceptions

**`socid` (sans fk_)** - Identifiant du tiers (ThirdParty)
- Contexte : Création/liaison de documents
- Exemples : `proposals`, `orders`, `invoices`
- Raison : Convention historique Dolibarr

**`product_id` et `warehouse_id` dans Stock Movements**
- Contexte : API `/stock/movements`
- Ces endpoints utilisent `product_id` et `warehouse_id` (pas fk_)
- Vérifier la documentation par endpoint

---

## 💰 Gestion des Prix

### Prix sur Produits (CRUD)

Lors de la **création ou mise à jour d'un produit**, utiliser :

```typescript
{
  price: 100,           // Prix de vente HT
  price_min: 80,        // Prix minimum HT
  price_base_type: 'HT', // 'HT' ou 'TTC'
  tva_tx: 20            // Taux TVA en %
}
```

**Endpoints concernés :**
- `POST /products`
- `PUT /products/{id}`

---

### Prix sur Lignes de Documents

Lors de l'**ajout de lignes** à des propositions, commandes, factures, utiliser :

```typescript
{
  fk_product: '123',    // ID du produit
  qty: 2,               // Quantité
  subprice: 100,        // ✅ Prix unitaire HT (PAS "price")
  tva_tx: 20,           // Taux TVA en %
  product_type: 1       // 0=produit, 1=service
}
```

**Endpoints concernés :**
- `POST /proposals/{id}/lines`
- `POST /orders/{id}/lines`
- `POST /invoices/{id}/lines`
- `PUT /proposals/lines/{id}` (mise à jour ligne)

### ❌ Erreur Fréquente

```typescript
// ❌ NE PAS FAIRE
{
  product_id: '123',  // Incorrect
  price: 100          // Incorrect sur lignes
}

// ✅ CORRECT
{
  fk_product: '123',
  subprice: 100
}
```

---

## 📅 Gestion des Dates

### Format Standard

**Type TypeScript :** `number` (Unix timestamp en secondes)

```typescript
date: z.number().int().positive()
```

### Noms de Champs Courants

| Champ | Description | Format |
|-------|-------------|--------|
| `date` | Date principale du document | Unix timestamp |
| `datec` | Date de création | Unix timestamp |
| `datem` | Date de modification | Unix timestamp |
| `date_start` | Date de début | Unix timestamp |
| `date_end` | Date de fin | Unix timestamp |
| `date_creation` | Date de création | Unix timestamp |
| `date_validation` | Date de validation | Unix timestamp |

### Conversion JavaScript

```typescript
// Date actuelle en timestamp
const now = Math.floor(Date.now() / 1000);

// String vers timestamp
const date = new Date('2025-11-26');
const timestamp = Math.floor(date.getTime() / 1000);

// Timestamp vers Date
const date = new Date(timestamp * 1000);
```

### ⚠️ Exceptions

Certains champs retournés par l'API sont en format string (ISO 8601) :
- Utiliser `z.union([z.string(), z.number()])` pour les réponses
- Toujours envoyer des `number` dans les requêtes

---

## 🔍 Gestion des Recherches

### Pattern 404 → Tableau Vide

Les méthodes de recherche doivent retourner `[]` si aucun résultat au lieu de lever une exception.

### ✅ Implémentation Correcte

```typescript
async searchThirdParties(query: string): Promise<ThirdParty[]> {
  try {
    const response = await this.client.get('/thirdparties', {
      params: { sqlfilters: `(t.nom:like:'%${query}%')` }
    });
    return z.array(ThirdPartySchema).parse(response.data);
  } catch (error) {
    // ✅ Gérer 404 comme "aucun résultat"
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      logger.info(`Aucun résultat pour: "${query}"`);
      return []; // ✅ PAS d'exception
    }
    if (error instanceof z.ZodError) throw new Error(`Validation: ${error.message}`);
    this.handleError(error, `searchThirdParties(${query})`);
  }
}
```

### Méthodes Concernées

- `searchThirdParties()`
- `searchProducts()`
- `searchUsers()`
- Toute méthode `search*` ou `list*` avec filtres

---

## 📦 Types et Statuts

### Types de Produits

```typescript
type: z.enum(['0', '1'])
// '0' = Produit physique
// '1' = Service
```

### Statuts de Propositions

```typescript
status: {
  0: 'Brouillon',
  1: 'Validée',
  2: 'Signée',
  3: 'Refusée',
  4: 'Pas de réponse'
}
```

### Statuts de Factures

```typescript
status: {
  0: 'Brouillon',
  1: 'Validée',
  2: 'Payée',
  3: 'Abandonnée'
}
```

### Statuts de Commandes

```typescript
status: {
  0: 'Brouillon',
  1: 'Validée',
  2: 'Expédiée',
  3: 'Clôturée',
  -1: 'Annulée'
}
```

---

## 🛠️ Patterns de Validation Zod

### Schema de Base pour Lignes

```typescript
export const AddDocumentLineArgsSchema = z.object({
  // ID du document parent
  proposal_id: z.string().min(1),
  
  // Produit (optionnel si description fournie)
  fk_product: z.union([z.string(), z.number()])
    .optional()
    .transform(v => v ? String(v) : undefined),
  
  // Description (optionnel si fk_product fourni)
  desc: z.string().optional(),
  
  // Quantité (défaut 1)
  qty: z.number().positive().default(1),
  
  // Prix unitaire HT
  subprice: z.number().optional(),
  
  // TVA
  tva_tx: z.number().optional(),
  
  // Type produit
  product_type: z.number().optional().default(1),
});
```

### Schema pour Dates

```typescript
export const CreateDocumentArgsSchema = z.object({
  socid: z.string().min(1),
  
  // Date en timestamp Unix
  date: z.number().int().positive(),
  
  // Dates optionnelles
  date_start: z.number().int().positive().optional(),
  date_end: z.number().int().positive().optional(),
});
```

---

## ⚠️ Pièges Courants

### 1. Confusion price vs subprice

```typescript
// ❌ ERREUR FRÉQUENTE
await addProposalLine({
  proposal_id: '6',
  price: 590  // ← ERREUR : Sur les lignes c'est subprice
});

// ✅ CORRECT
await addProposalLine({
  proposal_id: '6',
  subprice: 590
});
```

### 2. Oubli fk_ sur relations

```typescript
// ❌ ERREUR
await addProposalLine({
  proposal_id: '6',
  product_id: '2'  // ← ERREUR : Doit être fk_product
});

// ✅ CORRECT
await addProposalLine({
  proposal_id: '6',
  fk_product: '2'
});
```

### 3. Gestion 404 sur recherche

```typescript
// ❌ ERREUR : Exception levée si aucun résultat
async searchProducts(query: string) {
  const response = await this.client.get('/products', { params: { sqlfilters: query }});
  return response.data; // ← Lève 404 si vide
}

// ✅ CORRECT : Retourne []
async searchProducts(query: string) {
  try {
    const response = await this.client.get('/products', { params: { sqlfilters: query }});
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []; // ✅
    }
    throw error;
  }
}
```

---

## 📖 Ressources

### Documentation Officielle

- [API REST Dolibarr](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST)
- [Explorer API](https://demo.dolibarr.org/api/index.php/explorer/)
- [GitHub Dolibarr](https://github.com/Dolibarr/dolibarr)

### Outils de Test

- **Swagger UI :** `https://votre-dolibarr.com/api/index.php/explorer/`
- **Script d'audit :** `npm run audit:api`
- **Tests d'intégration :** `npm test`

---

## ✅ Checklist de Validation

Avant de déployer un nouvel outil MCP :

- [ ] Foreign keys utilisent `fk_*` (sauf exceptions documentées)
- [ ] Prix sur lignes utilisent `subprice` (pas `price`)
- [ ] Dates sont `z.number()` (timestamps Unix)
- [ ] Recherches retournent `[]` sur 404 (pas d'exception)
- [ ] Schémas Zod valident tous les champs requis
- [ ] Tool descriptor MCP correspond au schéma Zod
- [ ] Documentation de l'outil à jour
- [ ] Tests d'intégration passent

---

## 🔄 Maintenance

Ce document doit être mis à jour lors de :
- Ajout de nouveaux outils MCP
- Découverte de nouvelles conventions API
- Changements dans l'API Dolibarr
- Feedback utilisateurs sur incohérences

**Dernière révision :** 26 novembre 2025
