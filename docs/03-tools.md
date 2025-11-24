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

**Réponse:**
```json
{
  "id": "1567",
  "message": "Proposition créée avec succès"
}
```

---

## 🔮 Outils Futurs (Roadmap)

Les outils suivants sont prévus pour les prochaines versions :

- `dolibarr_create_invoice` : Créer une facture
- `dolibarr_get_products` : Lister les produits
- `dolibarr_create_order` : Créer une commande
- `dolibarr_get_contacts` : Récupérer les contacts d'un tiers
- `dolibarr_update_thirdparty` : Mettre à jour un tiers

---

## 🛠 Contribution

Vous souhaitez ajouter un nouvel outil ? Consultez le [Guide de Contribution](../CONTRIBUTING.md).
