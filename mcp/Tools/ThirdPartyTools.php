<?php

namespace Dolibarr\McpServer\Tools;

use Mcp\Capability\Attribute\McpTool;

require_once DOL_DOCUMENT_ROOT.'/societe/class/societe.class.php';

/**
 * Outils MCP pour les tiers (Societe). Patron de reference pour les autres domaines.
 * Chaque methode s'execute sous $user, verifie le droit Dolibarr natif et l'isolation
 * multi-entite, exactement comme l'API REST native.
 */
class ThirdPartyTools
{
    /**
     * Verifie un droit natif Dolibarr ou leve une exception (mappee en erreur MCP).
     *
     * @param string $module Module (ex: 'societe')
     * @param string $perm   Permission (ex: 'lire')
     * @return void
     */
    private function requireRight(string $module, string $perm): void
    {
        global $user;
        if (empty($user->hasRight($module, $perm))) {
            throw new \RuntimeException(sprintf('Permission refusee: %s->%s', $module, $perm));
        }
    }

    /**
     * Verifie que l'objet charge est accessible dans l'entite courante et,
     * pour un utilisateur externe, qu'il correspond bien a son tiers.
     *
     * @param \Societe $obj Tiers charge
     * @return void
     */
    private function assertAccess(\Societe $obj): void
    {
        global $user;
        $allowed = array_map('intval', explode(',', getEntity('societe')));
        if (!in_array((int) $obj->entity, $allowed, true)) {
            throw new \RuntimeException('Tiers hors entite autorisee: '.((int) $obj->id));
        }
        if (!empty($user->socid) && (int) $obj->id !== (int) $user->socid) {
            throw new \RuntimeException('Acces refuse a ce tiers');
        }
    }

    /**
     * Construit un message d'erreur a partir de $obj->error ou $obj->errors.
     *
     * @param \Societe $obj Tiers
     * @return string Message d'erreur non vide si possible
     */
    private function errMsg(\Societe $obj): string
    {
        $msg = $obj->error;
        if (empty($msg) && !empty($obj->errors)) {
            $msg = implode(', ', (array) $obj->errors);
        }
        return $msg !== '' ? $msg : 'erreur inconnue';
    }

    /**
     * Liste les tiers (clients, prospects, fournisseurs).
     *
     * @param int $limit  Nombre maximum de resultats
     * @param int $offset Decalage de pagination
     * @return array<string, mixed> Liste des tiers
     */
    #[McpTool(name: 'thirdparty_list', description: 'Lister les tiers Dolibarr (clients, prospects, fournisseurs).')]
    public function list(int $limit = 25, int $offset = 0): array
    {
        global $db, $user;
        $this->requireRight('societe', 'lire');

        $sql = "SELECT rowid, nom, code_client, code_fournisseur, email, phone, town, status";
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
                'status' => (int) $obj->status,
            );
        }
        return array('count' => count($rows), 'rows' => $rows);
    }

    /**
     * Recupere un tiers par son identifiant.
     *
     * @param int $id Identifiant du tiers
     * @return array<string, mixed> Donnees du tiers
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
        $this->assertAccess($obj);

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
            'status' => (int) $obj->status,
        );
    }

    /**
     * Cree un tiers.
     *
     * @param string      $name        Nom du tiers
     * @param string|null $email       Email
     * @param int         $client      1=client, 2=prospect, 3=client/prospect, 0=non
     * @param int         $fournisseur 1=fournisseur, 0=non
     * @return array<string, mixed> Identifiant cree
     */
    #[McpTool(name: 'thirdparty_create', description: 'Creer un tiers Dolibarr.')]
    public function create(string $name, ?string $email = null, int $client = 1, int $fournisseur = 0): array
    {
        global $db, $user;
        $this->requireRight('societe', 'creer');

        $obj = new \Societe($db);
        $obj->name = $name;
        $obj->email = (string) $email;
        $obj->client = $client;
        $obj->fournisseur = $fournisseur;
        // Demande l'auto-generation des codes (sinon ErrorCustomerCodeRequired selon la config).
        if ($client > 0) {
            $obj->code_client = '-1';
        }
        if ($fournisseur > 0) {
            $obj->code_fournisseur = '-1';
        }

        $id = $obj->create($user);
        if ($id <= 0) {
            throw new \RuntimeException('Echec creation: '.$this->errMsg($obj));
        }
        return array('id' => (int) $id);
    }

    /**
     * Met a jour un tiers existant.
     *
     * @param int         $id    Identifiant du tiers
     * @param string|null $name  Nouveau nom (optionnel)
     * @param string|null $email Nouvel email (optionnel)
     * @return array<string, mixed> Statut
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
        $this->assertAccess($obj);

        if ($name !== null) {
            $obj->name = $name;
        }
        if ($email !== null) {
            $obj->email = $email;
        }
        if ($obj->update($id, $user) <= 0) {
            throw new \RuntimeException('Echec mise a jour: '.$this->errMsg($obj));
        }
        return array('id' => (int) $id, 'updated' => true);
    }

    /**
     * Supprime un tiers.
     *
     * @param int $id Identifiant du tiers
     * @return array<string, mixed> Statut
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
        $this->assertAccess($obj);

        if ($obj->delete($id, $user) <= 0) {
            throw new \RuntimeException('Echec suppression: '.$this->errMsg($obj));
        }
        return array('id' => (int) $id, 'deleted' => true);
    }
}
