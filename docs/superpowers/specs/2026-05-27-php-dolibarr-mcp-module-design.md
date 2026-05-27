# Réécriture en module Dolibarr natif `mcpserver` — Design

**Date :** 2026-05-27
**Branche :** `rewrite/php-module`
**Statut :** Approuvé (design)

## Contexte

Le dépôt contient un serveur MCP pour Dolibarr écrit en **TypeScript/Node** (~28 fichiers
de *tools* dans `src/tools/`, services REST, infra Docker/CI). Cette implémentation appelle
l'API REST de Dolibarr depuis l'extérieur via une clé `DOLAPIKEY`.

Maintenant que le **SDK MCP PHP officiel** (`mcp/sdk`, PHP Foundation + Symfony, PHP 8.1+)
est publié et maintenu, l'objectif est de réécrire le projet en **module Dolibarr PHP natif**
qui embarque le serveur MCP directement dans Dolibarr — supprimant la couche REST externe et
les credentials séparés, et réutilisant le bootstrap, l'authentification et les classes métier
de Dolibarr.

Cette spec couvre **deux livrables** : (1) le nettoyage de la branche pour ne garder que la
connaissance documentaire de l'API Dolibarr, et (2) le **squelette** du module PHP. L'implémentation
complète du catalogue d'outils est un travail ultérieur, guidé par les docs conservées.

## Objectifs

- Repartir d'une branche propre, sans code TypeScript ni infra Node.
- Préserver la connaissance accumulée sur l'API Dolibarr (références, exploration, standards, cas d'usage).
- Poser un squelette de module Dolibarr conforme aux conventions (modulebuilder), avec le serveur
  MCP opérationnel sur **un outil d'exemple** via transport **Streamable HTTP**.

## Non-objectifs

- Implémenter l'intégralité des outils (factures, commandes, stocks, tickets…) — étape ultérieure.
- Migrer/garder l'ancien mécanisme de webhooks Node.
- Packaging Dolibarr (zip module store) / CI — à traiter plus tard.

## 1. Branche & nettoyage

Branche `rewrite/php-module` créée depuis `main`. `main` reste intacte comme filet de sécurité.

**Fichiers/dossiers supprimés :**

- Code & build TS : `src/`, `tests/`, `dist/`, `node_modules/`, `package.json`,
  `package-lock.json`, `tsconfig.json`, `run-tests.js`, `scripts/`
- Annexes Node : `extras/`, `examples/`
- Infra : `Dockerfile`, `docker-compose.yml`, `.env.example`, `.github/workflows/*` (CI Node)
- Méta dépassée : `CHANGELOG.md`, `CONTRIBUTING.md`, et le `README.md` actuel (réécrit pour le module)

**Conservé :** `LICENSE`, le sous-ensemble `docs/` ci-dessous, et le présent dossier `docs/superpowers/specs/`.

## 2. Documentation conservée (connaissance API Dolibarr)

| Garder | Raison |
|---|---|
| `docs/API.md` | Référence REST Dolibarr complète |
| `docs/API-REFERENCE.md` | Catalogue exhaustif des capacités/méthodes |
| `docs/API-STANDARDS.md` | Standards de l'API Dolibarr |
| `docs/API_EXPLORATION.md` | Modules API + roadmap d'intégration |
| `docs/COMPATIBILITY.md` | Notes de compatibilité MCP / alternatives |
| `docs/03-tools.md` | Catalogue d'outils → spec de features pour le module |
| `docs/50-USE-CASES.md` | 50 cas d'usage IA → spec produit |
| `docs/ADVANCED-MODULES.md` | Permissions, multi-entité (connaissance Dolibarr) |
| `docs/BUGFIX-PROPOSALS.md` | Quirks/corrections de l'API Dolibarr (à connaître) |

**Jeté** (spécifique au serveur TS, à l'installation Node ou au process git) :
`01-installation.md`, `02-configuration.md`, `04-docker.md`, `INSTALL.md`, `QUICKSTART.md`,
`QUICKSTART-ADVANCED.md`, `START_HERE.md`, `PROJECT_STRUCTURE.md`, `PROJECT_SUMMARY.md`,
`INDEX.md`, `RELEASE-PROCESS.md`, `CLEANUP-AUDIT.md`, `WEBHOOK.md`.

## 3. Architecture du module PHP

Layout : **la racine du dépôt = le contenu du module**, clonable directement dans
`htdocs/custom/mcpserver/`, conforme aux conventions Dolibarr (modulebuilder).

```
core/modules/modMcpServer.class.php   # descripteur (extends DolibarrModules) : numéro, nom,
                                       #   description, droits/permissions, page de config
admin/setup.php                       # page de configuration : activer l'API, gérer token/permissions
lib/mcpserver.lib.php                 # helpers (préparation des onglets admin)
mcp/server.php                        # endpoint HTTP : bootstrap Dolibarr + StreamableHttpTransport
mcp/Tools/                            # classes de capacités annotées #[McpTool] (ex. ThirdPartyTools)
langs/en_US/mcpserver.lang            # traductions anglaises
langs/fr_FR/mcpserver.lang            # traductions françaises
sql/                                  # vide au départ (aucune table requise par le squelette)
composer.json                         # require: mcp/sdk (PHP >= 8.1)
README.md                             # documentation du module
```

## 4. Transport & flux d'exécution (Streamable HTTP)

Le SDK officiel supporte `StdioTransport` et `StreamableHttpTransport`. Pour un module web natif,
le **Streamable HTTP** est le choix idiomatique recommandé.

Flux de `mcp/server.php` :

1. Inclut `main.inc.php` de Dolibarr → bootstrap (accès `$db`, `$conf`, `$user`, classes métier).
2. Authentifie l'appel MCP (token dédié au module ou `DOLAPIKEY`) et résout l'utilisateur Dolibarr ;
   refuse en 401/403 sinon.
3. Construit le serveur : `Server::builder()->setServerInfo('Dolibarr MCP', <version>)`
   → enregistre/découvre les classes de `mcp/Tools/` → `build()`.
4. Sert la requête via `StreamableHttpTransport` (pont PSR-7 : request + responseFactory + streamFactory).
5. Chaque outil appelle directement les classes Dolibarr (`Societe`, `Facture`, …) sous l'identité
   `$user` ; pas de couche REST intermédiaire ni de credentials externes.

## 5. Portée du squelette (cette étape)

Inclus :

- `modMcpServer.class.php` fonctionnel (le module s'active dans Dolibarr).
- `admin/setup.php` + `lib/mcpserver.lib.php` (page de config minimale).
- `langs/{en_US,fr_FR}/mcpserver.lang`.
- `composer.json` (`require: mcp/sdk`).
- `mcp/server.php` opérationnel + **un outil d'exemple** (lister/lire un tiers `Societe`)
  dans `mcp/Tools/`, câblé en Streamable HTTP.
- `README.md` du module (installation dans `htdocs/custom/`, `composer install`, activation, config client MCP).

Exclu (travail ultérieur) : catalogue complet des outils, tests, packaging/CI.

## 6. Critères de réussite

- La branche `rewrite/php-module` ne contient plus de code TS/Node ; seules les docs listées en §2 subsistent.
- L'arborescence du module §3 existe et le descripteur est syntaxiquement valide (PHP lint).
- `composer.json` déclare `mcp/sdk` ; `mcp/server.php` instancie le serveur et un outil d'exemple.
- Le README explique l'installation et le branchement d'un client MCP.

## Références

- [Official PHP SDK for MCP (annonce)](https://blog.modelcontextprotocol.io/posts/2025-09-05-php-sdk/)
- [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk)
- [mcp/sdk — Packagist](https://packagist.org/packages/mcp/sdk)
- [Dolibarr — Module development (wiki)](https://wiki.dolibarr.org/index.php/Module_development)
