import { dolibarrClient } from '../services/dolibarr.js';
import { 
  DownloadDocumentArgsSchema,
  DeleteDocumentArgsSchema,
  ListDocumentsForObjectArgsSchema,
  GeneratePdfArgsSchema,
  SendDocumentByEmailArgsSchema
} from '../types/index.js';

// === TÉLÉCHARGER UN DOCUMENT ===
export const downloadDocumentTool = {
  name: 'dolibarr_download_document',
  description: 'Télécharge un document (retourne le contenu en base64). modulepart: invoice, propal, order, product, societe, etc.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modulepart: { type: 'string', description: 'Type de module (invoice, propal, order...)' },
      original_file: { type: 'string', description: 'Chemin du fichier (ex: "facture/FA2401-001/FA2401-001.pdf")' },
    },
    required: ['modulepart', 'original_file'],
  },
};

export async function handleDownloadDocument(args: unknown) {
  const validated = DownloadDocumentArgsSchema.parse(args);
  const doc = await dolibarrClient.downloadDocument(validated.modulepart, validated.original_file);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(doc, null, 2),
      },
    ],
  };
}

// === SUPPRIMER UN DOCUMENT ===
export const deleteDocumentTool = {
  name: 'dolibarr_delete_document',
  description: 'Supprime un document.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modulepart: { type: 'string', description: 'Type de module' },
      original_file: { type: 'string', description: 'Chemin du fichier' },
    },
    required: ['modulepart', 'original_file'],
  },
};

export async function handleDeleteDocument(args: unknown) {
  const validated = DeleteDocumentArgsSchema.parse(args);
  await dolibarrClient.deleteDocument(validated.modulepart, validated.original_file);
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Document supprimé avec succès.',
      },
    ],
  };
}

// === LISTER LES DOCUMENTS D'UN OBJET ===
export const listDocumentsForObjectTool = {
  name: 'dolibarr_list_documents_for_object',
  description: 'Liste tous les documents liés à un objet (facture, devis, commande, client...). Retourne les noms de fichiers, chemins et URLs de téléchargement.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modulepart: { 
        type: 'string', 
        description: 'Type: invoice (facture), propal (devis), order (commande), contract, product, societe (client)' 
      },
      id: { type: 'string', description: 'ID de l\'objet' },
    },
    required: ['modulepart', 'id'],
  },
};

export async function handleListDocumentsForObject(args: unknown) {
  const validated = ListDocumentsForObjectArgsSchema.parse(args);
  const docs = await dolibarrClient.listDocumentsForObject(validated.modulepart, validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(docs, null, 2),
      },
    ],
  };
}

// === GÉNÉRER LE PDF ===
export const generatePdfTool = {
  name: 'dolibarr_generate_pdf',
  description: 'Génère (ou régénère) le PDF d\'un document (facture, devis, commande, contrat).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      module: { 
        type: 'string', 
        description: 'Type: invoice, propal, order, contract' 
      },
      id: { type: 'string', description: 'ID de l\'objet' },
    },
    required: ['module', 'id'],
  },
};

export async function handleGeneratePdf(args: unknown) {
  const validated = GeneratePdfArgsSchema.parse(args);
  const result = await dolibarrClient.generatePdf(validated.module, validated.id);
  return {
    content: [
      {
        type: 'text' as const,
        text: `PDF généré avec succès: ${result.filename}`,
      },
    ],
  };
}

// === ENVOYER PAR EMAIL ===
export const sendDocumentByEmailTool = {
  name: 'dolibarr_send_document_email',
  description: 'Envoie un document (facture, devis, commande) par email avec le PDF en pièce jointe.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      module: { type: 'string', description: 'Type: invoice, propal, order' },
      id: { type: 'string', description: 'ID de l\'objet' },
      sendto: { type: 'string', description: 'Email du destinataire' },
      subject: { type: 'string', description: 'Sujet de l\'email (optionnel)' },
      message: { type: 'string', description: 'Corps de l\'email (optionnel)' },
    },
    required: ['module', 'id', 'sendto'],
  },
};

export async function handleSendDocumentByEmail(args: unknown) {
  const validated = SendDocumentByEmailArgsSchema.parse(args);
  await dolibarrClient.sendDocumentByEmail(
    validated.module, 
    validated.id, 
    validated.sendto, 
    validated.subject, 
    validated.message
  );
  return {
    content: [
      {
        type: 'text' as const,
        text: `Document envoyé par email à ${validated.sendto}`,
      },
    ],
  };
}

export const documentTools = [
  downloadDocumentTool,
  deleteDocumentTool,
  listDocumentsForObjectTool,
  generatePdfTool,
  sendDocumentByEmailTool,
];
