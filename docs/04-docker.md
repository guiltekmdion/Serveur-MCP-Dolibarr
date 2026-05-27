# Déploiement Docker

Ce guide explique comment déployer le Serveur MCP Dolibarr avec Docker.

## 📦 Construction de l'image

### Build manuel

```bash
docker build -t serveur-mcp-dolibarr .
```

### Vérifier l'image

```bash
docker images | grep serveur-mcp-dolibarr
```

## 🚀 Lancement du serveur

### Mode interactif (STDIO)

Pour utiliser le serveur avec Claude Desktop ou d'autres clients MCP :

```bash
docker run -i --rm \
  -e DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php \
  -e DOLIBARR_API_KEY=votre_cle_api \
  serveur-mcp-dolibarr
```

**Explications:**
- `-i` : Mode interactif (nécessaire pour STDIO)
- `--rm` : Supprime le conteneur après arrêt
- `-e` : Passe les variables d'environnement

### Avec Docker Compose

Le fichier `docker-compose.yml` fourni permet un déploiement simplifié.

1. **Créer un fichier `.env`** à la racine :

```env
DOLIBARR_BASE_URL=https://votre-dolibarr.com/api/index.php
DOLIBARR_API_KEY=votre_cle_api
LOG_LEVEL=info
```

2. **Lancer le service** :

```bash
docker-compose up -d
```

3. **Vérifier les logs** :

```bash
docker-compose logs -f dolibarr-mcp
```

4. **Arrêter le service** :

```bash
docker-compose down
```

## 🔧 Configuration avancée

### Persistance des logs

Le fichier `docker-compose.yml` monte un volume pour les logs :

```yaml
volumes:
  - ./logs:/app/logs
```

### Mode développement avec hot-reload

Pour développer avec Docker :

```bash
docker run -i --rm \
  -v $(pwd)/src:/app/src \
  -e DOLIBARR_BASE_URL=... \
  -e DOLIBARR_API_KEY=... \
  serveur-mcp-dolibarr
```

## 🐳 Publier sur Docker Hub

### 1. Se connecter

```bash
docker login
```

### 2. Tagger l'image

```bash
docker tag serveur-mcp-dolibarr guiltekmdion/serveur-mcp-dolibarr:1.0.0
docker tag serveur-mcp-dolibarr guiltekmdion/serveur-mcp-dolibarr:latest
```

### 3. Pousser l'image

```bash
docker push guiltekmdion/serveur-mcp-dolibarr:1.0.0
docker push guiltekmdion/serveur-mcp-dolibarr:latest
```

## 🔒 Sécurité

### Secrets Docker

Pour une sécurité renforcée en production, utilisez les secrets Docker :

```bash
echo "votre_cle_api" | docker secret create dolibarr_api_key -
```

Puis dans `docker-compose.yml` :

```yaml
services:
  dolibarr-mcp:
    secrets:
      - dolibarr_api_key
    environment:
      - DOLIBARR_API_KEY_FILE=/run/secrets/dolibarr_api_key

secrets:
  dolibarr_api_key:
    external: true
```

## 🧪 Tests

### Tester le conteneur

```bash
docker run -i --rm \
  -e DOLIBARR_BASE_URL=https://demo.dolibarr.org/api/index.php \
  -e DOLIBARR_API_KEY=demo_key \
  serveur-mcp-dolibarr
```

### Inspecter le conteneur

```bash
docker run -it --rm --entrypoint /bin/sh serveur-mcp-dolibarr
```

## 📊 Monitoring

### Logs en temps réel

```bash
docker logs -f <container_id>
```

### Ressources utilisées

```bash
docker stats serveur-mcp-dolibarr
```

## 🆘 Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker logs <container_id>

# Vérifier les variables d'environnement
docker inspect <container_id> | grep -A 10 "Env"
```

### Erreur de connexion à Dolibarr

Vérifiez que :
- L'URL de base est correcte
- La clé API est valide
- Le conteneur peut accéder au réseau
