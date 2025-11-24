# Exemples d'Utilisation du Serveur MCP Dolibarr

Ce dossier contient des exemples de configuration et de scénarios d'utilisation.

## Configuration Claude Desktop

Pour utiliser ce serveur avec Claude Desktop, ajoutez la configuration suivante à votre fichier `%APPDATA%\Claude\claude_desktop_config.json` (Windows) ou `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

### Via Docker (Recommandé)

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "DOLIBARR_API_URL=https://votre-dolibarr.com/api/index.php",
        "-e", "DOLIBARR_API_KEY=votre_api_key",
        "mcp-dolibarr:latest"
      ]
    }
  }
}
```

### Via Node.js (Développement)

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": [
        "C:/Chemin/Vers/Serveur-MCP-Dolibarr/dist/server.js"
      ],
      "env": {
        "DOLIBARR_API_URL": "https://votre-dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "votre_api_key"
      }
    }
  }
}
```

## Scénarios d'Utilisation

### 1. Création de Proposition Commerciale

**Prompt utilisateur :**
> "Prépare une proposition commerciale pour le client 'Acme Corp'. Ils ont besoin de 5 'Service Maintenance' et 2 'Licence Logiciel'."

**Ce que fait le serveur :**
1.  Recherche le tiers "Acme Corp".
2.  Recherche les produits "Service Maintenance" et "Licence Logiciel".
3.  Crée un brouillon de proposition.
4.  Ajoute les lignes correspondantes.
5.  Retourne le résumé.

### 2. Analyse Financière

**Prompt utilisateur :**
> "Quelle est la situation du client 'Big Company' ? Est-ce qu'ils nous doivent de l'argent ?"

**Ce que fait le serveur :**
1.  Récupère les infos du tiers.
2.  Liste les factures impayées (`dolibarr_list_invoices` avec status='unpaid').
3.  Claude synthétise la réponse : "Le client a 3 factures en retard pour un total de 1500€..."

### 3. Utilisation des Ressources

**Prompt utilisateur :**
> "Montre-moi les dernières factures impayées."

**Action :**
Claude lit directement la ressource `dolibarr://invoices/unpaid` et affiche le contenu JSON formaté ou un résumé.
