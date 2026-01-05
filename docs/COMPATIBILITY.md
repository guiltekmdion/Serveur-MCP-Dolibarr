# Compatibilité MCP et Alternatives - Guide complet

## ⚠️ Point important : MCP est spécifique à Anthropic (Claude)

Le **Model Context Protocol (MCP)** est un **standard créé par Anthropic** pour permettre aux applications d'interagir avec Claude. Ce n'est **pas un standard universel** compatible avec tous les LLMs.

---

## 🎯 Qu'est-ce que MCP ?

**Model Context Protocol (MCP)** est un protocole open-source développé par Anthropic qui standardise la façon dont les applications fournissent du contexte aux LLMs.

### Caractéristiques

- ✅ **Créé par** : Anthropic
- ✅ **Open Source** : [GitHub - modelcontextprotocol](https://github.com/modelcontextprotocol)
- ✅ **Objectif** : Standardiser les interactions entre LLMs et sources de données
- ✅ **Lancé** : Novembre 2024

---

## 🔌 Compatibilité actuelle

### ✅ Compatible avec MCP

| Plateforme | Support MCP | Notes |
|------------|-------------|-------|
| **Claude Desktop** | ✅ Natif | Configuration via `claude_desktop_config.json` |
| **Claude API** | ✅ Natif | Via SDK officiel |
| **Claude Web** | ⏳ Prévu | En développement |

### ❌ Non compatible nativement

| Plateforme | Support MCP | Alternative |
|------------|-------------|-------------|
| **ChatGPT** | ❌ Non | OpenAI Functions / Plugins |
| **Gemini** | ❌ Non | Function Calling API |
| **Copilot** | ❌ Non | Custom Extensions |
| **Other LLMs** | ❌ Non | APIs spécifiques |

---

## 🔄 Alternatives pour autres LLMs

### Pour ChatGPT (OpenAI)

**Option 1 : OpenAI Functions**

OpenAI a son propre système de "functions" intégré à l'API.

```javascript
// Exemple avec OpenAI Functions
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "user", content: "Liste mes clients Dolibarr" }
  ],
  functions: [
    {
      name: "list_thirdparties",
      description: "Liste les clients/fournisseurs Dolibarr",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          sortfield: { type: "string" }
        }
      }
    }
  ]
});

// Gérer les appels de fonction
if (response.choices[0].message.function_call) {
  const functionName = response.choices[0].message.function_call.name;
  const args = JSON.parse(response.choices[0].message.function_call.arguments);
  
  // Appeler l'API Dolibarr
  const result = await dolibarrAPI(functionName, args);
  
  // Renvoyer le résultat à GPT
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "user", content: "Liste mes clients" },
      { role: "assistant", function_call: response.choices[0].message.function_call },
      { role: "function", name: functionName, content: JSON.stringify(result) }
    ]
  });
}
```

**Option 2 : Custom GPT avec Actions**

Créer un Custom GPT sur ChatGPT avec des "Actions" (anciennement Plugins).

1. Aller sur [chat.openai.com/gpts/editor](https://chat.openai.com/gpts/editor)
2. Créer un nouveau GPT
3. Configurer les "Actions" avec l'OpenAPI spec de votre API
4. Publier

**Option 3 : Créer un serveur API REST intermédiaire**

```javascript
// server-openai.js
import express from 'express';
import { DolibarrClient } from './dolibarr-client.js';

const app = express();
app.use(express.json());

const dolibarr = new DolibarrClient(
  process.env.DOLIBARR_BASE_URL,
  process.env.DOLIBARR_API_KEY
);

// Endpoint pour ChatGPT
app.post('/api/thirdparties', async (req, res) => {
  const result = await dolibarr.get('/thirdparties', req.body);
  res.json(result);
});

app.listen(3000);
```

---

### Pour Google Gemini

**Function Calling API**

Gemini a son propre système de function calling.

```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Définir les fonctions
list_thirdparties = genai.protos.FunctionDeclaration(
    name="list_thirdparties",
    description="Liste les clients Dolibarr",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "limit": genai.protos.Schema(type=genai.protos.Type.NUMBER),
        }
    )
)

# Créer le modèle avec les fonctions
model = genai.GenerativeModel(
    model_name='gemini-pro',
    tools=[list_thirdparties]
)

# Conversation
chat = model.start_chat()
response = chat.send_message("Liste mes 10 premiers clients")

# Gérer l'appel de fonction
if response.candidates[0].content.parts[0].function_call:
    function_call = response.candidates[0].content.parts[0].function_call
    
    # Appeler Dolibarr
    result = call_dolibarr_api(function_call.name, function_call.args)
    
    # Envoyer le résultat
    response = chat.send_message(
        genai.protos.Content(
            parts=[genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=function_call.name,
                    response={'result': result}
                )
            )]
        )
    )
```

---

### Pour Microsoft Copilot

**Créer une extension Copilot**

1. Utiliser le [Teams Toolkit](https://aka.ms/teams-toolkit)
2. Créer une extension de message
3. Connecter à l'API Dolibarr

---

## 🏗️ Architecture universelle recommandée

Pour supporter **plusieurs LLMs**, créez une **API REST intermédiaire** qui s'adapte à chaque plateforme :

```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐
│   Claude    │────▶│  MCP Protocol    │────▶│            │
└─────────────┘     └──────────────────┘     │            │
                                              │  Serveur   │
┌─────────────┐     ┌──────────────────┐     │ Universel  │     ┌──────────┐
│   ChatGPT   │────▶│ OpenAI Functions │────▶│  Dolibarr  │────▶│ Dolibarr │
└─────────────┘     └──────────────────┘     │            │     │   ERP    │
                                              │            │     └──────────┘
┌─────────────┐     ┌──────────────────┐     │            │
│   Gemini    │────▶│ Function Calling │────▶│            │
└─────────────┘     └──────────────────┘     └────────────┘
```

### Implémentation

```javascript
// universal-server.js
import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { DolibarrClient } from './dolibarr-client.js';

const app = express();
const dolibarr = new DolibarrClient(
  process.env.DOLIBARR_BASE_URL,
  process.env.DOLIBARR_API_KEY
);

// 1. Serveur MCP pour Claude (stdio)
function startMCPServer() {
  const mcpServer = new Server({
    name: "dolibarr-mcp-server",
    version: "1.0.0"
  }, { capabilities: { tools: {} } });
  
  // Configuration MCP...
  // (Code existant de index.js)
}

// 2. API REST pour ChatGPT et autres
app.use(express.json());

// OpenAPI spec pour ChatGPT Custom GPT
app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "Dolibarr API",
      version: "1.0.0"
    },
    servers: [{ url: "https://votre-serveur.com" }],
    paths: {
      "/api/thirdparties": {
        get: {
          operationId: "listThirdparties",
          summary: "Liste les clients Dolibarr",
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer" }
            }
          ],
          responses: {
            "200": {
              description: "Liste des clients",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { type: "object" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

// Endpoints API REST
app.get('/api/thirdparties', async (req, res) => {
  try {
    const result = await dolibarr.get('/thirdparties', req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const result = await dolibarr.get('/invoices', req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer les deux serveurs
if (process.env.MODE === 'mcp') {
  startMCPServer();
} else {
  app.listen(3000, () => {
    console.log('API REST disponible sur http://localhost:3000');
    console.log('OpenAPI spec: http://localhost:3000/openapi.json');
  });
}
```

---

## 📊 Comparaison des protocoles

| Fonctionnalité | MCP (Claude) | OpenAI Functions | Gemini Function Calling |
|----------------|--------------|------------------|-------------------------|
| **Transport** | stdio, SSE | HTTP API | HTTP API |
| **Configuration** | Fichier JSON local | Code Python/JS | Code Python/JS |
| **Streaming** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Multitool** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Local** | ✅ Oui | ❌ Cloud only | ❌ Cloud only |
| **Open Source** | ✅ Oui | ❌ Non | ❌ Non |
| **Webhooks** | 🔧 Custom | 🔧 Custom | 🔧 Custom |

---

## 🎯 Pourquoi ce projet utilise MCP ?

### Avantages de MCP pour Claude

1. **Intégration native** avec Claude Desktop
2. **Configuration simple** via fichier JSON
3. **Pas de serveur web requis** pour l'utilisation de base
4. **Open source** et extensible
5. **Standard émergent** qui pourrait être adopté par d'autres

### Limitations

- **Spécifique à Claude** (pour l'instant)
- **Nécessite Claude Desktop** ou client compatible
- **Pas d'interface web** native

---

## 🔮 Futur de MCP

Anthropic a publié MCP comme **open source** avec l'intention que d'autres l'adoptent.

### Adoptions potentielles futures

- **Autres LLMs** pourraient implémenter MCP
- **IDEs et outils** (VS Code, JetBrains) pourraient supporter MCP
- **Frameworks** d'agents IA pourraient standardiser sur MCP

### Suivre l'évolution

- **GitHub** : https://github.com/modelcontextprotocol
- **Documentation** : https://modelcontextprotocol.io/
- **Discussions** : https://github.com/modelcontextprotocol/specification/discussions

---

## 🛠️ Adapter ce projet pour d'autres LLMs

### Créer un adaptateur ChatGPT

```bash
# Créer un nouveau fichier
touch chatgpt-adapter.js
```

```javascript
// chatgpt-adapter.js
import express from 'express';
import { DolibarrClient } from './src/dolibarr-client.js';

const app = express();
app.use(express.json());

const dolibarr = new DolibarrClient(
  process.env.DOLIBARR_BASE_URL,
  process.env.DOLIBARR_API_KEY
);

// Route principale pour ChatGPT Custom GPT
app.post('/chat', async (req, res) => {
  const { action, parameters } = req.body;
  
  try {
    let result;
    switch(action) {
      case 'list_thirdparties':
        result = await dolibarr.get('/thirdparties', parameters);
        break;
      case 'list_invoices':
        result = await dolibarr.get('/invoices', parameters);
        break;
      // ... autres actions
      default:
        return res.status(400).json({ error: 'Action inconnue' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

---

## 📝 Résumé

| Si vous utilisez... | Utilisez... | Documentation |
|---------------------|-------------|---------------|
| **Claude Desktop** | ✅ Ce projet tel quel | README.md, QUICKSTART.md |
| **ChatGPT** | Créer Custom GPT ou API REST | [OpenAI Platform](https://platform.openai.com/) |
| **Gemini** | Function Calling API | [Google AI](https://ai.google.dev/) |
| **API Claude** | MCP SDK + ce serveur | [Anthropic Docs](https://docs.anthropic.com/) |
| **Autre LLM** | API REST intermédiaire | - |

---

## 🤔 FAQ

### Q: Puis-je utiliser ce serveur avec ChatGPT ?

**R:** Pas directement. Ce serveur utilise le protocole MCP spécifique à Claude. Pour ChatGPT, vous devez :
- Créer un Custom GPT avec des Actions
- Ou créer une API REST intermédiaire
- Ou utiliser OpenAI Functions dans votre code

### Q: MCP deviendra-t-il un standard universel ?

**R:** C'est l'objectif d'Anthropic en l'open-sourçant, mais pour l'instant seul Claude le supporte nativement. L'adoption par d'autres dépendra de la communauté et des autres entreprises.

### Q: Puis-je utiliser ce code avec d'autres LLMs en modifiant peu de choses ?

**R:** Non, vous devez créer un adaptateur spécifique pour chaque LLM car ils ont des protocoles différents. Cependant, la logique métier (connexion Dolibarr, gestion des appels API) est réutilisable.

### Q: Pourquoi avoir choisi MCP alors que c'est spécifique à Claude ?

**R:** 
1. Claude est excellent pour les interactions conversationnelles
2. MCP offre une intégration native et simple
3. C'est open source et pourrait devenir un standard
4. Claude Desktop est gratuit et accessible

### Q: Comment supporter plusieurs LLMs à la fois ?

**R:** Créez un serveur qui expose à la fois :
- MCP (stdio) pour Claude
- REST API pour ChatGPT/Gemini
- Webhooks pour tous

Voir la section "Architecture universelle recommandée" ci-dessus.

---

## 📚 Ressources

### MCP (Claude)
- **Documentation** : https://modelcontextprotocol.io/
- **SDK** : https://github.com/modelcontextprotocol/typescript-sdk
- **Exemples** : https://github.com/modelcontextprotocol/servers

### OpenAI Functions
- **Guide** : https://platform.openai.com/docs/guides/function-calling
- **Custom GPTs** : https://help.openai.com/en/articles/8554397-creating-a-gpt

### Google Gemini
- **Function Calling** : https://ai.google.dev/docs/function_calling
- **API** : https://ai.google.dev/api

---

**Note** : Ce document sera mis à jour si MCP est adopté par d'autres plateformes.

Dernière mise à jour : 24/11/2024
