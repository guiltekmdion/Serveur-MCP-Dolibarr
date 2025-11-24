# Guide d'Installation - Dolibarr MCP Server

Ce guide vous accompagne pas à pas dans l'installation et la configuration du serveur MCP Dolibarr.

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Installation de Node.js](#2-installation-de-nodejs)
3. [Configuration de Dolibarr](#3-configuration-de-dolibarr)
4. [Installation du serveur MCP](#4-installation-du-serveur-mcp)
5. [Configuration de Claude Desktop](#5-configuration-de-claude-desktop)
6. [Vérification et tests](#6-vérification-et-tests)
7. [Dépannage](#7-dépannage)

---

## 1. Prérequis

### Logiciels requis

- **Dolibarr 22.0.0 ou supérieur** installé et accessible
- **Node.js 18.0.0 ou supérieur**
- **Claude Desktop** (ou autre client compatible MCP)
- **Git** (optionnel, pour cloner le repository)

### Permissions requises

- Accès administrateur à Dolibarr pour :
  - Activer le module API REST
  - Générer une clé API
  - Configurer les webhooks (optionnel)
- Droits d'écriture sur votre système pour installer Node.js

---

## 2. Installation de Node.js

### macOS

#### Avec Homebrew (recommandé)

```bash
# Installer Homebrew si non installé
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Node.js
brew install node

# Vérifier l'installation
node --version  # doit afficher >= v18.0.0
npm --version   # doit afficher >= 9.0.0
```

#### Avec le package officiel

1. Télécharger depuis [nodejs.org](https://nodejs.org/)
2. Choisir la version LTS (Long Term Support)
3. Exécuter l'installateur
4. Redémarrer le terminal

### Windows

#### Avec Chocolatey (recommandé)

```powershell
# Installer Chocolatey si non installé (en tant qu'admin)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer Node.js
choco install nodejs-lts

# Vérifier
node --version
```

#### Avec le package officiel

1. Télécharger depuis [nodejs.org](https://nodejs.org/)
2. Choisir la version LTS
3. Exécuter l'installateur (.msi)
4. Suivre l'assistant d'installation
5. Redémarrer l'invite de commande

### Linux (Ubuntu/Debian)

```bash
# Méthode 1: Via NodeSource (recommandé pour avoir la dernière version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Méthode 2: Via les dépôts Ubuntu (version peut être ancienne)
sudo apt update
sudo apt install nodejs npm

# Vérifier l'installation
node --version
npm --version
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Via NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Vérifier
node --version
npm --version
```

---

## 3. Configuration de Dolibarr

### 3.1 Activer le module API REST

1. Connectez-vous à Dolibarr en tant qu'administrateur
2. Allez dans **Accueil → Configuration → Modules/Applications**
3. Utilisez la recherche pour trouver "**API**"
4. Activez le module "**API/Services Web REST (serveur)**"
5. Attendez que le module soit activé (voyant vert)

![Activation API REST](https://docs.dolibarr.org/images/screenshots/api-rest-module.png)

### 3.2 Générer une clé API

1. Allez dans **Accueil → Utilisateurs & Groupes**
2. Cliquez sur votre nom d'utilisateur (ou créez un utilisateur dédié)
3. Allez dans l'onglet "**Token**" ou "**Clé API**"
4. Cliquez sur "**Générer**"
5. **Copiez immédiatement la clé** (elle ne sera plus affichée ensuite)
6. Conservez-la dans un endroit sûr

**⚠️ Important** : La clé API donne un accès complet à Dolibarr. Traitez-la comme un mot de passe.

### 3.3 Tester l'API (optionnel mais recommandé)

```bash
# Remplacez les valeurs par les vôtres
curl -X GET "https://votre-dolibarr.com/api/index.php/thirdparties" \
  -H "DOLAPIKEY: votre_cle_api"
```

Si vous recevez une liste JSON, l'API fonctionne correctement ! ✅

---

## 4. Installation du serveur MCP

### 4.1 Obtenir le code source

#### Option A : Cloner le repository (recommandé)

```bash
# Choisir un emplacement
cd ~
# ou cd C:\Users\VotreNom\ sur Windows

# Cloner le projet
git clone https://github.com/votre-username/dolibarr-mcp-server.git
cd dolibarr-mcp-server
```

#### Option B : Télécharger l'archive ZIP

1. Allez sur [GitHub Repository](https://github.com/votre-username/dolibarr-mcp-server)
2. Cliquez sur "Code" → "Download ZIP"
3. Décompressez l'archive
4. Ouvrez un terminal dans le dossier décompressé

### 4.2 Installer les dépendances

```bash
# Dans le dossier dolibarr-mcp-server
npm install
```

Cela va installer :
- `@modelcontextprotocol/sdk` - SDK MCP officiel
- `axios` - Client HTTP pour l'API Dolibarr
- `dotenv` - Gestion des variables d'environnement
- `express` - Serveur web pour les webhooks

### 4.3 Configuration

```bash
# Créer le fichier de configuration
cp .env.example .env

# Éditer avec votre éditeur préféré
# macOS/Linux:
nano .env
# ou
vim .env
# ou
code .env  # si vous avez VS Code

# Windows:
notepad .env
```

**Remplissez les valeurs** :

```bash
DOLIBARR_URL=https://votre-dolibarr.com
DOLIBARR_API_KEY=la_cle_api_generee_precedemment
```

**⚠️ Ne mettez PAS de slash final à l'URL**
- ✅ `https://mon-dolibarr.com`
- ❌ `https://mon-dolibarr.com/`

### 4.4 Test de fonctionnement

```bash
# Démarrer le serveur en mode test
npm start
```

Vous devriez voir :

```
==============================================
🚀 Démarrage du serveur MCP Dolibarr
==============================================
📍 URL Dolibarr: https://votre-dolibarr.com
🔑 Clé API: abcd1234...
🔍 Test de connexion à Dolibarr...
✅ Connexion réussie !
==============================================
✨ Serveur MCP Dolibarr opérationnel
📦 XX outils disponibles
==============================================
```

Si vous voyez une erreur :
- ❌ **Erreur de connexion** → Vérifiez l'URL Dolibarr
- ❌ **401 Unauthorized** → Vérifiez la clé API
- ❌ **404 Not Found** → Le module API REST n'est pas activé

Appuyez sur **Ctrl+C** pour arrêter le serveur.

---

## 5. Configuration de Claude Desktop

### 5.1 Localiser le fichier de configuration

Le fichier de configuration de Claude Desktop se trouve à différents emplacements selon votre système :

#### macOS

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

Pour y accéder facilement :

```bash
# Ouvrir le dossier dans Finder
open ~/Library/Application\ Support/Claude/

# Ou éditer directement
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Windows

```
%APPDATA%\Claude\claude_desktop_config.json
```

Soit en chemin complet :

```
C:\Users\VotreNom\AppData\Roaming\Claude\claude_desktop_config.json
```

Pour y accéder :

```powershell
# Ouvrir le dossier
explorer %APPDATA%\Claude

# Ou éditer avec Notepad
notepad %APPDATA%\Claude\claude_desktop_config.json
```

#### Linux

```bash
~/.config/Claude/claude_desktop_config.json
```

### 5.2 Éditer la configuration

**⚠️ Le fichier peut ne pas exister** : créez-le s'il n'existe pas.

**Contenu à ajouter** :

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["/chemin/absolu/vers/dolibarr-mcp-server/index.js"],
      "env": {
        "DOLIBARR_URL": "https://votre-dolibarr.com",
        "DOLIBARR_API_KEY": "votre_cle_api"
      }
    }
  }
}
```

**🔴 IMPORTANT** : 

1. **Utilisez le chemin ABSOLU complet** vers `index.js`
2. **Remplacez les valeurs** par vos vraies valeurs Dolibarr
3. **Respectez la syntaxe JSON** (virgules, guillemets)

#### Obtenir le chemin absolu

**macOS/Linux** :

```bash
cd ~/dolibarr-mcp-server
pwd
# Affiche par exemple: /Users/VotreNom/dolibarr-mcp-server

# Le chemin à mettre dans la config sera :
# /Users/VotreNom/dolibarr-mcp-server/index.js
```

**Windows** :

```powershell
cd C:\Users\VotreNom\dolibarr-mcp-server
cd
# Affiche par exemple: C:\Users\VotreNom\dolibarr-mcp-server

# Le chemin à mettre dans la config sera (avec / et non \) :
# C:/Users/VotreNom/dolibarr-mcp-server/index.js
```

### 5.3 Exemple complet de configuration

```json
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["/Users/john/dolibarr-mcp-server/index.js"],
      "env": {
        "DOLIBARR_URL": "https://demo.dolibarr.com",
        "DOLIBARR_API_KEY": "1a2b3c4d5e6f7g8h9i0j"
      }
    }
  }
}
```

### 5.4 Redémarrer Claude Desktop

1. **Quittez complètement** Claude Desktop (pas juste fermer la fenêtre)
   - macOS : Cmd+Q
   - Windows : Menu → Quitter
   - Ou : Clic droit sur l'icône dans la barre des tâches → Quitter

2. **Relancez** Claude Desktop

3. Le serveur MCP devrait se connecter automatiquement

---

## 6. Vérification et tests

### 6.1 Vérifier la connexion MCP

Dans Claude Desktop, essayez une commande simple :

```
Liste mes clients Dolibarr
```

ou

```
Combien de tiers ai-je dans Dolibarr ?
```

Si Claude répond avec des données de votre Dolibarr, **c'est fonctionnel** ! 🎉

### 6.2 Tests supplémentaires

```
# Test 1 : Recherche
Trouve le client nommé "ACME"

# Test 2 : Création (en test uniquement !)
Crée un client test avec le nom "Test MCP Client"

# Test 3 : Factures
Quelles sont mes factures impayées ?

# Test 4 : Produits
Liste mes 5 premiers produits

# Test 5 : Analyse
Analyse mes ventes du mois dernier
```

### 6.3 Vérifier les logs

Pendant les tests, vous pouvez observer les logs du serveur MCP :

```bash
# Dans un terminal séparé, dans le dossier du projet
npm start

# Vous verrez les appels en temps réel
```

---

## 7. Dépannage

### Problème : "Configuration manquante"

**Erreur** :
```
❌ ERREUR FATALE:
Configuration manquante !
```

**Solution** :
- Vérifiez que le fichier `.env` existe dans le dossier du projet
- Vérifiez que `DOLIBARR_URL` et `DOLIBARR_API_KEY` sont renseignés

### Problème : "Pas de réponse de Dolibarr"

**Erreur** :
```
Pas de réponse de Dolibarr. Vérifiez que l'URL est accessible.
```

**Solutions** :
1. Vérifiez que l'URL est correcte et accessible
2. Testez dans votre navigateur : `https://votre-dolibarr.com`
3. Vérifiez votre connexion internet
4. Si Dolibarr est local, assurez-vous que le serveur est démarré

### Problème : "401 Unauthorized"

**Erreur** :
```
Erreur API Dolibarr [401]: Unauthorized
```

**Solutions** :
1. Vérifiez que la clé API est correcte
2. Regénérez une nouvelle clé API dans Dolibarr
3. Vérifiez que l'utilisateur associé a les bonnes permissions

### Problème : "404 Not Found"

**Erreur** :
```
Erreur API Dolibarr [404]
```

**Solutions** :
1. Vérifiez que le module API REST est bien activé
2. L'URL doit être : `https://votre-dolibarr.com` (sans `/api/` à la fin)

### Problème : Claude ne voit pas le serveur MCP

**Solutions** :
1. Vérifiez le chemin absolu dans `claude_desktop_config.json`
2. Vérifiez la syntaxe JSON (pas d'erreur de virgule)
3. Redémarrez complètement Claude Desktop
4. Consultez les logs de Claude Desktop :
   - macOS : `~/Library/Logs/Claude/mcp*.log`
   - Windows : `%APPDATA%\Claude\logs\mcp*.log`

### Problème : "node: command not found"

**Solution** :
- Node.js n'est pas installé ou pas dans le PATH
- Réinstallez Node.js selon les instructions de la section 2
- Redémarrez votre terminal/ordinateur

### Problème : "Cannot find module"

**Erreur** :
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution** :
```bash
cd dolibarr-mcp-server
npm install
```

---

## Installation terminée ! 🎉

Votre serveur MCP Dolibarr est maintenant opérationnel. Vous pouvez :

- **Consulter le README.md** pour voir tous les outils disponibles
- **Lire WEBHOOK.md** pour configurer les notifications en temps réel
- **Consulter API.md** pour la documentation complète de l'API

Besoin d'aide ? 
- 📖 [Documentation complète](https://github.com/votre-username/dolibarr-mcp-server/wiki)
- 💬 [Forum Dolibarr](https://forums.dolibarr.org/)
- 🐛 [Signaler un bug](https://github.com/votre-username/dolibarr-mcp-server/issues)
