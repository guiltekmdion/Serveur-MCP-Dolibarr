# Démo Docker — Dolibarr + MCP Server

Environnement jetable pour démontrer le module en conditions réelles.

## Lancer

```bash
cd demo
docker compose run --rm composer            # installe vendor/ dans le module
docker compose up -d                        # MariaDB + Dolibarr (données de démo)
# attendre la fin de l'install (logs) :
docker compose logs -f dolibarr             # Ctrl-C quand "MCP demo pret" apparait
```

- Dolibarr : http://localhost:8080 (admin / admin)
- Endpoint MCP : http://localhost:8080/custom/mcpserver/mcp/server.php
- Clé de démo : `DOLAPIKEY: demo-mcp-key-123`

## Démo MCP

```bash
./run-demo.sh
```

Affiche le handshake MCP puis la liste des tiers issus des données de démo Dolibarr.

## Analyse statique (PHPStan niveau 9)

PHPStan s'exécute dans le conteneur Dolibarr (les sources Dolibarr servent à résoudre
les classes/fonctions du cœur via `scanDirectories`) :

```bash
docker compose exec -w /var/www/html/custom/mcpserver dolibarr \
  php -d memory_limit=1G vendor/bin/phpstan analyse -c phpstan.neon.dist --no-progress
```

Résultat attendu : `[OK] No errors`.

## Arrêt / nettoyage

```bash
docker compose down -v
```
