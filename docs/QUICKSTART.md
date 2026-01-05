# Démarrage Rapide - Dolibarr MCP Server

Guide ultra-rapide pour être opérationnel en 10 minutes ! ⚡

## 🎯 Objectif

Avoir Claude qui interagit avec votre Dolibarr en moins de 10 minutes.

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Dolibarr 22+ accessible
- ✅ Node.js 18+ installé
- ✅ Claude Desktop installé
- ✅ 10 minutes devant vous

## 🚀 Installation en 5 étapes

### Étape 1 : Activer l'API Dolibarr (2 min)

1. Connectez-vous à Dolibarr
2. **Configuration → Modules → Cherchez "API"**
3. **Activez "API/Services Web REST"**
4. **Utilisateurs → Votre utilisateur → Token → Générer**
5. **Copiez la clé API** (elle ressemble à `a1b2c3d4...`)

### Étape 2 : Cloner le projet (1 min)

```bash
# Ouvrez un terminal
cd ~
git clone https://github.com/votre-username/dolibarr-mcp-server.git
cd dolibarr-mcp-server
```

**Ou téléchargez le ZIP** depuis GitHub et décompressez-le.

### Étape 3 : Installation et configuration (2 min)

```bash
# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env
```

**Éditez le fichier `.env`** :

```bash
# macOS/Linux
nano .env

# Windows
notepad .env
```

**Remplacez ces lignes** :

```bash
DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
DOLIBARR_API_KEY=votre_cle_api_ici
```

**Sauvegardez** (Ctrl+O puis Entrée dans nano, ou Fichier → Enregistrer dans Notepad).

### Étape 4 : Tester la connexion (1 min)

```bash
npm start
```

Vous devriez voir :

```
✅ Connexion réussie !
✨ Serveur MCP Dolibarr opérationnel
📦 XX outils disponibles
```

**Si ça marche** : Super ! Continuez. **Sinon** : Vérifiez l'URL et la clé API.

Appuyez sur **Ctrl+C** pour arrêter.

### Étape 5 : Configuration de Claude Desktop (4 min)

#### A. Trouver le chemin du projet

```bash
# Dans le terminal, dans le dossier du projet
pwd
# Copier le chemin affiché (ex: /Users/john/dolibarr-mcp-server)
```

#### B. Éditer la config Claude

**macOS** :
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows** :
```powershell
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux** :
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

#### C. Ajouter cette configuration

**Remplacez** `/chemin/vers/` par le chemin obtenu à l'étape A :

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["/chemin/vers/serveur-mcp-dolibarr/dist/server.js"],
      "env": {
        "DOLIBARR_BASE_URL": "https://votre-dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

**Exemple complet** :

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["/Users/john/serveur-mcp-dolibarr/dist/server.js"],
      "env": {
        "DOLIBARR_BASE_URL": "https://demo.dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "1a2b3c4d5e6f"
      }
    }
  }
}
```

**Sauvegardez** et **fermez**.

#### D. Redémarrer Claude

1. **Quittez complètement Claude** (Cmd+Q sur Mac, clic droit → Quitter sur Windows)
2. **Relancez Claude Desktop**

## 🎉 Test final

Ouvrez une conversation dans Claude et essayez :

```
Combien de clients ai-je dans Dolibarr ?
```

ou

```
Liste mes 5 derniers clients
```

**Si Claude répond avec vos vraies données** → 🎉 **BRAVO ! C'est opérationnel !**

**Si ça ne marche pas** → Voir la section Dépannage ci-dessous.

---

## 🧪 Commandes de test

Essayez ces commandes dans Claude :

```
# Recherche
Trouve le client "ACME"

# Analyse
Quelles sont mes factures impayées ?

# Création (test uniquement)
Crée un client test nommé "Test MCP"

# Statistiques
Combien de propositions commerciales ai-je créées ce mois-ci ?

# Produits
Cherche les produits contenant "ordinateur"
```

---

## 🔧 Dépannage rapide

### Problème 1 : "node: command not found"

**Solution** : Node.js n'est pas installé
```bash
# macOS
brew install node

# Ubuntu
sudo apt install nodejs npm

# Windows
# Télécharger depuis nodejs.org
```

### Problème 2 : "Configuration manquante"

**Solution** : Le fichier `.env` n'existe pas ou est vide
```bash
cd dolibarr-mcp-server
ls -la .env   # Vérifier qu'il existe
cat .env      # Vérifier le contenu
```

### Problème 3 : "401 Unauthorized"

**Solution** : La clé API est incorrecte
- Regénérez une nouvelle clé dans Dolibarr
- Mettez à jour `.env` ET `claude_desktop_config.json`

### Problème 4 : Claude ne voit pas le serveur

**Solutions** :
1. Vérifiez le chemin dans `claude_desktop_config.json` (doit être absolu)
2. Vérifiez la syntaxe JSON (pas d'erreur de virgule)
3. Redémarrez Claude complètement (Quitter, pas juste fermer)

### Problème 5 : "Pas de réponse de Dolibarr"

**Solutions** :
- Vérifiez que l'URL Dolibarr est accessible dans votre navigateur
- Pas de `/` à la fin de l'URL
- Si Dolibarr est local, vérifiez qu'il est démarré

---

## 📚 Pour aller plus loin

Une fois que c'est fonctionnel, explorez :

- **[README.md](README.md)** - Documentation complète
- **[INSTALL.md](INSTALL.md)** - Guide d'installation détaillé
- **[WEBHOOK.md](WEBHOOK.md)** - Notifications en temps réel
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribuer au projet

---

## 💡 Astuces

### Raccourci pour le chemin

**macOS/Linux** :
```bash
cd ~/dolibarr-mcp-server
echo "$(pwd)/index.js"
# Copier le résultat directement
```

**Windows PowerShell** :
```powershell
cd C:\Users\VotreNom\dolibarr-mcp-server
Write-Host "$(Get-Location)/index.js" -replace '\\', '/'
```

### Vérifier les logs Claude

Si quelque chose ne marche pas :

**macOS** :
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows** :
```powershell
Get-Content -Wait -Tail 10 $env:APPDATA\Claude\logs\mcp*.log
```

### Désactiver temporairement

Pour désactiver le MCP sans le désinstaller, commentez dans `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "_dolibarr": {
      "command": "node",
      ...
    }
  }
}
```

Le `_` devant "dolibarr" désactive le serveur.

---

## 🎯 Récapitulatif de la config

### Fichier `.env` (dans le projet)

```bash
DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
DOLIBARR_API_KEY=votre_cle_api
```

### Fichier `claude_desktop_config.json`

**macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows** : `%APPDATA%\Claude\claude_desktop_config.json`
**Linux** : `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["/CHEMIN/ABSOLU/vers/serveur-mcp-dolibarr/dist/server.js"],
      "env": {
        "DOLIBARR_BASE_URL": "https://votre-dolibarr.com/api/index.php",
        "DOLIBARR_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

---

## ✨ Vous avez réussi ?

Félicitations ! 🎉 Vous pouvez maintenant :

1. Demander à Claude d'analyser vos données Dolibarr
2. Créer des documents (factures, devis) via conversation
3. Rechercher et filtrer vos données
4. Automatiser vos tâches répétitives

**Partagez votre expérience** :
- ⭐ Star le projet sur GitHub
- 💬 Rejoignez les discussions
- 🐛 Signalez les bugs ou améliorations
- 📝 Contribuez à la documentation

---

**Besoin d'aide ?**
- 📖 [Documentation complète](README.md)
- 💬 [Forum Dolibarr](https://forums.dolibarr.org/)
- 🐛 [Issues GitHub](https://github.com/votre-username/dolibarr-mcp-server/issues)

**Bon usage de votre nouveau super-pouvoir Claude + Dolibarr !** 🚀
