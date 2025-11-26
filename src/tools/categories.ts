import { dolibarrClient } from '../services/dolibarr.js';
import { 
  ListCategoriesArgsSchema, 
  LinkCategoryArgsSchema 
} from '../types/index.js';

export const listCategoriesTool = {
  name: 'dolibarr_list_categories',
  description: 'Lister les catégories (tags)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      type: { type: 'string', description: 'Type de catégorie (product, supplier, customer, member, contact, project, user)' },
      limit: { type: 'number', description: 'Nombre max de résultats' },
    },
  },
};

export async function handleListCategories(args: unknown) {
  const validated = ListCategoriesArgsSchema.parse(args);
  const categories = await dolibarrClient.listCategories(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(categories, null, 2),
      },
    ],
  };
}

export const linkCategoryTool = {
  name: 'dolibarr_link_category',
  description: 'Lier un objet à une catégorie',
  inputSchema: {
    type: 'object' as const,
    properties: {
      category_id: { type: 'string', description: 'ID de la catégorie' },
      object_id: { type: 'string', description: 'ID de l\'objet' },
      object_type: { type: 'string', description: 'Type d\'objet (product, supplier, customer, member, contact, project, user)' },
    },
    required: ['category_id', 'object_id', 'object_type'],
  },
};

export async function handleLinkCategory(args: unknown) {
  const validated = LinkCategoryArgsSchema.parse(args);
  await dolibarrClient.linkCategory(validated);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Objet lié à la catégorie avec succès.',
      },
    ],
  };
}

export const categoryTools = [
  listCategoriesTool,
  linkCategoryTool,
];
