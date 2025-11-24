import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { dolibarrClient } from '../services/dolibarr.js';

export const RESOURCES: Resource[] = [
  {
    uri: 'dolibarr://thirdparties/recent',
    name: 'Recent Thirdparties',
    description: 'List of recently modified thirdparties (limit 10)',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://proposals/open',
    name: 'Open Proposals',
    description: 'List of currently open commercial proposals',
    mimeType: 'application/json',
  },
  {
    uri: 'dolibarr://invoices/unpaid',
    name: 'Unpaid Invoices',
    description: 'List of unpaid invoices',
    mimeType: 'application/json',
  }
];

export async function handleReadResource(uri: string): Promise<string> {
  const url = new URL(uri);
  
  switch (true) {
    case uri === 'dolibarr://thirdparties/recent': {
      // On utilise searchThirdParties avec un filtre vide pour avoir les derniers
      // Note: L'API Dolibarr trie souvent par ID par défaut, ce qui correspond +/- au temps
      const thirdparties = await dolibarrClient.searchThirdParties(''); 
      return JSON.stringify(thirdparties, null, 2);
    }

    case uri === 'dolibarr://proposals/open': {
      // Status 1 = Open (Draft is 0)
      const proposals = await dolibarrClient.listProposals({ status: '1', limit: 20 });
      return JSON.stringify(proposals, null, 2);
    }

    case uri === 'dolibarr://invoices/unpaid': {
      // Status 1 = Unpaid
      const invoices = await dolibarrClient.listInvoices({ status: 'unpaid', limit: 20 });
      return JSON.stringify(invoices, null, 2);
    }

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}
