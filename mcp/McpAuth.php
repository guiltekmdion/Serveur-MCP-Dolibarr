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

        if (!function_exists('dolEncrypt')) {
            require_once DOL_DOCUMENT_ROOT.'/core/lib/security.lib.php';
        }

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

        // Comme DolibarrApiAccess : la cle peut etre stockee en clair ou chiffree (dolEncrypt).
        $apikeyenc = dolEncrypt($apikey, '', '', 'dolibarr');
        $sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."user";
        $sql .= " WHERE (api_key = '".$db->escape($apikey)."'";
        $sql .= " OR api_key = '".$db->escape($apikeyenc)."')";
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
