# Configuration

## Variables d'environnement

Le serveur MCP Dolibarr utilise des variables d'environnement pour sa configuration.

### Fichier `.env`

Créez un fichier `.env` à la racine du projet (copiez `.env.example`) :

```bash
cp .env.example .env
```

### Variables disponibles

| Variable | Description | Obligatoire | Défaut |
|----------|-------------|-------------|--------|
| `DOLIBARR_BASE_URL` | URL de base de l'API Dolibarr (ex: `https://dolibarr.com/api/index.php`) | ✅ | - |
| `DOLIBARR_API_KEY` | Clé API Dolibarr | ✅ | - |
| `LOG_LEVEL` | Niveau de log (`debug`, `info`, `warn`, `error`) | ❌ | `info` |

### Exemple de configuration

```env
DOLIBARR_BASE_URL=https://mon-dolibarr.com/api/index.php
DOLIBARR_API_KEY=abcd1234efgh5678ijkl9012mnop3456
LOG_LEVEL=info
```

## Génération de la clé API Dolibarr

1. Connectez-vous à votre instance Dolibarr
2. Allez dans **Menu → Utilisateurs & Groupes**
3. Sélectionnez votre utilisateur
4. Onglet **API**
5. Cliquez sur **Générer une clé API**
6. Copiez la clé générée

## Configuration pour Claude Desktop

### Emplacement du fichier de config

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Configuration via Docker

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php",
        "-e", "DOLIBARR_API_KEY=votre_cle_api",
        "serveur-mcp-dolibarr"
      ]
    }
  }
}
```

### Configuration via Node.js local

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": [
        "/chemin/absolu/vers/Serveur-MCP-Dolibarr/dist/server.js"
      ],
      "env": {
        "DOLIBARR_BASE_URL": "https://votre-dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

## Prochaine étape

Consultez [Outils MCP](./03-tools.md) pour découvrir les outils disponibles.
