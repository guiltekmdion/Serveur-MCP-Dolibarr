# Module Dolibarr MCP (`mcpserver`) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer la branche `rewrite/php-module` en un module Dolibarr PHP natif `mcpserver` qui expose les données Dolibarr via le SDK MCP PHP officiel (`mcp/sdk`), en réutilisant l'auth `DOLAPIKEY` et les droits natifs, livré complet avec le domaine « tiers » comme patron d'outils.

**Architecture :** Module placé à la racine du dépôt (clonable dans `htdocs/custom/mcpserver/`). Un endpoint HTTP headless (`mcp/server.php`) bootstrappe Dolibarr via `master.inc.php`, authentifie l'appel par `DOLAPIKEY` → `$user` (droit `mcpserver->use`), puis sert le protocole via `StreamableHttpTransport`. Les outils (`mcp/Tools/`) sont des classes annotées `#[McpTool]`, exécutées sous `$user`, qui vérifient les droits Dolibarr natifs avant toute opération. Install/désinstallation reposent intégralement sur le cycle de vie `DolibarrModules` (rien créé hors descripteur → retrait total).

**Tech Stack :** PHP 8.1+, Dolibarr 19+, Composer ; `mcp/sdk`, `nyholm/psr7`, `php-http/discovery`, `laminas/laminas-httphandlerrunner`.

**Note vérification :** Un module Dolibarr n'est pas testable en TDD unitaire hors instance Dolibarr (dépendance lourde aux globals `$db`/`$user`/`$conf` et au framework). La vérification automatisée de chaque tâche se limite donc à `php -l` (syntaxe) et à des contrôles structurels (`grep`/`git`). La validation fonctionnelle (activation, droits, appel MCP) se fait via la **checklist manuelle de la Tâche 11** dans une instance Dolibarr de dev.

**Spec de référence :** `docs/superpowers/specs/2026-05-27-php-dolibarr-mcp-module-design.md`

---

## Structure des fichiers (cible)

Créés :
- `composer.json` — dépendances + autoload PSR-4 `Dolibarr\McpServer\` → `mcp/`
- `core/modules/modMcpServer.class.php` — descripteur (droit `use`, constante, page config, cycle de vie)
- `lib/mcpserver.lib.php` — `mcpserverAdminPrepareHead()` (onglets admin)
- `admin/setup.php` — page de configuration (statut, URL endpoint, rappels)
- `mcp/server.php` — endpoint HTTP headless (bootstrap + auth + transport)
- `mcp/McpAuth.php` — résolution `DOLAPIKEY` → `$user` + contrôle droit `use`
- `mcp/Tools/ThirdPartyTools.php` — domaine tiers de référence (`#[McpTool]`)
- `langs/en_US/mcpserver.lang`, `langs/fr_FR/mcpserver.lang`
- `README.md` — installation / usage
- `.gitignore` — réécrit pour module PHP (`/vendor/`)

Supprimés : tout le code TS/Node + docs hors connaissance API (voir Tâches 1-2).

---

## Task 1: Nettoyer le code TypeScript et l'infra Node

**Files:**
- Delete: `src/`, `tests/`, `dist/`, `node_modules/`, `package.json`, `package-lock.json`, `tsconfig.json`, `run-tests.js`, `scripts/`, `extras/`, `examples/`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `.github/workflows/`, `CHANGELOG.md`, `CONTRIBUTING.md`, `README.md`

- [ ] **Step 1: Supprimer les fichiers/dossiers TS & infra suivis par git**

```bash
git rm -r --quiet -- src tests dist scripts extras examples \
  package.json package-lock.json tsconfig.json run-tests.js \
  Dockerfile docker-compose.yml .env.example \
  .github/workflows CHANGELOG.md CONTRIBUTING.md README.md
```

- [ ] **Step 2: Supprimer les résidus non suivis (node_modules, dist éventuel)**

```bash
rm -rf node_modules dist
```

- [ ] **Step 3: Vérifier qu'il ne reste aucun source TS**

Run: `find . -path ./.git -prune -o \( -name '*.ts' -o -name 'package.json' \) -print`
Expected: aucune sortie (aucun `.ts` ni `package.json` restant).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove TypeScript MCP server and Node infra"
```

---

## Task 2: Élaguer la documentation et réécrire .gitignore

**Files:**
- Delete: `docs/01-installation.md`, `docs/02-configuration.md`, `docs/04-docker.md`, `docs/INSTALL.md`, `docs/QUICKSTART.md`, `docs/QUICKSTART-ADVANCED.md`, `docs/START_HERE.md`, `docs/PROJECT_STRUCTURE.md`, `docs/PROJECT_SUMMARY.md`, `docs/INDEX.md`, `docs/RELEASE-PROCESS.md`, `docs/CLEANUP-AUDIT.md`, `docs/WEBHOOK.md`
- Modify (rewrite): `.gitignore`

- [ ] **Step 1: Supprimer les docs spécifiques au serveur TS / process**

```bash
git rm --quiet -- \
  docs/01-installation.md docs/02-configuration.md docs/04-docker.md \
  docs/INSTALL.md docs/QUICKSTART.md docs/QUICKSTART-ADVANCED.md docs/START_HERE.md \
  docs/PROJECT_STRUCTURE.md docs/PROJECT_SUMMARY.md docs/INDEX.md \
  docs/RELEASE-PROCESS.md docs/CLEANUP-AUDIT.md docs/WEBHOOK.md
```

- [ ] **Step 2: Vérifier que la connaissance API Dolibarr est conservée**

Run: `ls docs/*.md`
Expected (exactement ces 9) : `API.md API-REFERENCE.md API-STANDARDS.md API_EXPLORATION.md COMPATIBILITY.md 03-tools.md 50-USE-CASES.md ADVANCED-MODULES.md BUGFIX-PROPOSALS.md` (plus le dossier `docs/superpowers/`).

- [ ] **Step 3: Réécrire `.gitignore` pour un module PHP**

```gitignore
# Composer
/vendor/
composer.phar

# Dolibarr / runtime
*.log
/mcp/sessions/

# OS / éditeurs
.DS_Store
.idea/
.vscode/
*.swp
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: keep only Dolibarr API knowledge; reset .gitignore for PHP module"
```

---

## Task 3: composer.json et dépendances

**Files:**
- Create: `composer.json`

- [ ] **Step 1: Créer `composer.json` (base + autoload PSR-4)**

```json
{
    "name": "guiltek/dolibarr-mcpserver",
    "description": "Serveur MCP natif pour Dolibarr (SDK MCP PHP officiel)",
    "type": "dolibarr-module",
    "license": "GPL-3.0-or-later",
    "require": {
        "php": ">=8.1",
        "mcp/sdk": "*",
        "nyholm/psr7": "^1.8",
        "php-http/discovery": "^1.19",
        "laminas/laminas-httphandlerrunner": "^2.10"
    },
    "autoload": {
        "psr-4": {
            "Dolibarr\\McpServer\\": "mcp/"
        }
    },
    "config": {
        "allow-plugins": {
            "php-http/discovery": true
        }
    }
}
```

- [ ] **Step 2: Résoudre et installer les dépendances**

Run: `composer update --no-interaction`
Expected: création de `vendor/` et `composer.lock` ; `mcp/sdk`, `nyholm/psr7`, `php-http/discovery`, `laminas/laminas-httphandlerrunner` installés sans erreur. Si `mcp/sdk:*` échoue, lancer `composer require mcp/sdk` pour fixer la contrainte exacte publiée.

- [ ] **Step 3: Valider le composer.json**

Run: `composer validate --no-check-publish`
Expected: `./composer.json is valid`.

- [ ] **Step 4: Commit**

```bash
git add composer.json composer.lock
git commit -m "build: composer manifest with official mcp/sdk and PSR-7 deps"
```

---

## Task 4: Fichiers de langue

**Files:**
- Create: `langs/en_US/mcpserver.lang`, `langs/fr_FR/mcpserver.lang`

- [ ] **Step 1: Créer `langs/en_US/mcpserver.lang`**

```
# Module mcpserver - English
Module500100Name=MCP Server
Module500100Desc=Native MCP server exposing Dolibarr to AI agents (official PHP MCP SDK)
McpServerSetup=MCP Server setup
McpServerEndpoint=MCP endpoint URL
McpServerEnabled=Enable MCP endpoint
McpServerApiKeyHint=Each user must generate an API key (DOLAPIKEY) in their user card and be granted the "Access the MCP server" permission.
Permission500101=Access the MCP server (use the MCP API)
```

- [ ] **Step 2: Créer `langs/fr_FR/mcpserver.lang`**

```
# Module mcpserver - Francais
Module500100Name=Serveur MCP
Module500100Desc=Serveur MCP natif exposant Dolibarr aux agents IA (SDK MCP PHP officiel)
McpServerSetup=Configuration du serveur MCP
McpServerEndpoint=URL de l'endpoint MCP
McpServerEnabled=Activer l'endpoint MCP
McpServerApiKeyHint=Chaque utilisateur doit generer une cle API (DOLAPIKEY) dans sa fiche et recevoir la permission "Acceder au serveur MCP".
Permission500101=Acceder au serveur MCP (utiliser l'API MCP)
```

- [ ] **Step 3: Vérifier la présence des clés de nom de module**

Run: `grep -l 'Module500100Name' langs/en_US/mcpserver.lang langs/fr_FR/mcpserver.lang`
Expected: les deux fichiers listés.

- [ ] **Step 4: Commit**

```bash
git add langs/
git commit -m "feat(mcpserver): add en_US and fr_FR language files"
```

---

## Task 5: Descripteur de module (cycle de vie + droits)

**Files:**
- Create: `core/modules/modMcpServer.class.php`

- [ ] **Step 1: Créer le descripteur**

```php
<?php
/**
 * \file    core/modules/modMcpServer.class.php
 * \brief   Descripteur du module MCP Server.
 */

require_once DOL_DOCUMENT_ROOT.'/core/modules/DolibarrModules.class.php';

/**
 * Module d'activation du serveur MCP natif Dolibarr.
 */
class modMcpServer extends DolibarrModules
{
    /**
     * @param DoliDB $db Handler base de donnees
     */
    public function __construct($db)
    {
        global $langs, $conf;
        $this->db = $db;

        $this->numero = 500100;
        $this->rights_class = 'mcpserver';
        $this->family = "interface";
        $this->module_position = '90';
        $this->name = preg_replace('/^mod/i', '', get_class($this));
        $this->description = "Serveur MCP natif pour Dolibarr (SDK MCP PHP officiel)";
        $this->descriptionlong = "Expose les donnees Dolibarr aux agents IA via le Model Context Protocol, en reutilisant les cles API (DOLAPIKEY) et les droits natifs.";
        $this->version = '1.0.0';
        $this->const_name = 'MAIN_MODULE_'.strtoupper($this->name);
        $this->picto = 'generic';

        $this->phpmin = array(8, 1);
        $this->need_dolibarr_version = array(19, 0);

        // Page de configuration
        $this->config_page_url = array("setup.php@mcpserver");

        // Dependances : le module API REST fournit l'infra de cles api_key
        $this->depends = array('modApi');
        $this->requiredby = array();
        $this->conflictwith = array();
        $this->langfiles = array("mcpserver@mcpserver");

        // Constantes (creees a l'activation, supprimees a la desactivation)
        $this->const = array();
        $this->const[0] = array('MCPSERVER_ENABLED', 'chaine', '1', 'Active l endpoint MCP', 0, 'current', 1);

        // Boxes / cronjobs : aucun
        $this->boxes = array();
        $this->cronjobs = array();

        // Permissions (creees a l'activation, supprimees a la desactivation)
        $this->rights = array();
        $r = 0;
        $this->rights[$r][0] = 500101;
        $this->rights[$r][1] = 'Acceder au serveur MCP (utiliser l API MCP)';
        $this->rights[$r][2] = 'w';
        $this->rights[$r][3] = 0;          // non accorde par defaut : l'admin coche par utilisateur
        $this->rights[$r][4] = 'use';
        $this->rights[$r][5] = '';
        $r++;

        // Menus / onglets / repertoires : aucun (acces via la page de config du module)
        $this->menu = array();
        $this->tabs = array();
        $this->dirs = array();
    }

    /**
     * Activation : insere constantes, permissions, etc. declares ci-dessus.
     *
     * @param string $options Options
     * @return int <0 si KO, >0 si OK
     */
    public function init($options = '')
    {
        return $this->_init(array(), $options);
    }

    /**
     * Desactivation : retire tout ce que init() a cree.
     *
     * @param string $options Options
     * @return int <0 si KO, >0 si OK
     */
    public function remove($options = '')
    {
        return $this->_remove(array(), $options);
    }
}
```

- [ ] **Step 2: Lint**

Run: `php -l core/modules/modMcpServer.class.php`
Expected: `No syntax errors detected`.

- [ ] **Step 3: Commit**

```bash
git add core/modules/modMcpServer.class.php
git commit -m "feat(mcpserver): module descriptor with 'use' right and clean lifecycle"
```

---

## Task 6: Librairie d'onglets + page de configuration

**Files:**
- Create: `lib/mcpserver.lib.php`
- Create: `admin/setup.php`

- [ ] **Step 1: Créer `lib/mcpserver.lib.php`**

```php
<?php
/**
 * \file    lib/mcpserver.lib.php
 * \brief   Fonctions utilitaires d'administration du module mcpserver.
 */

/**
 * Prepare l'entete des onglets de configuration.
 *
 * @return array Tableau d'onglets
 */
function mcpserverAdminPrepareHead()
{
    global $langs, $conf;

    $langs->load("mcpserver@mcpserver");

    $h = 0;
    $head = array();

    $head[$h][0] = dol_buildpath("/mcpserver/admin/setup.php", 1);
    $head[$h][1] = $langs->trans("Settings");
    $head[$h][2] = 'settings';
    $h++;

    complete_head_from_modules($conf, $langs, null, $head, $h, 'mcpserver@mcpserver');
    complete_head_from_modules($conf, $langs, null, $head, $h, 'mcpserver@mcpserver', 'remove');

    return $head;
}
```

- [ ] **Step 2: Créer `admin/setup.php`**

```php
<?php
/**
 * \file    admin/setup.php
 * \brief   Page de configuration du module mcpserver.
 */

// Charger l'environnement Dolibarr (page HTML d'admin -> main.inc.php)
$res = 0;
if (!$res && file_exists("../../main.inc.php")) {
    $res = include "../../main.inc.php";
}
if (!$res && file_exists("../../../main.inc.php")) {
    $res = include "../../../main.inc.php";
}
if (!$res) {
    die("Include of main fails");
}

require_once DOL_DOCUMENT_ROOT.'/core/lib/admin.lib.php';
dol_include_once('/mcpserver/lib/mcpserver.lib.php');

$langs->loadLangs(array("admin", "mcpserver@mcpserver"));

if (empty($user->admin)) {
    accessforbidden();
}

$action = GETPOST('action', 'aZ09');

if ($action == 'setenabled') {
    $value = GETPOSTINT('value');
    dolibarr_set_const($db, 'MCPSERVER_ENABLED', $value, 'chaine', 0, '', $conf->entity);
    setEventMessages($langs->trans("RecordModifiedSuccessfully"), null, 'mesgs');
}

$endpoint = DOL_MAIN_URL_ROOT.'/custom/mcpserver/mcp/server.php';
$enabled = !empty(getDolGlobalString('MCPSERVER_ENABLED'));

llxHeader('', $langs->trans("McpServerSetup"));

$head = mcpserverAdminPrepareHead();
print dol_get_fiche_head($head, 'settings', $langs->trans("McpServerSetup"), -1, 'generic');

print '<table class="noborder centpercent">';
print '<tr class="liste_titre"><td>'.$langs->trans("Parameter").'</td><td>'.$langs->trans("Value").'</td></tr>';

// Activation endpoint
print '<tr class="oddeven"><td>'.$langs->trans("McpServerEnabled").'</td><td>';
if ($enabled) {
    print '<a href="'.$_SERVER["PHP_SELF"].'?action=setenabled&token='.newToken().'&value=0">'.img_picto($langs->trans("Enabled"), 'switch_on').'</a>';
} else {
    print '<a href="'.$_SERVER["PHP_SELF"].'?action=setenabled&token='.newToken().'&value=1">'.img_picto($langs->trans("Disabled"), 'switch_off').'</a>';
}
print '</td></tr>';

// URL endpoint
print '<tr class="oddeven"><td>'.$langs->trans("McpServerEndpoint").'</td><td><code>'.dol_escape_htmltag($endpoint).'</code></td></tr>';

print '</table>';

print '<br><div class="info">'.$langs->trans("McpServerApiKeyHint").'</div>';

print dol_get_fiche_end();

llxFooter();
$db->close();
```

- [ ] **Step 3: Lint**

Run: `php -l lib/mcpserver.lib.php && php -l admin/setup.php`
Expected: `No syntax errors detected` pour les deux.

- [ ] **Step 4: Commit**

```bash
git add lib/mcpserver.lib.php admin/setup.php
git commit -m "feat(mcpserver): admin setup page and tab helper"
```

---

## Task 7: Authentification (DOLAPIKEY → $user)

**Files:**
- Create: `mcp/McpAuth.php`

- [ ] **Step 1: Créer `mcp/McpAuth.php`**

```php
<?php

namespace Dolibarr\McpServer;

/**
 * Authentification des appels MCP via la cle API Dolibarr (DOLAPIKEY).
 * Reproduit la logique de DolibarrApiAccess du module REST natif.
 */
class McpAuth
{
    /**
     * Resout l'utilisateur Dolibarr a partir de l'en-tete DOLAPIKEY.
     * Termine la requete (401/403) si l'authentification ou le droit echoue.
     *
     * @param \DoliDB $db Handler base
     * @return \User Utilisateur authentifie et autorise
     */
    public static function authenticate($db): \User
    {
        global $conf;

        $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_UPPER) : array();
        $apikey = $_SERVER['HTTP_DOLAPIKEY'] ?? ($headers['DOLAPIKEY'] ?? '');

        if (empty($apikey)) {
            self::fail(401, 'Missing DOLAPIKEY header');
        }

        // Multi-entite optionnel
        $entity = (int) ($_SERVER['HTTP_DOLAPIENTITY'] ?? ($headers['DOLAPIENTITY'] ?? $conf->entity));
        if ($entity > 0) {
            $conf->entity = $entity;
        }

        $sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."user";
        $sql .= " WHERE api_key = '".$db->escape($apikey)."'";
        $sql .= " AND statut = 1";
        $sql .= " AND entity IN (0, ".((int) $conf->entity).")";

        $resql = $db->query($sql);
        if (!$resql || $db->num_rows($resql) == 0) {
            self::fail(403, 'Invalid API key');
        }
        $obj = $db->fetch_object($resql);

        $user = new \User($db);
        if ($user->fetch($obj->rowid) <= 0) {
            self::fail(403, 'Cannot load user');
        }
        $user->loadRights();

        if (empty($user->hasRight('mcpserver', 'use'))) {
            self::fail(403, 'User not allowed to access the MCP server');
        }

        return $user;
    }

    /**
     * Emet une erreur HTTP JSON et termine la requete.
     *
     * @param int    $code    Code HTTP
     * @param string $message Message
     * @return never
     */
    private static function fail(int $code, string $message): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(array('error' => array('code' => $code, 'message' => $message)));
        exit;
    }
}
```

- [ ] **Step 2: Lint**

Run: `php -l mcp/McpAuth.php`
Expected: `No syntax errors detected`.

- [ ] **Step 3: Commit**

```bash
git add mcp/McpAuth.php
git commit -m "feat(mcpserver): DOLAPIKEY authentication resolving Dolibarr user"
```

---

## Task 8: Domaine tiers de référence (outils MCP)

**Files:**
- Create: `mcp/Tools/ThirdPartyTools.php`

- [ ] **Step 1: Créer `mcp/Tools/ThirdPartyTools.php`**

```php
<?php

namespace Dolibarr\McpServer\Tools;

use Mcp\Capability\Attribute\McpTool;

require_once DOL_DOCUMENT_ROOT.'/societe/class/societe.class.php';

/**
 * Outils MCP pour les tiers (Societe). Patron de reference pour les autres domaines.
 * Chaque methode s'execute sous $user et verifie le droit Dolibarr natif.
 */
class ThirdPartyTools
{
    /**
     * Verifie un droit natif Dolibarr ou leve une exception (mappee en erreur MCP).
     */
    private function requireRight(string $module, string $perm): void
    {
        global $user;
        if (empty($user->hasRight($module, $perm))) {
            throw new \RuntimeException(sprintf('Permission refusee: %s->%s', $module, $perm));
        }
    }

    /**
     * Liste les tiers (clients, prospects, fournisseurs).
     *
     * @param int $limit  Nombre maximum de resultats
     * @param int $offset Decalage de pagination
     * @return array Liste des tiers
     */
    #[McpTool(name: 'thirdparty_list', description: 'Lister les tiers Dolibarr (clients, prospects, fournisseurs).')]
    public function list(int $limit = 25, int $offset = 0): array
    {
        global $db, $user;
        $this->requireRight('societe', 'lire');

        $sql = "SELECT rowid, nom, code_client, code_fournisseur, email, phone, town";
        $sql .= " FROM ".MAIN_DB_PREFIX."societe";
        $sql .= " WHERE entity IN (".getEntity('societe').")";
        if (!empty($user->socid)) {
            $sql .= " AND rowid = ".((int) $user->socid);
        }
        $sql .= $db->order('nom', 'ASC');
        $sql .= $db->plimit((int) $limit, (int) $offset);

        $resql = $db->query($sql);
        if (!$resql) {
            throw new \RuntimeException('Erreur SQL: '.$db->lasterror());
        }
        $rows = array();
        while ($obj = $db->fetch_object($resql)) {
            $rows[] = array(
                'id' => (int) $obj->rowid,
                'name' => $obj->nom,
                'customer_code' => $obj->code_client,
                'supplier_code' => $obj->code_fournisseur,
                'email' => $obj->email,
                'phone' => $obj->phone,
                'town' => $obj->town,
            );
        }
        return array('count' => count($rows), 'rows' => $rows);
    }

    /**
     * Recupere un tiers par son identifiant.
     *
     * @param int $id Identifiant du tiers
     * @return array Donnees du tiers
     */
    #[McpTool(name: 'thirdparty_get', description: 'Recuperer un tiers Dolibarr par son id.')]
    public function get(int $id): array
    {
        global $db, $user;
        $this->requireRight('societe', 'lire');

        $obj = new \Societe($db);
        if ($obj->fetch($id) <= 0) {
            throw new \RuntimeException('Tiers introuvable: '.$id);
        }
        return array(
            'id' => (int) $obj->id,
            'name' => $obj->name,
            'customer_code' => $obj->code_client,
            'supplier_code' => $obj->code_fournisseur,
            'email' => $obj->email,
            'phone' => $obj->phone,
            'address' => $obj->address,
            'zip' => $obj->zip,
            'town' => $obj->town,
            'vat_number' => $obj->tva_intra,
        );
    }

    /**
     * Cree un tiers.
     *
     * @param string      $name  Nom du tiers
     * @param string|null $email Email
     * @param int         $client 1=client, 2=prospect, 3=client/prospect, 0=non
     * @param int         $fournisseur 1=fournisseur, 0=non
     * @return array Identifiant cree
     */
    #[McpTool(name: 'thirdparty_create', description: 'Creer un tiers Dolibarr.')]
    public function create(string $name, ?string $email = null, int $client = 1, int $fournisseur = 0): array
    {
        global $db, $user;
        $this->requireRight('societe', 'creer');

        $obj = new \Societe($db);
        $obj->name = $name;
        $obj->email = $email;
        $obj->client = $client;
        $obj->fournisseur = $fournisseur;

        $id = $obj->create($user);
        if ($id <= 0) {
            throw new \RuntimeException('Echec creation: '.$obj->error);
        }
        return array('id' => (int) $id);
    }

    /**
     * Met a jour un tiers existant.
     *
     * @param int         $id    Identifiant du tiers
     * @param string|null $name  Nouveau nom (optionnel)
     * @param string|null $email Nouvel email (optionnel)
     * @return array Statut
     */
    #[McpTool(name: 'thirdparty_update', description: 'Mettre a jour un tiers Dolibarr.')]
    public function update(int $id, ?string $name = null, ?string $email = null): array
    {
        global $db, $user;
        $this->requireRight('societe', 'creer');

        $obj = new \Societe($db);
        if ($obj->fetch($id) <= 0) {
            throw new \RuntimeException('Tiers introuvable: '.$id);
        }
        if ($name !== null) {
            $obj->name = $name;
        }
        if ($email !== null) {
            $obj->email = $email;
        }
        if ($obj->update($id, $user) <= 0) {
            throw new \RuntimeException('Echec mise a jour: '.$obj->error);
        }
        return array('id' => (int) $id, 'updated' => true);
    }

    /**
     * Supprime un tiers.
     *
     * @param int $id Identifiant du tiers
     * @return array Statut
     */
    #[McpTool(name: 'thirdparty_delete', description: 'Supprimer un tiers Dolibarr.')]
    public function delete(int $id): array
    {
        global $db, $user;
        $this->requireRight('societe', 'supprimer');

        $obj = new \Societe($db);
        if ($obj->fetch($id) <= 0) {
            throw new \RuntimeException('Tiers introuvable: '.$id);
        }
        if ($obj->delete($id, $user) <= 0) {
            throw new \RuntimeException('Echec suppression: '.$obj->error);
        }
        return array('id' => (int) $id, 'deleted' => true);
    }
}
```

- [ ] **Step 2: Lint**

Run: `php -l mcp/Tools/ThirdPartyTools.php`
Expected: `No syntax errors detected`.

- [ ] **Step 3: Vérifier que les 5 outils déclarent une garde de droit**

Run: `grep -c 'requireRight' mcp/Tools/ThirdPartyTools.php`
Expected: `5` (un appel par méthode outil).

- [ ] **Step 4: Commit**

```bash
git add mcp/Tools/ThirdPartyTools.php
git commit -m "feat(mcpserver): thirdparty reference tools with native rights checks"
```

---

## Task 9: Endpoint HTTP (serveur MCP)

**Files:**
- Create: `mcp/server.php`

- [ ] **Step 1: Créer `mcp/server.php`**

```php
<?php
/**
 * \file    mcp/server.php
 * \brief   Endpoint HTTP headless servant le protocole MCP pour Dolibarr.
 */

use Mcp\Server;
use Mcp\Server\Transport\StreamableHttpTransport;
use Mcp\Server\Session\FileSessionStore;
use Http\Discovery\Psr17Factory;
use Laminas\HttpHandlerRunner\Emitter\SapiEmitter;
use Dolibarr\McpServer\McpAuth;

// --- Bootstrap headless Dolibarr (cf. api/index.php) ---
if (!defined('NOCSRFCHECK')) {
    define('NOCSRFCHECK', '1');
}
if (!defined('NOTOKENRENEWAL')) {
    define('NOTOKENRENEWAL', '1');
}
if (!defined('NOREQUIREMENU')) {
    define('NOREQUIREMENU', '1');
}
if (!defined('NOREQUIREHTML')) {
    define('NOREQUIREHTML', '1');
}
if (!defined('NOREQUIREAJAX')) {
    define('NOREQUIREAJAX', '1');
}
if (!defined('NOREQUIRESOC')) {
    define('NOREQUIRESOC', '1');
}

$res = 0;
if (!$res && file_exists(__DIR__."/../../../master.inc.php")) {
    $res = include __DIR__."/../../../master.inc.php";
}
if (!$res && file_exists(__DIR__."/../../../../master.inc.php")) {
    $res = include __DIR__."/../../../../master.inc.php";
}
if (!$res) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Dolibarr bootstrap failed'));
    exit;
}

// --- Autoload Composer (SDK + PSR-7 + tools) ---
require_once __DIR__.'/../vendor/autoload.php';

// --- Module active ? ---
if (empty(getDolGlobalString('MCPSERVER_ENABLED'))) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'MCP server disabled'));
    exit;
}

// --- Authentification : resout $user depuis DOLAPIKEY (401/403 sinon) ---
$user = McpAuth::authenticate($db);
$GLOBALS['user'] = $user;

// --- Stockage de session MCP (persistant entre requetes HTTP) ---
$sessdir = DOL_DATA_ROOT.'/mcpserver/sessions';
dol_mkdir($sessdir);

// --- Construction du serveur MCP (decouverte des outils annotes) ---
$server = Server::builder()
    ->setServerInfo('Dolibarr MCP', '1.0.0', 'Acces MCP natif aux donnees Dolibarr')
    ->setDiscovery(__DIR__, array('Tools'))
    ->setSession(new FileSessionStore($sessdir))
    ->build();

// --- Transport Streamable HTTP a partir des superglobales ---
$transport = new StreamableHttpTransport(
    (new Psr17Factory())->createServerRequestFromGlobals()
);

$result = $server->run($transport);
(new SapiEmitter())->emit($result);
```

- [ ] **Step 2: Lint**

Run: `php -l mcp/server.php`
Expected: `No syntax errors detected`.

- [ ] **Step 3: Vérifier le bootstrap headless (constantes API + master.inc.php)**

Run: `grep -E "NOCSRFCHECK|NOREQUIREMENU|master.inc.php" mcp/server.php`
Expected: les constantes headless et l'inclusion de `master.inc.php` présentes (pas de `main.inc.php`).

- [ ] **Step 4: Commit**

```bash
git add mcp/server.php
git commit -m "feat(mcpserver): streamable HTTP endpoint wiring SDK builder and transport"
```

---

## Task 10: README du module

**Files:**
- Create: `README.md`

- [ ] **Step 1: Créer `README.md`**

````markdown
# Module MCP Server pour Dolibarr

Module Dolibarr natif exposant les données de l'ERP aux agents IA via le **Model Context
Protocol**, à l'aide du [SDK MCP PHP officiel](https://github.com/modelcontextprotocol/php-sdk)
(`mcp/sdk`). Il réutilise l'authentification par clé API (`DOLAPIKEY`) et les permissions
natives de Dolibarr — aucun credential ni couche REST externe.

## Prérequis

- Dolibarr 19+
- PHP 8.1+
- Composer
- Module **API REST** (`modApi`) activé

## Installation

```bash
cd htdocs/custom
git clone <repo> mcpserver
cd mcpserver
composer install --no-dev
```

Puis dans Dolibarr : **Accueil → Configuration → Modules** → activer **Serveur MCP**.

## Configuration

1. **Droit d'accès** : pour chaque utilisateur autorisé, cocher la permission
   *« Accéder au serveur MCP »* (onglet *Permissions* de la fiche utilisateur ou du groupe).
2. **Clé API** : générer une clé `DOLAPIKEY` dans la fiche de l'utilisateur (onglet utilisateur).
3. **Activation de l'endpoint** : page de configuration du module (interrupteur *Activer l'endpoint MCP*).

## Endpoint

```
https://<votre-dolibarr>/custom/mcpserver/mcp/server.php
```

Transport **Streamable HTTP**. En-têtes requis :

- `DOLAPIKEY: <clé de l'utilisateur>`
- `DOLAPIENTITY: <id entité>` (optionnel, multi-société)

## Modèle de droits

- **Accès au serveur** : permission `mcpserver → use` (la case à cocher par utilisateur).
- **Par opération** : chaque outil vérifie le droit Dolibarr natif de l'objet
  (`societe → lire`, `societe → creer`, `societe → supprimer`, …). Les droits effectifs via MCP
  sont donc identiques à ceux de l'utilisateur via l'API REST ou l'interface web.

## Outils disponibles (domaine de référence : tiers)

| Outil | Droit requis |
|---|---|
| `thirdparty_list`, `thirdparty_get` | `societe → lire` |
| `thirdparty_create`, `thirdparty_update` | `societe → creer` |
| `thirdparty_delete` | `societe → supprimer` |

Les autres domaines (factures, commandes, stocks…) s'ajoutent en suivant le patron de
`mcp/Tools/ThirdPartyTools.php`.

## Désinstallation

Désactiver le module retire automatiquement la permission, les constantes et les menus.
Supprimer le dossier `htdocs/custom/mcpserver/` enlève le code ; aucune table n'étant créée,
il ne reste aucun résidu en base.
````

- [ ] **Step 2: Vérifier les sections clés**

Run: `grep -E "DOLAPIKEY|composer install|mcpserver . use|Désinstallation" README.md`
Expected: présence des en-têtes/sections (installation, clé API, droits, désinstallation).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: module README (install, rights, endpoint, uninstall)"
```

---

## Task 11: Vérification finale (lint global + checklist Dolibarr manuelle)

**Files:** (aucun nouveau fichier)

- [ ] **Step 1: Lint de tous les fichiers PHP du module**

Run: `find core admin lib mcp -name '*.php' -print0 | xargs -0 -n1 php -l`
Expected: `No syntax errors detected` pour chaque fichier ; aucun fichier en erreur.

- [ ] **Step 2: Vérifier l'arborescence cible et l'absence de résidu TS**

Run: `ls composer.json core/modules/modMcpServer.class.php admin/setup.php lib/mcpserver.lib.php mcp/server.php mcp/McpAuth.php mcp/Tools/ThirdPartyTools.php langs/en_US/mcpserver.lang langs/fr_FR/mcpserver.lang README.md && find . -path ./.git -prune -o -name '*.ts' -print`
Expected: les 10 chemins listés sans erreur ; aucun `.ts`.

- [ ] **Step 3: Vérifier l'autoload Composer**

Run: `composer dump-autoload && php -r "require 'vendor/autoload.php'; echo class_exists('Mcp\\\\Server') ? 'sdk-ok' : 'sdk-missing', PHP_EOL;"`
Expected: `sdk-ok`.

- [ ] **Step 4: Checklist de validation manuelle dans une instance Dolibarr de dev**

Déposer le module dans `htdocs/custom/mcpserver/`, `composer install`, puis vérifier :

1. **Activation** : le module s'active sans erreur ; la permission *« Accéder au serveur MCP »*
   apparaît dans l'onglet Permissions d'un utilisateur ; la constante `MCPSERVER_ENABLED` existe
   (`SELECT * FROM llx_const WHERE name='MCPSERVER_ENABLED'`).
2. **Désactivation** : désactiver le module → la permission `mcpserver->use` disparaît de
   `llx_rights_def` et la constante de `llx_const`. Réactiver → tout revient. (Critère §8 de la spec.)
3. **Auth refusée** : `curl -i -X POST <endpoint>` sans `DOLAPIKEY` → **401** ; avec une clé valide
   mais utilisateur sans droit `use` → **403**.
4. **Handshake MCP** : avec une `DOLAPIKEY` d'un utilisateur ayant le droit `use`, envoyer une requête
   `initialize` puis `tools/list` → la liste contient les 5 outils `thirdparty_*`.
5. **Droits natifs** : appeler `thirdparty_create` avec un utilisateur sans `societe->creer` →
   erreur « Permission refusee: societe->creer ». Avec le droit → création OK et l'id revient.

- [ ] **Step 5: Commit (le cas échéant) et clôture**

Si des ajustements ont été nécessaires à l'étape 4 (ex. signature `FileSessionStore`, chemin
`master.inc.php`, version `mcp/sdk`), les committer :

```bash
git add -A
git commit -m "fix(mcpserver): adjustments from Dolibarr runtime validation"
```

---

## Task 12: Environnement de démo Docker (Dolibarr + données de test)

**Files:**
- Create: `demo/docker-compose.yml`
- Create: `demo/docker-init.d/90-setup-mcp.php`
- Create: `demo/run-demo.sh`
- Create: `demo/README.md`

**But :** instance Dolibarr jetable avec données de démo (`DOLI_INIT_DEMO=1`), module monté +
`vendor/` installé, module activé/droit/clé API posés automatiquement, et un script de démo qui
appelle l'endpoint MCP. Cette tâche est validée en live (Docker) par l'orchestrateur, pas par `php -l`.

- [ ] **Step 1: Créer `demo/docker-compose.yml`**

```yaml
services:
  db:
    image: mariadb:11
    environment:
      MARIADB_ROOT_PASSWORD: rootpass
      MARIADB_DATABASE: dolibarr
      MARIADB_USER: dolibarr
      MARIADB_PASSWORD: dolibarr
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 5s
      timeout: 5s
      retries: 30

  composer:
    image: composer:2
    working_dir: /app
    volumes:
      - ../:/app
    command: install --ignore-platform-reqs --no-interaction
    profiles: ["tools"]

  dolibarr:
    image: dolibarr/dolibarr:21
    depends_on:
      db:
        condition: service_healthy
    environment:
      DOLI_DB_HOST: db
      DOLI_DB_NAME: dolibarr
      DOLI_DB_USER: dolibarr
      DOLI_DB_PASSWORD: dolibarr
      DOLI_DB_ROOT_LOGIN: root
      DOLI_DB_ROOT_PASSWORD: rootpass
      DOLI_ADMIN_LOGIN: admin
      DOLI_ADMIN_PASSWORD: admin
      DOLI_URL_ROOT: http://localhost:8080
      DOLI_INIT_DEMO: "1"
      DOLI_COMPANY_NAME: "Demo MCP"
      DOLI_COMPANY_COUNTRYCODE: "FR"
      DOLI_MODULES: "Societe,Facture,Stock"
    ports:
      - "8080:80"
    volumes:
      - ../:/var/www/html/custom/mcpserver
      - ./docker-init.d:/var/www/scripts/docker-init.d
      - doc_data:/var/www/documents

volumes:
  db_data:
  doc_data:
```

- [ ] **Step 2: Créer `demo/docker-init.d/90-setup-mcp.php`** (activation module + droit + clé API)

```php
<?php
/**
 * Post-deploiement : active le module mcpserver, ouvre l'endpoint,
 * accorde le droit 'use' a l'admin et pose une cle API de demo.
 * Execute par le runner docker-init.d de l'image Dolibarr.
 */
if (!defined('NOSESSION')) {
    define('NOSESSION', '1');
}
$res = @include '/var/www/html/master.inc.php';
if (!$res) {
    fwrite(STDERR, "master.inc.php introuvable\n");
    exit(1);
}
require_once DOL_DOCUMENT_ROOT.'/core/lib/admin.lib.php';
require_once DOL_DOCUMENT_ROOT.'/user/class/user.class.php';

// 1. Activer le module (lance init() : droits + constantes)
$result = activateModule('modMcpServer');
echo "activateModule => ".json_encode($result)."\n";

// 2. S'assurer que l'endpoint est actif
dolibarr_set_const($db, 'MCPSERVER_ENABLED', '1', 'chaine', 0, '', 1);

// 3. Accorder le droit mcpserver->use a l'admin (rowid 1) + cle API de demo
$u = new User($db);
$u->fetch(1);
$u->addrights(500101, '', '', 0);
$db->query("UPDATE ".MAIN_DB_PREFIX."user SET api_key = 'demo-mcp-key-123' WHERE rowid = 1");

echo "MCP demo pret. Endpoint: /custom/mcpserver/mcp/server.php  DOLAPIKEY: demo-mcp-key-123\n";
```

- [ ] **Step 3: Créer `demo/run-demo.sh`** (handshake MCP + appel d'outil via curl)

```bash
#!/usr/bin/env bash
# Démo MCP : initialize -> tools/list -> tools/call thirdparty_list
set -euo pipefail

ENDPOINT="${ENDPOINT:-http://localhost:8080/custom/mcpserver/mcp/server.php}"
KEY="${KEY:-demo-mcp-key-123}"
HDR=(-H "DOLAPIKEY: $KEY" -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")

echo "== initialize =="
INIT_HEADERS="$(mktemp)"
curl -sS -D "$INIT_HEADERS" "${HDR[@]}" -X POST "$ENDPOINT" -d '{
  "jsonrpc":"2.0","id":1,"method":"initialize",
  "params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}
}'
echo
SID="$(grep -i '^mcp-session-id:' "$INIT_HEADERS" | awk '{print $2}' | tr -d '\r' || true)"
echo "session=$SID"
SIDHDR=(); [ -n "$SID" ] && SIDHDR=(-H "Mcp-Session-Id: $SID")

echo "== notifications/initialized =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' || true
echo

echo "== tools/list =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
echo

echo "== tools/call thirdparty_list =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{
  "jsonrpc":"2.0","id":3,"method":"tools/call",
  "params":{"name":"thirdparty_list","arguments":{"limit":5}}
}'
echo
```

- [ ] **Step 4: Créer `demo/README.md`**

````markdown
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

## Arrêt / nettoyage

```bash
docker compose down -v
```
````

- [ ] **Step 5: Rendre le script exécutable et committer**

```bash
chmod +x demo/run-demo.sh
git add demo/
git commit -m "feat(demo): dockerized Dolibarr demo env with test data and MCP demo script"
```

- [ ] **Step 6: Validation live (orchestrateur)**

```bash
cd demo
docker compose run --rm composer
docker compose up -d
```
Suivre `docker compose logs -f dolibarr` jusqu'au message `MCP demo pret`. Puis :
- `curl -i -X POST http://localhost:8080/custom/mcpserver/mcp/server.php` (sans clé) → **401**.
- `./run-demo.sh` → `tools/list` contient les 5 outils `thirdparty_*` et `thirdparty_list`
  renvoie des tiers des données de démo.

> Itération attendue ici (version d'image Dolibarr/PHP, comportement `docker-init.d`,
> format SSE vs JSON du transport, signature `FileSessionStore`). Ajuster puis committer.

---

## Notes d'implémentation

- **Versions de paquets** : `mcp/sdk` est récent ; si `"*"` pose problème, fixer la version réelle
  via `composer require mcp/sdk` (Task 3, Step 2).
- **`FileSessionStore`** : signature attendue `__construct(string $directory, int $ttl = 3600, ...)`.
  Vérifier sur `vendor/mcp/sdk/src/Server/Session/FileSessionStore.php` lors de la validation runtime.
- **Découverte des outils** : `setDiscovery(__DIR__, ['Tools'])` scanne `mcp/Tools/`. Si la découverte
  ne trouve pas les classes, basculer en enregistrement explicite via
  `->addTool([\Dolibarr\McpServer\Tools\ThirdPartyTools::class, 'list'], name: 'thirdparty_list', ...)`
  pour chaque méthode (signature `addTool` confirmée dans le SDK).
- **Accès aux objets Dolibarr** : les outils utilisent les globals `$db`/`$user` (pattern Dolibarr
  standard), positionnés par le bootstrap et l'auth dans `mcp/server.php`.
