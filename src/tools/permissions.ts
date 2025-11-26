/**
 * Outils MCP : Gestion des Droits & Permissions
 * Groupes d'utilisateurs, permissions par module, audit logs
 */

import { 
  ListUserGroupsArgsSchema,
  CreateUserGroupArgsSchema,
  UpdateUserGroupArgsSchema,
  AddUserToGroupArgsSchema,
  SetUserRightsArgsSchema,
  GetAuditLogsArgsSchema,
} from '../types/index.js';

export const permissionsTools = [
  {
    name: 'dolibarr_list_user_groups',
    description: 'Liste tous les groupes d\'utilisateurs. Les groupes permettent de gérer les permissions collectivement.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Nombre maximum de groupes à retourner',
        },
      },
    },
  },
  {
    name: 'dolibarr_get_user_group',
    description: 'Récupère les détails d\'un groupe d\'utilisateurs spécifique avec ses membres.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID du groupe',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_create_user_group',
    description: 'Crée un nouveau groupe d\'utilisateurs pour gérer les permissions.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nom du groupe (ex: "Commerciaux", "Comptables", "Managers")',
        },
        note: {
          type: 'string',
          description: 'Description du groupe',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'dolibarr_update_user_group',
    description: 'Met à jour un groupe d\'utilisateurs existant.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID du groupe',
        },
        name: {
          type: 'string',
          description: 'Nouveau nom du groupe',
        },
        note: {
          type: 'string',
          description: 'Nouvelle description',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_delete_user_group',
    description: 'Supprime un groupe d\'utilisateurs. Les utilisateurs ne seront pas supprimés.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID du groupe à supprimer',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'dolibarr_add_user_to_group',
    description: 'Ajoute un utilisateur à un groupe. L\'utilisateur héritera des permissions du groupe.',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'ID du groupe',
        },
        user_id: {
          type: 'string',
          description: 'ID de l\'utilisateur',
        },
      },
      required: ['group_id', 'user_id'],
    },
  },
  {
    name: 'dolibarr_remove_user_from_group',
    description: 'Retire un utilisateur d\'un groupe.',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'ID du groupe',
        },
        user_id: {
          type: 'string',
          description: 'ID de l\'utilisateur',
        },
      },
      required: ['group_id', 'user_id'],
    },
  },
  {
    name: 'dolibarr_set_user_rights',
    description: 'Définit une permission spécifique pour un utilisateur sur un module (ex: "societe", "facture", "propale").',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'ID de l\'utilisateur',
        },
        module: {
          type: 'string',
          description: 'Nom du module Dolibarr (societe, facture, propale, projet, etc.)',
        },
        permission: {
          type: 'string',
          description: 'Type de permission (lire, creer, modifier, supprimer, valider, etc.)',
        },
        value: {
          type: 'string',
          enum: ['0', '1'],
          description: '0=Refusé, 1=Accordé',
        },
      },
      required: ['user_id', 'module', 'permission', 'value'],
    },
  },
  {
    name: 'dolibarr_get_audit_logs',
    description: 'Récupère les journaux d\'audit : qui a fait quoi et quand. Utile pour la traçabilité et la conformité.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'Filtrer par ID utilisateur',
        },
        action: {
          type: 'string',
          description: 'Filtrer par type d\'action (CREATE, UPDATE, DELETE, LOGIN, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum d\'entrées',
        },
        date_start: {
          type: 'number',
          description: 'Timestamp UNIX de début',
        },
        date_end: {
          type: 'number',
          description: 'Timestamp UNIX de fin',
        },
      },
    },
  },
];

export async function handlePermissionsRequest(name: string, args: any, dolibarrClient: any): Promise<any> {
  switch (name) {
    case 'dolibarr_list_user_groups': {
      const validated = ListUserGroupsArgsSchema.parse(args);
      return await dolibarrClient.listUserGroups(validated.limit);
    }
    case 'dolibarr_get_user_group': {
      const { id } = args;
      return await dolibarrClient.getUserGroup(id);
    }
    case 'dolibarr_create_user_group': {
      const validated = CreateUserGroupArgsSchema.parse(args);
      const id = await dolibarrClient.createUserGroup(validated.name, validated.note);
      return { success: true, id, message: `Groupe "${validated.name}" créé avec succès` };
    }
    case 'dolibarr_update_user_group': {
      const validated = UpdateUserGroupArgsSchema.parse(args);
      await dolibarrClient.updateUserGroup(validated.id, validated.name, validated.note);
      return { success: true, message: 'Groupe mis à jour' };
    }
    case 'dolibarr_delete_user_group': {
      const { id } = args;
      await dolibarrClient.deleteUserGroup(id);
      return { success: true, message: 'Groupe supprimé' };
    }
    case 'dolibarr_add_user_to_group': {
      const validated = AddUserToGroupArgsSchema.parse(args);
      await dolibarrClient.addUserToGroup(validated.group_id, validated.user_id);
      return { success: true, message: 'Utilisateur ajouté au groupe' };
    }
    case 'dolibarr_remove_user_from_group': {
      const validated = AddUserToGroupArgsSchema.parse(args);
      await dolibarrClient.removeUserFromGroup(validated.group_id, validated.user_id);
      return { success: true, message: 'Utilisateur retiré du groupe' };
    }
    case 'dolibarr_set_user_rights': {
      const validated = SetUserRightsArgsSchema.parse(args);
      await dolibarrClient.setUserRights(
        validated.user_id,
        validated.module,
        validated.permission,
        validated.value
      );
      return { success: true, message: 'Permission mise à jour' };
    }
    case 'dolibarr_get_audit_logs': {
      const validated = GetAuditLogsArgsSchema.parse(args);
      return await dolibarrClient.getAuditLogs(
        validated.user_id,
        validated.action,
        validated.limit,
        validated.date_start,
        validated.date_end
      );
    }
    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
}
