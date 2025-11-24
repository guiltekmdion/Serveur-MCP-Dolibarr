import { z } from 'zod';

// Schémas Zod pour validation automatique
export const ThirdPartySchema = z.object({
  id: z.string(),
  name: z.string(),
  name_alias: z.string().nullable().optional(),
  code_client: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
}).passthrough(); // Permet les champs supplémentaires de Dolibarr

export const ProposalSchema = z.object({
  id: z.string().optional(),
  ref: z.string().optional(),
  socid: z.string(),
  date: z.number().int().positive(),
  date_validity: z.number().int().positive().optional(),
  lines: z.array(z.any()).optional(),
}).passthrough();

// Types TypeScript inférés depuis Zod
export type ThirdParty = z.infer<typeof ThirdPartySchema>;
export type Proposal = z.infer<typeof ProposalSchema>;

// Schémas pour les arguments des outils MCP
export const GetThirdPartyArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du tiers est requis'),
});

export const SearchThirdPartiesArgsSchema = z.object({
  query: z.string().min(1, 'La requête de recherche est requise'),
});

export const CreateProposalArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  date: z.number().int().positive('La date doit être un timestamp Unix valide'),
  ref: z.string().optional(),
});

export type GetThirdPartyArgs = z.infer<typeof GetThirdPartyArgsSchema>;
export type SearchThirdPartiesArgs = z.infer<typeof SearchThirdPartiesArgsSchema>;
export type CreateProposalArgs = z.infer<typeof CreateProposalArgsSchema>;

// Schémas supplémentaires pour les nouveaux outils
export const CreateThirdPartyArgsSchema = z.object({
  name: z.string().min(1, 'Le nom du tiers est requis'),
  code_client: z.string().optional(),
  client: z.enum(['0', '1', '2', '3']).default('1'), // 0=pas client, 1=client, 2=prospect, 3=client+prospect
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  town: z.string().optional(),
  country_id: z.string().optional(),
});

export const UpdateThirdPartyArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du tiers est requis'),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  town: z.string().optional(),
  status: z.string().optional(),
});

// Contacts
export const ContactSchema = z.object({
  id: z.string(),
  firstname: z.string().nullable().optional(),
  lastname: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  socid: z.string().nullable().optional(),
}).passthrough();

export const GetContactArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du contact est requis'),
});

export const ListContactsForThirdPartyArgsSchema = z.object({
  thirdparty_id: z.string().min(1, 'L\'ID du tiers est requis'),
});

export const CreateContactArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  firstname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Propositions étendues
export const GetProposalArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du devis est requis'),
});

export const ListProposalsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const AddProposalLineArgsSchema = z.object({
  proposal_id: z.string().min(1, 'L\'ID du devis est requis'),
  product_id: z.string().optional(),
  desc: z.string().optional(),
  qty: z.number().positive().default(1),
  price: z.number().optional(),
  tva_tx: z.number().optional(),
});

export const UpdateProposalLineArgsSchema = z.object({
  line_id: z.string().min(1, 'L\'ID de la ligne est requis'),
  desc: z.string().optional(),
  qty: z.number().positive().optional(),
  price: z.number().optional(),
});

export const DeleteProposalLineArgsSchema = z.object({
  line_id: z.string().min(1, 'L\'ID de la ligne est requis'),
});

export const ChangeProposalStatusArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du devis est requis'),
  status: z.enum(['validate', 'close', 'refuse', 'sign']),
});

// Commandes
export const OrderSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string(),
  date: z.number().optional(),
}).passthrough();

export const GetOrderArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la commande est requis'),
});

export const CreateOrderArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  date: z.number().int().positive().optional(),
});

export const ChangeOrderStatusArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la commande est requis'),
  status: z.enum(['validate', 'approve', 'ship', 'bill']),
});

// Factures
export const InvoiceSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string(),
  date: z.number().optional(),
}).passthrough();

export const GetInvoiceArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la facture est requis'),
});

export const ListInvoicesArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateInvoiceArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  date: z.number().int().positive().optional(),
  type: z.string().optional(),
});

export const CreateInvoiceFromProposalArgsSchema = z.object({
  proposal_id: z.string().min(1, 'L\'ID du devis est requis'),
});

export const RecordInvoicePaymentArgsSchema = z.object({
  invoice_id: z.string().min(1, 'L\'ID de la facture est requis'),
  amount: z.number().positive('Le montant doit être positif'),
  date: z.number().int().positive().optional(),
  payment_mode_id: z.string().optional(),
});

// Produits
export const ProductSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  label: z.string(),
  price: z.number().optional(),
}).passthrough();

export const GetProductArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du produit est requis'),
});

export const SearchProductsArgsSchema = z.object({
  query: z.string().min(1, 'La requête de recherche est requise'),
});

// Documents
export const ListDocumentsArgsSchema = z.object({
  modulepart: z.string().min(1, 'Le type de module est requis'),
  ref: z.string().min(1, 'La référence est requise'),
});

export const UploadDocumentArgsSchema = z.object({
  modulepart: z.string().min(1, 'Le type de module est requis'),
  ref: z.string().min(1, 'La référence est requise'),
  filename: z.string().min(1, 'Le nom du fichier est requis'),
  filecontent: z.string().min(1, 'Le contenu du fichier (base64) est requis'),
});

// Projets
export const ProjectSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  title: z.string(),
}).passthrough();

export const GetProjectArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du projet est requis'),
});

export const ListProjectsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateProjectArgsSchema = z.object({
  title: z.string().min(1, 'Le titre du projet est requis'),
  socid: z.string().optional(),
  description: z.string().optional(),
  ref: z.string().optional(),
});

// Tâches
export const TaskSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  label: z.string(),
  fk_project: z.string().optional(),
}).passthrough();

export const GetTaskArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la tâche est requis'),
});

export const CreateTaskArgsSchema = z.object({
  label: z.string().min(1, 'Le libellé de la tâche est requis'),
  fk_project: z.string().min(1, 'L\'ID du projet est requis'),
  description: z.string().optional(),
  ref: z.string().optional(),
});

// Utilisateurs
export const UserSchema = z.object({
  id: z.string(),
  login: z.string(),
  lastname: z.string().optional(),
  firstname: z.string().optional(),
}).passthrough();

export const GetUserArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'utilisateur est requis'),
});

// Banques
export const BankAccountSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  label: z.string(),
}).passthrough();

export const GetBankAccountLinesArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du compte bancaire est requis'),
});

// Types inférés
export type Contact = z.infer<typeof ContactSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type User = z.infer<typeof UserSchema>;
export type BankAccount = z.infer<typeof BankAccountSchema>;
