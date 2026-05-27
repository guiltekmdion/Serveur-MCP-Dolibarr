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
