import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export const PROMPTS: Prompt[] = [
  {
    name: 'create-commercial-proposal',
    description: 'Guide pour créer une proposition commerciale complète',
    arguments: [
      {
        name: 'client_name',
        description: 'Nom du client ou prospect',
        required: true,
      },
      {
        name: 'requirements',
        description: 'Besoins du client ou liste des produits/services',
        required: true,
      }
    ],
  },
  {
    name: 'analyze-thirdparty-situation',
    description: 'Analyse complète de la situation d\'un tiers (CA, factures impayées, dernières actions)',
    arguments: [
      {
        name: 'thirdparty_id',
        description: 'ID du tiers à analyser',
        required: true,
      }
    ],
  }
];

export function handleGetPrompt(name: string, args?: Record<string, string>) {
  switch (name) {
    case 'create-commercial-proposal': {
      const clientName = args?.client_name || '(Nom du client)';
      const requirements = args?.requirements || '(Besoins)';
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Je souhaite créer une proposition commerciale pour le client "${clientName}".
              
Voici les besoins identifiés :
${requirements}

Merci de suivre ces étapes :
1. Recherche le tiers "${clientName}" pour obtenir son ID. S'il n'existe pas, propose de le créer.
2. Recherche les produits correspondants aux besoins.
3. Crée une proposition commerciale (brouillon) pour ce tiers.
4. Ajoute les lignes de produits identifiés à la proposition.
5. Affiche le résumé de la proposition créée avec son montant total.`
            }
          }
        ]
      };
    }

    case 'analyze-thirdparty-situation': {
      const id = args?.thirdparty_id || '';
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Peux-tu me faire une analyse de la situation du tiers ID ${id} ?

Merci d'effectuer les vérifications suivantes :
1. Récupère les détails du tiers (coordonnées, statut).
2. Liste ses contacts principaux.
3. Cherche ses dernières factures (payées et impayées).
4. Cherche ses propositions commerciales en cours.
5. Fais-moi une synthèse : est-ce un bon payeur ? Y a-t-il des opportunités commerciales en cours ?`
            }
          }
        ]
      };
    }

    default:
      throw new Error(`Prompt not found: ${name}`);
  }
}
