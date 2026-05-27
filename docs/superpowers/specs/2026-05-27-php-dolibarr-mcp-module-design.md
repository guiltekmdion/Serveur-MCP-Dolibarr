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
core/modules/modMcpServer.class.php   # descripteur (extends DolibarrModules) : numero, nom,
                                       #   description, droit 'use', page de config (setup.php@mcpserver)
admin/setup.php                       # page de configuration : statut endpoint + URL + rappel DOLAPIKEY
lib/mcpserver.lib.php                 # helpers (mcpserverAdminPrepareHead : onglets admin)
mcp/server.php                        # endpoint HTTP : bootstrap headless Dolibarr + StreamableHttpTransport
mcp/Tools/                            # classes de capacités annotées #[McpTool] (ex. ThirdPartyTools)
langs/en_US/mcpserver.lang            # traductions anglaises
langs/fr_FR/mcpserver.lang            # traductions françaises
sql/                                  # vide au départ (aucune table requise par le squelette)
composer.json                         # require: mcp/sdk + nyholm/psr7 (PSR-7/17 pour le transport HTTP) ; PHP >= 8.1
README.md                             # documentation du module
```

Droit unique au départ : `mcpserver -> use` (« Utiliser le serveur MCP »), vérifié à l'auth (§4.2).
Le `numero` du module sera choisi dans une plage non réservée à l'implémentation.

## 4. Transport & flux d'exécution (Streamable HTTP)

Le SDK officiel supporte `StdioTransport` et `StreamableHttpTransport`. Pour un module web natif,
le **Streamable HTTP** est le choix idiomatique recommandé.

### 4.1 Bootstrap (décision figée)

`mcp/server.php` **n'utilise pas `main.inc.php`** (réservé aux pages HTML : session, menus, jetons
CSRF, thème). Il reproduit le bootstrap *headless* de `api/index.php` : définir les constantes
puis inclure `master.inc.php` (chargement bas niveau de `$conf` et `$db`, sans flux de login HTML).

```php
if (!defined('NOCSRFCHECK'))    define('NOCSRFCHECK', '1');
if (!defined('NOTOKENRENEWAL')) define('NOTOKENRENEWAL', '1');
if (!defined('NOREQUIREMENU'))  define('NOREQUIREMENU', '1');
if (!defined('NOREQUIREHTML'))  define('NOREQUIREHTML', '1');
if (!defined('NOREQUIREAJAX'))  define('NOREQUIREAJAX', '1');
if (!defined('NOREQUIRESOC'))   define('NOREQUIRESOC', '1');
require __DIR__.'/../../../main.inc.php'; // = htdocs/master.inc.php via le chemin custom
```
> Le chemin exact vers `master.inc.php` (selon l'emplacement `htdocs/custom/mcpserver/mcp/`)
> sera résolu à l'implémentation en s'alignant sur la façon dont `api/index.php` le calcule.

### 4.2 Authentification (décision figée : réutiliser `DOLAPIKEY`)

Pas de système de token propre au module. On réutilise l'infrastructure de clés API existante de
Dolibarr (clé par utilisateur, gérée par les admins dans la fiche utilisateur) :

1. Lire l'en-tête HTTP `DOLAPIKEY` (refus **401** si absent).
2. Résoudre l'entité via l'en-tête optionnel `DOLAPIENTITY` (multi-entité), sinon entité par défaut.
3. `SELECT rowid FROM llx_user WHERE api_key = <clé> AND statut = 1` ; refus **403** si aucune ligne.
4. Charger `$user = new User($db); $user->fetch($rowid); $user->loadRights();`.
5. Vérifier la permission du module (`$user->hasRight('mcpserver', 'use')`) ; refus **403** sinon.

Ce flux reproduit la logique de `DolibarrApiAccess` du module REST natif, donc comportement et
gestion des droits cohérents avec l'API officielle.

### 4.3 Flux de service

1. Bootstrap (§4.1) + authentification (§4.2) → `$user` résolu et autorisé.
2. Construire le serveur : `Server::builder()->setServerInfo('Dolibarr MCP', <version>)`
   → découverte/enregistrement des classes de `mcp/Tools/` → `build()`.
3. Construire la requête PSR-7 depuis les superglobales et servir via `StreamableHttpTransport`
   (PSR-7 request + PSR-17 responseFactory + streamFactory, fournis par `nyholm/psr7`).
4. Chaque outil appelle directement les classes métier Dolibarr (`Societe`, `Facture`, …) sous
   l'identité `$user` ; aucune couche REST intermédiaire ni credentials externes.

## 5. Portée du squelette (cette étape)

Inclus :

- `modMcpServer.class.php` fonctionnel (le module s'active dans Dolibarr ; droit `use`).
- `admin/setup.php` + `lib/mcpserver.lib.php` (page de config minimale).
- `langs/{en_US,fr_FR}/mcpserver.lang`.
- `composer.json` (`require: mcp/sdk`, `nyholm/psr7`).
- `mcp/server.php` opérationnel (bootstrap headless + auth `DOLAPIKEY` + StreamableHttpTransport).
- **Un outil d'exemple** `mcp/Tools/ThirdPartyTools.php` avec deux méthodes `#[McpTool]` :
  `thirdparty_list` (liste paginée via `Societe`) et `thirdparty_get` (lecture par id), exécutées
  sous `$user`.
- `README.md` du module (installation dans `htdocs/custom/`, `composer install`, activation, génération
  de la clé `DOLAPIKEY`, config d'un client MCP vers l'endpoint Streamable HTTP).

Exclu (travail ultérieur) : catalogue complet des outils, tests, packaging/CI.

## 6. Critères de réussite

- La branche `rewrite/php-module` ne contient plus de code TS/Node ; seules les docs listées en §2 subsistent.
- L'arborescence du module §3 existe et tous les `.php` passent `php -l` (lint).
- `composer.json` déclare `mcp/sdk` + `nyholm/psr7` ; `mcp/server.php` fait le bootstrap headless,
  l'auth `DOLAPIKEY`, instancie le serveur et expose l'outil d'exemple en Streamable HTTP.
- Le README explique l'installation, la génération de la clé `DOLAPIKEY` et le branchement d'un client MCP.

## Références

- [Official PHP SDK for MCP (annonce)](https://blog.modelcontextprotocol.io/posts/2025-09-05-php-sdk/)
- [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk)
- [mcp/sdk — Packagist](https://packagist.org/packages/mcp/sdk)
- [Dolibarr — Module development (wiki)](https://wiki.dolibarr.org/index.php/Module_development)
- [Dolibarr — Module Web Services API REST (auth DOLAPIKEY, bootstrap)](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(developer))
