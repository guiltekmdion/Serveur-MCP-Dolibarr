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
connaissance documentaire de l'API Dolibarr, et (2) un module PHP **complet et propre** au sens
du cycle de vie Dolibarr — installation, désinstallation, et modèle de droits parfaitement gérés —
livré avec le **domaine « tiers » comme patron d'outils de référence**. Les autres domaines d'outils
(factures, commandes, stocks…) s'ajoutent ensuite de façon incrémentale en réutilisant ce patron.

## Objectifs

- Repartir d'une branche propre, sans code TypeScript ni infra Node.
- Préserver la connaissance accumulée sur l'API Dolibarr (références, exploration, standards, cas d'usage).
- Livrer un module Dolibarr conforme aux conventions (modulebuilder), **installable et
  désinstallable proprement** (aucun résidu : droits, constantes, menus retirés à la désactivation).
- Modèle de droits **parfait** : accès au MCP contrôlé par utilisateur (case à cocher = droit module),
  et chaque opération soumise aux **droits API natifs** de Dolibarr (§7).
- Serveur MCP opérationnel via **Streamable HTTP**, avec le **domaine tiers** complet comme référence.

## Non-objectifs

- Implémenter dès maintenant tous les domaines d'outils (factures, commandes, stocks, tickets…) —
  ajout incrémental ultérieur sur le patron du domaine tiers.
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

Modèle de droits : voir §7. Le `numero` du module sera choisi dans une plage non réservée
à l'implémentation. Tout ce qui est créé à l'activation (droit, constantes, menus, onglets) est
déclaré dans le descripteur pour être retiré automatiquement à la désactivation (§8).

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
5. Vérifier le droit d'accès MCP (`$user->hasRight('mcpserver', 'use')`, la « case à cocher »
   par utilisateur — voir §7) ; refus **403** sinon.

L'auth ne fait qu'ouvrir l'accès au serveur. **Chaque outil applique ensuite les droits API natifs**
de l'objet manipulé (§7). Ce flux reproduit la logique de `DolibarrApiAccess` du module REST natif :
mêmes clés API, mêmes permissions, comportement cohérent avec l'API officielle.

### 4.3 Flux de service

1. Bootstrap (§4.1) + authentification (§4.2) → `$user` résolu et autorisé.
2. Construire le serveur : `Server::builder()->setServerInfo('Dolibarr MCP', <version>)`
   → découverte/enregistrement des classes de `mcp/Tools/` → `build()`.
3. Construire la requête PSR-7 depuis les superglobales et servir via `StreamableHttpTransport`
   (PSR-7 request + PSR-17 responseFactory + streamFactory, fournis par `nyholm/psr7`).
4. Chaque outil appelle directement les classes métier Dolibarr (`Societe`, `Facture`, …) sous
   l'identité `$user` ; aucune couche REST intermédiaire ni credentials externes.

## 5. Portée de cette étape (module complet + domaine tiers)

Inclus :

- `modMcpServer.class.php` **complet** : descripteur conforme (numero, famille, version, droit `use`,
  page de config, menu admin, constantes), avec `init()`/`remove()` reposant sur le cycle de vie
  natif (§8) → activation/désactivation/suppression sans résidu.
- `admin/setup.php` + `lib/mcpserver.lib.php` : page de config (statut endpoint, URL, rappel
  génération `DOLAPIKEY`, lien vers les permissions).
- `langs/{en_US,fr_FR}/mcpserver.lang`.
- `composer.json` (`require: mcp/sdk`, `nyholm/psr7`).
- `mcp/server.php` opérationnel (bootstrap headless + auth `DOLAPIKEY` + droit `use` +
  StreamableHttpTransport).
- **Domaine tiers de référence** `mcp/Tools/ThirdPartyTools.php` — patron complet à reproduire pour
  les autres domaines, couvrant lecture **et** écriture pour démontrer le contrôle de droits (§7) :
  - `thirdparty_list` / `thirdparty_get` → garde `societe->lire`
  - `thirdparty_create` / `thirdparty_update` → garde `societe->creer`
  - `thirdparty_delete` → garde `societe->supprimer`
  Chaque méthode `#[McpTool]` s'exécute sous `$user` et vérifie le droit natif avant l'opération.
- `README.md` du module (installation dans `htdocs/custom/`, `composer install`, activation, génération
  de la clé `DOLAPIKEY`, attribution du droit MCP, config d'un client MCP vers l'endpoint Streamable HTTP).

Exclu (ajout incrémental ultérieur sur le patron tiers) : les autres domaines d'outils, tests, packaging/CI.

## 6. Critères de réussite

- La branche `rewrite/php-module` ne contient plus de code TS/Node ; seules les docs listées en §2 subsistent.
- L'arborescence du module §3 existe et tous les `.php` passent `php -l` (lint).
- `composer.json` déclare `mcp/sdk` + `nyholm/psr7` ; `mcp/server.php` fait le bootstrap headless,
  l'auth `DOLAPIKEY` + le droit `use`, instancie le serveur et expose le domaine tiers en Streamable HTTP.
- **Cycle de vie propre** : à l'activation le droit/constantes/menus sont créés ; à la désactivation
  ils sont retirés ; aucune table ni constante orpheline ne subsiste après suppression (§8).
- **Droits** : sans droit `mcpserver->use` l'accès est refusé (403) ; un appel d'écriture sans le
  droit natif correspondant (ex. `societe->creer`) est refusé même si `use` est accordé.
- Le README explique l'installation, la génération de la clé `DOLAPIKEY`, l'attribution du droit MCP
  et le branchement d'un client MCP.

## 7. Modèle de droits (parfait, basé sur les droits API)

Deux niveaux, sans permission redondante propre au module :

**Niveau 1 — Accès au serveur MCP (case à cocher par utilisateur).**
Le module déclare **un seul droit** `mcpserver->use` (« Accéder au serveur MCP / Utiliser l'API MCP »).
C'est une permission Dolibarr standard : elle apparaît dans l'onglet *Permissions* de chaque
utilisateur/groupe, donc l'admin **coche/décoche** qui a le droit d'utiliser le MCP. Vérifiée à
l'authentification (§4.2, étape 5). Décochée ⇒ 403, même avec une `DOLAPIKEY` valide.

**Niveau 2 — Droits API natifs par opération.**
Au-delà de l'accès, **aucune action n'échappe aux permissions Dolibarr existantes** — exactement
celles qu'utilise l'API REST. Chaque outil, avant d'agir, vérifie le droit natif de l'objet :

| Opération outil | Droit natif vérifié |
|---|---|
| lecture (`*_list`, `*_get`) | `societe->lire`, `facture->lire`, … |
| création/modification (`*_create`, `*_update`) | `societe->creer`, `facture->creer`, … |
| suppression (`*_delete`) | `societe->supprimer`, `facture->supprimer`, … |

Le contrôle se fait via `$user->hasRight('societe', 'lire')` (etc.) en début de méthode ; refus =
erreur MCP « permission refusée » (mappée 403). Comme l'outil s'exécute sous le `$user` résolu depuis
la clé API, **les droits effectifs d'un utilisateur via MCP sont identiques à ses droits via l'API REST
ou l'interface web**. Un admin ne configure donc rien de nouveau : il réutilise les droits qu'il gère déjà.

## 8. Cycle de vie : installation & désinstallation propres

S'appuie sur le mécanisme natif `DolibarrModules` : tout ce qui est déclaré dans le descripteur est
créé par `init()` à l'activation et retiré par `remove()` à la désactivation/suppression. **Règle :
ne rien créer hors de ce qui est déclaré**, pour garantir un retrait intégral.

**Déclaré dans `modMcpServer.class.php` (donc auto-créé puis auto-supprimé) :**

- `$this->rights` → le droit `mcpserver->use` (inséré dans `llx_rights_def`, retiré à la désactivation).
- `$this->const` → toute constante de config du module (ex. activation endpoint), retirée à la désactivation.
- `$this->menu` / `$this->tabs` → entrée(s) d'admin, retirées à la désactivation.
- `$this->module_parts` → déclarations (css/hooks le cas échéant), nettoyées automatiquement.

**SQL :** le squelette n'introduit **aucune table** (`sql/` vide) → rien à *drop*, donc aucune donnée
ni table orpheline après suppression. Si un futur besoin de table apparaît, prévoir explicitement le
script de suppression, car Dolibarr ne *drop* pas les tables automatiquement (préservation des données).

**Distinction désactiver / supprimer :**

- *Désactiver* (`remove()`) : retire droits, constantes, menus, onglets ; le code reste sur le disque.
- *Supprimer* : effacer le dossier `htdocs/custom/mcpserver/` (code + `vendor/`). Comme aucune table
  n'est créée, il ne reste **aucun résidu** en base.

**Vérification (critère §6) :** activer → constatation du droit/menu ; désactiver → disparition du droit
et de la constante (contrôle en base `llx_rights_def` / `llx_const`) ; réactiver → tout revient.

## Références

- [Official PHP SDK for MCP (annonce)](https://blog.modelcontextprotocol.io/posts/2025-09-05-php-sdk/)
- [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk)
- [mcp/sdk — Packagist](https://packagist.org/packages/mcp/sdk)
- [Dolibarr — Module development (wiki)](https://wiki.dolibarr.org/index.php/Module_development)
- [Dolibarr — Module Web Services API REST (auth DOLAPIKEY, bootstrap)](https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST_(developer))
