<?php

/*
 * Bootstrap PHPStan : definit les constantes Dolibarr utilisees par le module
 * afin que l'analyse statique ne les signale pas comme indefinies.
 * Les classes/fonctions Dolibarr sont resolues via "scanDirectories" (htdocs).
 */

if (!defined('DOL_DOCUMENT_ROOT')) {
    define('DOL_DOCUMENT_ROOT', dirname(__DIR__, 3));
}
if (!defined('DOL_DATA_ROOT')) {
    define('DOL_DATA_ROOT', dirname(__DIR__, 4).'/documents');
}
if (!defined('DOL_MAIN_URL_ROOT')) {
    define('DOL_MAIN_URL_ROOT', '');
}
if (!defined('MAIN_DB_PREFIX')) {
    define('MAIN_DB_PREFIX', 'llx_');
}
