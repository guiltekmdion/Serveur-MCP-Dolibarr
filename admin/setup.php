<?php
/**
 * \file    admin/setup.php
 * \brief   Page de configuration du module mcpserver.
 */

// Charger l'environnement Dolibarr (page HTML d'admin -> main.inc.php)
$res = 0;
if (file_exists(dirname(__FILE__)."/../../main.inc.php")) {
    $res = include dirname(__FILE__)."/../../main.inc.php";
}
if (!$res && file_exists(dirname(__FILE__)."/../../../main.inc.php")) {
    $res = include dirname(__FILE__)."/../../../main.inc.php";
}
if (!$res) {
    die("Include of main fails");
}

global $conf, $db, $langs, $user;

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
$selfurl = (isset($_SERVER["PHP_SELF"]) && is_string($_SERVER["PHP_SELF"])) ? $_SERVER["PHP_SELF"] : '';

llxHeader('', $langs->trans("McpServerSetup"));

$head = mcpserverAdminPrepareHead();
print dol_get_fiche_head($head, 'settings', $langs->trans("McpServerSetup"), -1, 'generic');

print '<table class="noborder centpercent">';
print '<tr class="liste_titre"><td>'.$langs->trans("Parameter").'</td><td>'.$langs->trans("Value").'</td></tr>';

// Activation endpoint
print '<tr class="oddeven"><td>'.$langs->trans("McpServerEnabled").'</td><td>';
if ($enabled) {
    print '<a href="'.$selfurl.'?action=setenabled&token='.newToken().'&value=0">'.img_picto($langs->trans("Enabled"), 'switch_on').'</a>';
} else {
    print '<a href="'.$selfurl.'?action=setenabled&token='.newToken().'&value=1">'.img_picto($langs->trans("Disabled"), 'switch_off').'</a>';
}
print '</td></tr>';

// URL endpoint
print '<tr class="oddeven"><td>'.$langs->trans("McpServerEndpoint").'</td><td><code>'.dol_escape_htmltag($endpoint).'</code></td></tr>';

print '</table>';

print '<br><div class="info">'.$langs->trans("McpServerApiKeyHint").'</div>';

print dol_get_fiche_end();

llxFooter();
$db->close();
