# Installation

## Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Une instance **Dolibarr** fonctionnelle (v10+)
- Une **clé API Dolibarr** (générée dans les paramètres utilisateur)

## Installation Locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/guiltekmdion/Serveur-MCP-Dolibarr.git
cd Serveur-MCP-Dolibarr
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Compiler le projet

```bash
npm run build
```

### 4. Vérifier l'installation

```bash
npm start
# Devrait démarrer le serveur en mode STDIO
```

## Installation Docker

### Option 1 : Build local

```bash
docker build -t serveur-mcp-dolibarr .
```

### Option 2 : Utiliser Docker Hub (si publié)

```bash
docker pull guiltekmdion/serveur-mcp-dolibarr:latest
```

## Prochaine étape

Consultez [Configuration](./02-configuration.md) pour configurer vos variables d'environnement.
