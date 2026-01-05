<div align="center">

# 🤝 Guide de Contribution

### Merci de votre intérêt pour contribuer au Serveur MCP Dolibarr ! 

Nous sommes ravis de vous accueillir dans notre communauté. Chaque contribution, petite ou grande, est précieuse et appréciée ! 💝

[![Contributors](https://img.shields.io/github/contributors/guiltekmdion/Serveur-MCP-Dolibarr)](https://github.com/guiltekmdion/Serveur-MCP-Dolibarr/graphs/contributors)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![First Timers Welcome](https://img.shields.io/badge/first--timers--only-friendly-blue.svg)](https://www.firsttimersonly.com/)

</div>

---

---

## 📋 Table des matières

- [🌟 Pourquoi contribuer ?](#-pourquoi-contribuer-)
- [💡 Types de contributions](#-types-de-contributions)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [📜 Code de conduite](#-code-de-conduite)
- [🐛 Signaler un bug](#-signaler-un-bug)
- [💡 Proposer une fonctionnalité](#-proposer-une-fonctionnalité)
- [🔧 Soumettre une Pull Request](#-soumettre-une-pull-request)
- [✨ Standards de code](#-standards-de-code)
- [🏗️ Structure du projet](#️-structure-du-projet)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)

---

## 🌟 Pourquoi contribuer ?

Contribuer à l'open source, c'est :
- 🎓 **Apprendre** de nouvelles compétences
- 🤝 **Rencontrer** des développeurs passionnés
- 🌟 **Construire** votre portfolio
- 💪 **Améliorer** un outil utilisé par la communauté
- 🎉 **S'amuser** en codant !

## 💡 Types de contributions

Toutes les contributions sont les bienvenues :

| Type | Description | Niveau |
|------|-------------|--------|
| 📝 **Documentation** | Améliorer les docs, corriger des typos | 🟢 Débutant |
| 🐛 **Bug fixes** | Corriger des bugs existants | 🟡 Intermédiaire |
| ✨ **Nouvelles fonctionnalités** | Ajouter de nouveaux outils MCP | 🟠 Avancé |
| 🧪 **Tests** | Ajouter ou améliorer les tests | 🟡 Intermédiaire |
| 🎨 **Design** | Améliorer l'UX/UI de la documentation | 🟢 Débutant |
| 🌍 **Traductions** | Traduire la documentation | 🟢 Débutant |

## 🚀 Démarrage rapide

```bash
# 1. Forkez le repo sur GitHub
# 2. Clonez votre fork
git clone https://github.com/votre-username/Serveur-MCP-Dolibarr.git
cd Serveur-MCP-Dolibarr

# 3. Installez les dépendances
npm install

# 4. Créez une branche
git checkout -b feature/ma-super-contribution

# 5. Faites vos modifications
# 6. Testez vos changements
npm run test
npm run lint

# 7. Commitez et pushez
git commit -m "feat: ajout d'une super fonctionnalité"
git push origin feature/ma-super-contribution

# 8. Ouvrez une Pull Request sur GitHub
```

---

## 📜 Code de conduite

En participant à ce projet, vous vous engagez à maintenir un environnement respectueux et inclusif pour tous.

### Nos engagements

- ✅ Être respectueux envers tous les contributeurs
- ✅ Accepter les critiques constructives
- ✅ Se concentrer sur ce qui est le mieux pour la communauté
- ✅ Faire preuve d'empathie envers les autres

### Comportements inacceptables

- ❌ Langage ou images à caractère sexuel
- ❌ Trolling, commentaires insultants ou attaques personnelles
- ❌ Harcèlement public ou privé
- ❌ Publication d'informations privées sans permission

---

## Comment contribuer

Il existe plusieurs façons de contribuer :

### 1. 🐛 Signaler des bugs

Si vous trouvez un bug, [ouvrez une issue](https://github.com/votre-username/dolibarr-mcp-server/issues/new) avec :
- Description claire du problème
- Steps pour reproduire
- Comportement attendu vs comportement observé
- Version de Dolibarr, Node.js, et système d'exploitation
- Logs d'erreur si disponibles

### 2. 💡 Proposer des améliorations

Avez-vous une idée pour améliorer le projet ? [Ouvrez une issue](https://github.com/votre-username/dolibarr-mcp-server/issues/new) avec :
- Description de la fonctionnalité
- Cas d'usage et bénéfices
- Proposition d'implémentation (optionnel)

### 3. 📖 Améliorer la documentation

La documentation est essentielle ! Vous pouvez :
- Corriger des fautes d'orthographe
- Améliorer les explications
- Ajouter des exemples
- Traduire dans d'autres langues

### 4. 💻 Contribuer du code

Voir la section [Soumettre une Pull Request](#soumettre-une-pull-request)

---

## Signaler un bug

### Avant de signaler

1. **Vérifiez les issues existantes** : Votre bug a peut-être déjà été signalé
2. **Testez avec la dernière version** : Le bug est peut-être déjà corrigé
3. **Vérifiez votre configuration** : Revoyez `.env` et `claude_desktop_config.json`

### Template de rapport de bug

```markdown
## Description
[Description claire et concise du bug]

## Steps pour reproduire
1. Aller dans '...'
2. Cliquer sur '...'
3. Observer l'erreur

## Comportement attendu
[Ce qui devrait se passer]

## Comportement observé
[Ce qui se passe réellement]

## Logs d'erreur
```
[Coller les logs ici]
```

## Environnement
- OS: [ex: macOS 14.0, Ubuntu 22.04, Windows 11]
- Node.js version: [ex: 20.10.0]
- Dolibarr version: [ex: 22.0.1]
- Version du MCP server: [ex: 1.0.0]

## Contexte additionnel
[Toute autre information pertinente]
```

---

## Proposer une fonctionnalité

### Template de proposition

```markdown
## Résumé
[Description en une phrase]

## Motivation
[Pourquoi cette fonctionnalité est-elle nécessaire ?]

## Description détaillée
[Description complète de la fonctionnalité]

## Cas d'usage
1. [Cas d'usage 1]
2. [Cas d'usage 2]

## Proposition d'implémentation (optionnel)
[Comment pourrait-on l'implémenter ?]

## Alternatives considérées
[Autres solutions envisagées]
```

---

## Soumettre une Pull Request

### Processus

1. **Fork le repository**
   ```bash
   # Cliquez sur "Fork" sur GitHub
   ```

2. **Clonez votre fork**
   ```bash
   git clone https://github.com/votre-username/dolibarr-mcp-server.git
   cd dolibarr-mcp-server
   ```

3. **Créez une branche**
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # ou
   git checkout -b fix/mon-bug
   ```

4. **Faites vos modifications**
   - Suivez les [standards de code](#standards-de-code)
   - Ajoutez des tests si nécessaire
   - Mettez à jour la documentation

5. **Committez vos changements**
   ```bash
   git add .
   git commit -m "feat: ajouter support pour les paiements"
   ```

6. **Pushez vers votre fork**
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

7. **Ouvrez une Pull Request**
   - Allez sur GitHub
   - Cliquez sur "New Pull Request"
   - Décrivez vos changements
   - Liez les issues concernées

### Convention de nommage des branches

- `feature/description` - Nouvelles fonctionnalités
- `fix/description` - Corrections de bugs
- `docs/description` - Documentation uniquement
- `refactor/description` - Refactoring de code
- `test/description` - Ajout de tests

### Convention des commits

Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring de code
- `test`: Ajout de tests
- `chore`: Maintenance, mise à jour de dépendances

**Exemples** :

```bash
feat(api): ajouter endpoint pour les projets
fix(webhook): corriger validation de signature
docs(readme): améliorer section installation
refactor(client): simplifier gestion des erreurs
test(tools): ajouter tests pour list_invoices
chore(deps): mettre à jour axios vers 1.7.9
```

---

## Standards de code

### JavaScript/Node.js

#### Style

- **Indentation** : 2 espaces
- **Guillemets** : Simples `'` (sauf pour éviter l'échappement)
- **Point-virgules** : Oui
- **Longueur de ligne** : Max 100 caractères
- **Nommage** :
  - Variables/fonctions : `camelCase`
  - Constantes : `UPPER_SNAKE_CASE`
  - Classes : `PascalCase`

#### Exemple

```javascript
// ✅ Bon
const API_TIMEOUT = 30000;

class DolibarrClient {
  constructor(url, apiKey) {
    this.baseUrl = url;
    this.apiKey = apiKey;
  }

  async getThirdparty(id) {
    const response = await this.client.get(`/thirdparties/${id}`);
    return response.data;
  }
}

// ❌ Mauvais
const api_timeout = 30000

class dolibarr_client {
  constructor(url,apiKey){
    this.base_url=url
    this.api_key=apiKey
  }
  async GetThirdparty(ID) {
    const response=await this.client.get("/thirdparties/"+ID)
    return response.data
  }
}
```

#### Commentaires

```javascript
// ✅ Bon : Commentaire utile
// Calcule le prix TTC en ajoutant la TVA au prix HT
const priceTTC = priceHT * (1 + tvaRate / 100);

// ❌ Mauvais : Commentaire évident
// Additionne a et b
const sum = a + b;
```

#### Documentation JSDoc

```javascript
/**
 * Récupère un tiers par son ID
 * 
 * @param {number} id - ID du tiers dans Dolibarr
 * @returns {Promise<Object>} Données du tiers
 * @throws {Error} Si le tiers n'existe pas
 * 
 * @example
 * const thirdparty = await getThirdparty(5);
 * console.log(thirdparty.name);
 */
async function getThirdparty(id) {
  // ...
}
```

### Gestion des erreurs

```javascript
// ✅ Bon : Gestion explicite
try {
  const data = await apiCall();
  return processData(data);
} catch (error) {
  console.error(`Erreur lors de l'appel API: ${error.message}`);
  throw new Error(`Impossible de récupérer les données: ${error.message}`);
}

// ❌ Mauvais : Erreur avalée
try {
  const data = await apiCall();
  return processData(data);
} catch (error) {
  // Rien
}
```

### Formatage automatique

Utilisez Prettier :

```bash
# Formater tous les fichiers
npm run format

# Vérifier le formatage
npm run lint
```

---

## Structure du projet

```
dolibarr-mcp-server/
├── index.js                 # Serveur MCP principal
├── webhook-server.js        # Serveur webhook
├── src/                     # (Future organisation)
│   ├── client/             # Client API Dolibarr
│   ├── tools/              # Définitions des outils MCP
│   ├── webhook/            # Handlers webhook
│   └── utils/              # Utilitaires
├── tests/                  # Tests
│   ├── unit/              # Tests unitaires
│   └── integration/       # Tests d'intégration
├── docs/                   # Documentation
│   ├── API.md
│   ├── EXAMPLES.md
│   └── ARCHITECTURE.md
├── .env.example           # Configuration exemple
├── package.json
├── README.md
├── INSTALL.md
├── WEBHOOK.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Tests

### Ajouter des tests

Les tests sont importants pour maintenir la qualité du code.

#### Tests unitaires

```javascript
// tests/unit/client.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DolibarrClient } from '../../src/client.js';

describe('DolibarrClient', () => {
  it('should create client with valid config', () => {
    const client = new DolibarrClient(
      'https://demo.dolibarr.com',
      'test-api-key'
    );
    assert.ok(client);
  });

  it('should throw error with missing config', () => {
    assert.throws(
      () => new DolibarrClient(),
      /DOLIBARR_BASE_URL.*required/
    );
  });
});
```

#### Tests d'intégration

```javascript
// tests/integration/tools.test.js
import { describe, it, before } from 'node:test';
import assert from 'node:assert';

describe('Tools Integration', () => {
  let toolHandler;

  before(() => {
    // Setup
  });

  it('should list thirdparties', async () => {
    const result = await toolHandler.executeTool('list_thirdparties', {
      limit: 5
    });
    assert.ok(Array.isArray(result));
  });
});
```

### Exécuter les tests

```bash
# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Avec coverage
npm run test:coverage
```

---

## Documentation

### Documenter une nouvelle fonctionnalité

1. **Mettre à jour le README.md**
   - Ajouter dans la section appropriée
   - Inclure des exemples

2. **Créer/Mettre à jour les guides**
   - INSTALL.md pour l'installation
   - API.md pour les nouveaux endpoints
   - WEBHOOK.md pour les nouveaux événements

3. **Ajouter des exemples**
   - Créer un fichier dans `docs/examples/`
   - Inclure du code fonctionnel

4. **Commenter le code**
   - JSDoc pour les fonctions publiques
   - Commentaires explicatifs pour la logique complexe

### Style de documentation

- **Clair et concis** : Évitez le jargon technique inutile
- **Exemples pratiques** : Montrez comment utiliser la fonctionnalité
- **Cas d'erreur** : Documentez les erreurs possibles
- **Images** : Utilisez des captures d'écran si pertinent

---

## Checklist avant de soumettre une PR

- [ ] Le code respecte les standards du projet
- [ ] Les tests passent (`npm test`)
- [ ] La documentation est mise à jour
- [ ] Les commits suivent la convention
- [ ] La branche est à jour avec `main`
- [ ] Pas de fichiers sensibles (.env, clés API, etc.)
- [ ] Le code est commenté si nécessaire
- [ ] Les changements sont testés manuellement

---

## Ressources

- [Documentation MCP](https://modelcontextprotocol.io/)
- [API Dolibarr](https://www.dolibarr.org/documentation-api)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Questions ?

- 💬 [Discussions GitHub](https://github.com/votre-username/dolibarr-mcp-server/discussions)
- 📧 Email : [maintainer@example.com](mailto:maintainer@example.com)
- 🌐 [Forum Dolibarr](https://forums.dolibarr.org/)

---

## Remerciements

Merci à tous les contributeurs qui aident à améliorer ce projet ! 🙏

Votre contribution, quelle qu'elle soit, est précieuse pour la communauté.
