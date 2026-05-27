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

        // Menus / onglets : aucun (acces via la page de config du module)
        $this->menu = array();
        $this->tabs = array();
        // Repertoire data (sessions MCP) cree a l'activation et retire a la desactivation.
        $this->dirs = array("/mcpserver/temp");
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
