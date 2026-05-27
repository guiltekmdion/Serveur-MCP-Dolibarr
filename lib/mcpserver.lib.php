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
