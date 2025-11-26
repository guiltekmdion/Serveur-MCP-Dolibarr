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
  idprof1: z.string().optional(), // SIREN
  idprof2: z.string().optional(), // SIRET
  idprof3: z.string().optional(), // NAF/APE
  idprof4: z.string().optional(), // RCS/RM
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

export const CreateProductArgsSchema = z.object({
  ref: z.string().min(1, 'La référence est requise'),
  label: z.string().min(1, 'Le libellé est requis'),
  type: z.enum(['0', '1']).default('0').describe('0=Produit, 1=Service'),
  price: z.number().optional(),
  price_min: z.number().optional(),
  tva_tx: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(['0', '1']).default('1').describe('0=Hors vente, 1=En vente'),
  status_buy: z.enum(['0', '1']).default('1').describe('0=Hors achat, 1=En achat'),
});

export const UpdateProductArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du produit est requis'),
  ref: z.string().optional(),
  label: z.string().optional(),
  price: z.number().optional(),
  price_min: z.number().optional(),
  tva_tx: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(['0', '1']).optional(),
  status_buy: z.enum(['0', '1']).optional(),
});

export const DeleteProductArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du produit est requis'),
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

export const UpdateProjectArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du projet est requis'),
  title: z.string().optional(),
  description: z.string().optional(),
  date_start: z.number().optional(),
  date_end: z.number().optional(),
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

export const UpdateTaskArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la tâche est requise'),
  label: z.string().optional(),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const AddTaskTimeArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la tâche est requis'),
  date: z.number().describe('Date du temps passé (timestamp)'),
  duration: z.number().describe('Durée en secondes'),
  note: z.string().optional(),
  user_id: z.string().optional().describe('ID utilisateur (optionnel, défaut = utilisateur API)'),
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

export const CreateUserArgsSchema = z.object({
  login: z.string().min(1, 'Le login est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  lastname: z.string().optional(),
  firstname: z.string().optional(),
  email: z.string().email().optional(),
  admin: z.enum(['0', '1']).default('0'),
});

export const UpdateUserArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'utilisateur est requis'),
  lastname: z.string().optional(),
  firstname: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  admin: z.enum(['0', '1']).optional(),
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

export const CreateBankAccountArgsSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  bank: z.string().optional(),
  code_banque: z.string().optional(),
  code_guichet: z.string().optional(),
  number: z.string().optional(),
  cle_rib: z.string().optional(),
  bic: z.string().optional(),
  iban: z.string().optional(),
  currency_code: z.string().default('EUR'),
  country_id: z.number().optional(),
});

// Entrepôts (Nouveau)
export const CreateWarehouseArgsSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
  statut: z.enum(['0', '1']).default('1'),
  lieu: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  town: z.string().optional(),
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

// ============================================
// NOUVEAUX MODULES - Novembre 2025
// ============================================

// === ENTREPÔTS (Warehouses) ===
export const WarehouseSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  label: z.string().optional(),
  lieu: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  statut: z.string().nullable().optional(),
}).passthrough();

export const ListWarehousesArgsSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const GetWarehouseArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'entrepôt est requis'),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

// === MOUVEMENTS DE STOCK (Stock Movements) ===
export const StockMovementSchema = z.object({
  id: z.string(),
  product_id: z.string().optional(),
  warehouse_id: z.string().optional(),
  qty: z.number().optional(),
  type: z.string().optional(),
  label: z.string().nullable().optional(),
  datem: z.string().nullable().optional(),
}).passthrough();

export const ListStockMovementsArgsSchema = z.object({
  product_id: z.string().optional(),
  warehouse_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateStockMovementArgsSchema = z.object({
  product_id: z.string().min(1, 'L\'ID du produit est requis'),
  warehouse_id: z.string().min(1, 'L\'ID de l\'entrepôt est requis'),
  qty: z.number().min(1, 'La quantité est requise'),
  type: z.enum(['0', '1', '2', '3']).default('0'), // 0=entrée, 1=sortie, 2=transfert+, 3=transfert-
  label: z.string().optional(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

// === EXPÉDITIONS (Shipments) ===
export const ShipmentSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string().optional(),
  origin_id: z.string().nullable().optional(),
  date_delivery: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
}).passthrough();

export const ListShipmentsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetShipmentArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'expédition est requis'),
});

export const CreateShipmentArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  origin_id: z.string().min(1, 'L\'ID de la commande origine est requis'),
  date_delivery: z.number().int().positive().optional(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;

// === CONTRATS (Contracts) ===
export const ContractSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string().optional(),
  date_contrat: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
}).passthrough();

export const ListContractsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetContractArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du contrat est requis'),
});

export const CreateContractArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  date_contrat: z.number().int().positive().optional(),
  ref: z.string().optional(),
});

export type Contract = z.infer<typeof ContractSchema>;

// === TICKETS (Support) ===
export const TicketSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  track_id: z.string().nullable().optional(),
  subject: z.string().optional(),
  message: z.string().nullable().optional(),
  fk_soc: z.string().nullable().optional(),
  fk_statut: z.string().nullable().optional(),
  type_code: z.string().nullable().optional(),
  severity_code: z.string().nullable().optional(),
}).passthrough();

export const ListTicketsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetTicketArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du ticket est requis'),
});

export const CreateTicketArgsSchema = z.object({
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(1, 'Le message est requis'),
  fk_soc: z.string().optional(),
  type_code: z.string().optional(),
  severity_code: z.string().optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// === ÉVÉNEMENTS AGENDA (Agenda Events) ===
export const AgendaEventSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  datep: z.number().nullable().optional(),
  datef: z.number().nullable().optional(),
  type_code: z.string().nullable().optional(),
  socid: z.string().nullable().optional(),
  fk_element: z.string().nullable().optional(),
}).passthrough();

export const ListAgendaEventsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetAgendaEventArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'événement est requis'),
});

export const CreateAgendaEventArgsSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  type_code: z.string().min(1, 'Le type est requis'), // AC_TEL, AC_RDV, AC_EMAIL...
  datep: z.number().int().positive('La date de début est requise'),
  datef: z.number().int().positive().optional(),
  socid: z.string().optional(),
  contactid: z.string().optional(),
  userownerid: z.string().optional(),
});

export type AgendaEvent = z.infer<typeof AgendaEventSchema>;

// === NOTES DE FRAIS (Expense Reports) ===
export const ExpenseReportSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  fk_user_author: z.string().optional(),
  date_debut: z.number().nullable().optional(),
  date_fin: z.number().nullable().optional(),
  fk_statut: z.string().nullable().optional(),
  total_ht: z.number().nullable().optional(),
  total_ttc: z.number().nullable().optional(),
}).passthrough();

export const ListExpenseReportsArgsSchema = z.object({
  user_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetExpenseReportArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la note de frais est requis'),
});

export type ExpenseReport = z.infer<typeof ExpenseReportSchema>;

// === INTERVENTIONS (Fichinter) ===
export const InterventionSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string().optional(),
  description: z.string().nullable().optional(),
  datec: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
}).passthrough();

export const ListInterventionsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetInterventionArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'intervention est requis'),
});

export const CreateInterventionArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  description: z.string().optional(),
  datec: z.number().int().positive().optional(),
});

export type Intervention = z.infer<typeof InterventionSchema>;

// === FOURNISSEURS (Suppliers) ===
export const SupplierOrderSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string().optional(),
  date_commande: z.number().nullable().optional(),
  total_ht: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
}).passthrough();

export const ListSupplierOrdersArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateSupplierOrderArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du fournisseur est requis'),
  date_commande: z.number().int().positive().optional(),
  note_private: z.string().optional(),
  note_public: z.string().optional(),
});

export const SupplierInvoiceSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  socid: z.string().optional(),
  date: z.number().nullable().optional(),
  total_ht: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
}).passthrough();

export const ListSupplierInvoicesArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateSupplierInvoiceArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du fournisseur est requis'),
  date: z.number().int().positive().optional(),
  label: z.string().optional(),
  amount: z.number().optional(),
});

export type SupplierOrder = z.infer<typeof SupplierOrderSchema>;
export type SupplierInvoice = z.infer<typeof SupplierInvoiceSchema>;

// === CATÉGORIES (Tags) ===
export const CategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().optional(), // 0=product, 1=supplier, 2=customer, 3=member
  description: z.string().nullable().optional(),
}).passthrough();

export const ListCategoriesArgsSchema = z.object({
  type: z.enum(['product', 'supplier', 'customer', 'member', 'contact', 'project', 'user']).optional(),
  limit: z.number().int().positive().optional(),
});

export const LinkCategoryArgsSchema = z.object({
  category_id: z.string().min(1, 'L\'ID de la catégorie est requis'),
  object_id: z.string().min(1, 'L\'ID de l\'objet est requis'),
  object_type: z.enum(['product', 'supplier', 'customer', 'member', 'contact', 'project', 'user']),
});

export type Category = z.infer<typeof CategorySchema>;

// === COMMUN (Common) ===
export const SendEmailArgsSchema = z.object({
  to: z.string().email('Email invalide'),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(1, 'Le message est requis'),
  from: z.string().email().optional(),
});

export const GetServerInfoArgsSchema = z.object({});

// === NOTES DE FRAIS (Create) ===
export const CreateExpenseReportArgsSchema = z.object({
  user_id: z.string().min(1, 'L\'ID utilisateur est requis'),
  date_debut: z.number().int().positive().optional(),
  date_fin: z.number().int().positive().optional(),
  note_private: z.string().optional(),
  note_public: z.string().optional(),
});

// === TIME ENTRIES (Temps passé sur tâches) ===
export const TimeEntrySchema = z.object({
  id: z.string(),
  fk_task: z.string().optional(),
  fk_user: z.string().optional(),
  task_date: z.number().nullable().optional(),
  task_duration: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  thm: z.number().nullable().optional(),
}).passthrough();

export const ListTimeEntriesArgsSchema = z.object({
  project_id: z.string().optional(),
  task_id: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const ListTasksForProjectArgsSchema = z.object({
  project_id: z.string().min(1, 'L\'ID du projet est requis'),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;

// === OPPORTUNITÉS / LEADS ===
export const LeadSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  lastname: z.string().optional(),
  firstname: z.string().optional(),
  society: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  fk_soc: z.string().nullable().optional(),
  fk_project: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  amount_guess: z.number().nullable().optional(),
  date_closure: z.number().nullable().optional(),
}).passthrough();

export const ListLeadsArgsSchema = z.object({
  status: z.string().optional(),
  thirdparty_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const GetLeadArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'opportunité est requis'),
});

export const CreateLeadArgsSchema = z.object({
  lastname: z.string().min(1, 'Le nom est requis'),
  firstname: z.string().optional(),
  society: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fk_soc: z.string().optional(),
  fk_project: z.string().optional(),
  amount_guess: z.number().optional(),
  status: z.enum(['0', '1', '2', '3']).optional().describe('0=Prospect, 1=Qualifié, 2=Proposition, 3=Négociation'),
});

export const UpdateLeadArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'opportunité est requis'),
  status: z.enum(['0', '1', '2', '3']).optional(),
  fk_project: z.string().optional(),
  amount_guess: z.number().optional(),
  date_closure: z.number().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// === PAIEMENTS (Payments) ===
export const PaymentSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  datep: z.number().nullable().optional(),
  amount: z.number().nullable().optional(),
  fk_account: z.string().nullable().optional(),
  num_payment: z.string().nullable().optional(),
}).passthrough();

export const ListPaymentsArgsSchema = z.object({
  invoice_id: z.string().optional(),
  thirdparty_id: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreatePaymentArgsSchema = z.object({
  invoice_id: z.string().min(1, 'L\'ID de la facture est requis'),
  datepaye: z.number().int().positive(),
  amount: z.number().positive().min(0.01, 'Le montant doit être positif'),
  paiementcode: z.string().default('LIQ'),
  num_payment: z.string().optional(),
  comment: z.string().optional(),
  accountid: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// === PROPOSITIONS AVANCÉES ===
export const ValidateProposalArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la proposition est requis'),
  notrigger: z.number().optional().default(0),
});

export const CloseProposalArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la proposition est requis'),
  status: z.enum(['2', '3']).describe('2=Signée/Acceptée, 3=Refusée'),
  note: z.string().optional(),
});

// === COMMANDES AVANCÉES ===
export const ValidateOrderArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la commande est requis'),
  idwarehouse: z.string().optional(),
  notrigger: z.number().optional().default(0),
});

export const CloseOrderArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de la commande est requis'),
  note: z.string().optional(),
});

export const ShipOrderArgsSchema = z.object({
  order_id: z.string().min(1, 'L\'ID de la commande est requis'),
  date_delivery: z.number().int().positive().optional(),
});

// === TÂCHES AVANCÉES ===
export const AssignTaskArgsSchema = z.object({
  task_id: z.string().min(1, 'L\'ID de la tâche est requis'),
  user_id: z.string().min(1, 'L\'ID de l\'utilisateur est requis'),
  percentage: z.number().min(0).max(100).optional().describe('Pourcentage d\'affectation'),
});

// === MEMBRES/ADHÉRENTS (Members) ===
export const MemberSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  civility_code: z.string().nullable().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().nullable().optional(),
  login: z.string().nullable().optional(),
  statut: z.string().nullable().optional(),
  morphy: z.string().nullable().optional(),
}).passthrough();

export const ListMembersArgsSchema = z.object({
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateMemberArgsSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email().optional(),
  morphy: z.enum(['phy', 'mor']).default('phy').describe('phy=Personne physique, mor=Personne morale'),
  typeid: z.string().optional(),
  civility_code: z.string().optional(),
});

export type Member = z.infer<typeof MemberSchema>;

// === STATISTIQUES ===
export const GetStatsArgsSchema = z.object({
  type: z.enum(['ca', 'topclients', 'proposals', 'payments']),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
});

// === DOCUMENTS AVANCÉS ===
export const DownloadDocumentArgsSchema = z.object({
  modulepart: z.string().min(1, 'Le type de module est requis'),
  original_file: z.string().min(1, 'Le chemin du fichier est requis'),
});

export const DeleteDocumentArgsSchema = z.object({
  modulepart: z.string().min(1, 'Le type de module est requis'),
  original_file: z.string().min(1, 'Le chemin du fichier est requis'),
});

export const ListDocumentsForObjectArgsSchema = z.object({
  modulepart: z.string().min(1, 'Le type de module est requis (invoice, propal, order, etc.)'),
  id: z.string().min(1, 'L\'ID de l\'objet est requis'),
});

export const GeneratePdfArgsSchema = z.object({
  module: z.enum(['invoice', 'propal', 'order', 'contract']),
  id: z.string().min(1, 'L\'ID de l\'objet est requis'),
});

export const SendDocumentByEmailArgsSchema = z.object({
  module: z.enum(['invoice', 'propal', 'order']),
  id: z.string().min(1, 'L\'ID de l\'objet est requis'),
  sendto: z.string().email('Email invalide'),
  subject: z.string().optional(),
  message: z.string().optional(),
});

// === GROUPES & PERMISSIONS ===
export const UserGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable().optional(),
  members: z.array(z.string()).optional(),
}).passthrough();

export const ListUserGroupsArgsSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const CreateUserGroupArgsSchema = z.object({
  name: z.string().min(1, 'Le nom du groupe est requis'),
  note: z.string().optional(),
});

export const UpdateUserGroupArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID du groupe est requis'),
  name: z.string().optional(),
  note: z.string().optional(),
});

export const AddUserToGroupArgsSchema = z.object({
  group_id: z.string().min(1, 'L\'ID du groupe est requis'),
  user_id: z.string().min(1, 'L\'ID de l\'utilisateur est requis'),
});

export const SetUserRightsArgsSchema = z.object({
  user_id: z.string().min(1, 'L\'ID de l\'utilisateur est requis'),
  module: z.string().min(1, 'Le nom du module est requis'),
  permission: z.string().min(1, 'La permission est requise'),
  value: z.enum(['0', '1']),
});

export const GetAuditLogsArgsSchema = z.object({
  user_id: z.string().optional(),
  action: z.string().optional(),
  limit: z.number().int().positive().optional(),
  date_start: z.number().int().optional(),
  date_end: z.number().int().optional(),
});

export type UserGroup = z.infer<typeof UserGroupSchema>;

// === MULTI-ENTITÉS & DEVISES ===
export const EntitySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
}).passthrough();

export const ListEntitiesArgsSchema = z.object({
  limit: z.number().int().positive().optional(),
});

export const CreateEntityArgsSchema = z.object({
  label: z.string().min(1, 'Le nom de l\'entité est requis'),
  description: z.string().optional(),
});

export const CurrencySchema = z.object({
  code: z.string(),
  label: z.string(),
  unicode: z.string().optional(),
}).passthrough();

export const ListCurrenciesArgsSchema = z.object({
  active: z.enum(['0', '1']).optional(),
});

export const ConvertCurrencyArgsSchema = z.object({
  amount: z.number().min(0, 'Le montant doit être positif'),
  from_currency: z.string().length(3, 'Code devise à 3 lettres (EUR, USD...)'),
  to_currency: z.string().length(3, 'Code devise à 3 lettres'),
  date: z.number().int().optional(),
});

export type Entity = z.infer<typeof EntitySchema>;
export type Currency = z.infer<typeof CurrencySchema>;

// === CALENDRIER & ABSENCES ===
export const HolidaySchema = z.object({
  id: z.string(),
  fk_user: z.string().optional(),
  date_debut: z.number().nullable().optional(),
  date_fin: z.number().nullable().optional(),
  halfday: z.number().nullable().optional(),
  statut: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
}).passthrough();

export const ListHolidaysArgsSchema = z.object({
  user_id: z.string().optional(),
  status: z.string().optional(),
  year: z.number().int().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateHolidayArgsSchema = z.object({
  fk_user: z.string().min(1, 'L\'ID utilisateur est requis'),
  date_debut: z.number().int().positive().min(1, 'Date de début requise'),
  date_fin: z.number().int().positive().min(1, 'Date de fin requise'),
  halfday: z.enum(['0', '1', '2']).optional().describe('0=Journée entière, 1=Matin, 2=Après-midi'),
  fk_type: z.string().optional(),
  description: z.string().optional(),
});

export const ValidateHolidayArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'absence est requis'),
  approve: z.boolean().default(true),
});

export const ResourceBookingSchema = z.object({
  id: z.string(),
  fk_resource: z.string().optional(),
  fk_user: z.string().optional(),
  date_start: z.number().nullable().optional(),
  date_end: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
}).passthrough();

export const CreateResourceBookingArgsSchema = z.object({
  resource_id: z.string().min(1, 'L\'ID de la ressource est requis'),
  user_id: z.string().min(1, 'L\'ID utilisateur est requis'),
  date_start: z.number().int().positive(),
  date_end: z.number().int().positive(),
  note: z.string().optional(),
});

export type Holiday = z.infer<typeof HolidaySchema>;
export type ResourceBooking = z.infer<typeof ResourceBookingSchema>;

// === ABONNEMENTS (Subscriptions) ===
export const SubscriptionSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  fk_soc: z.string().optional(),
  fk_product: z.string().optional(),
  date_start: z.number().nullable().optional(),
  date_end: z.number().nullable().optional(),
  amount: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
}).passthrough();

export const ListSubscriptionsArgsSchema = z.object({
  thirdparty_id: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const CreateSubscriptionArgsSchema = z.object({
  socid: z.string().min(1, 'L\'ID du tiers est requis'),
  fk_product: z.string().optional(),
  date_start: z.number().int().positive(),
  date_end: z.number().int().positive().optional(),
  amount: z.number().positive(),
  note: z.string().optional(),
  recurring: z.boolean().optional(),
  frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

export const RenewSubscriptionArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'abonnement est requis'),
  duration: z.number().int().positive().default(12).describe('Durée en mois'),
});

export const CancelSubscriptionArgsSchema = z.object({
  id: z.string().min(1, 'L\'ID de l\'abonnement est requis'),
  note: z.string().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
