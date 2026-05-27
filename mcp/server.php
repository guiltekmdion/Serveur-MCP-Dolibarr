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
