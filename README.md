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
