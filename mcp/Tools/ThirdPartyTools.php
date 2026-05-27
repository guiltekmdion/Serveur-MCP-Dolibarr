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
        // Demande l'auto-generation des codes (sinon ErrorCustomerCodeRequired selon la config).
        if ($client > 0) {
            $obj->code_client = -1;
        }
        if ($fournisseur > 0) {
            $obj->code_fournisseur = -1;
        }

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
