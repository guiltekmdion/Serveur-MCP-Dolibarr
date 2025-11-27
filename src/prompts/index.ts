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
      },
      {
        name: 'discount_percent',
        description: 'Pourcentage de remise globale (optionnel)',
        required: false,
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
  },
  {
    name: 'invoice-reminder',
    description: 'Génère un rappel de facture impayée personnalisé',
    arguments: [
      {
        name: 'invoice_id',
        description: 'ID de la facture impayée',
        required: true,
      },
      {
        name: 'tone',
        description: 'Ton du message: "courtois", "ferme" ou "dernier-avis"',
        required: false,
      }
    ],
  },
  {
    name: 'monthly-report',
    description: 'Génère un rapport mensuel d\'activité commerciale',
    arguments: [
      {
        name: 'month',
        description: 'Mois (1-12)',
        required: false,
      },
      {
        name: 'year',
        description: 'Année (ex: 2025)',
        required: false,
      }
    ],
  },
  {
    name: 'convert-proposal-to-order',
    description: 'Guide pour convertir une proposition en commande et facture',
    arguments: [
      {
        name: 'proposal_id',
        description: 'ID de la proposition à convertir',
        required: true,
      }
    ],
  },
  {
    name: 'find-sales-opportunities',
    description: 'Analyse les opportunités de vente (propositions en attente, clients inactifs)',
    arguments: [
      {
        name: 'days_inactive',
        description: 'Nombre de jours d\'inactivité pour considérer un client inactif',
        required: false,
      }
    ],
  },
  {
    name: 'product-catalog-summary',
    description: 'Résumé du catalogue produits avec prix et stocks',
    arguments: [
      {
        name: 'category',
        description: 'Catégorie de produits à analyser (optionnel)',
        required: false,
      }
    ],
  }
];

export function handleGetPrompt(name: string, args?: Record<string, string>) {
  switch (name) {
    case 'create-commercial-proposal': {
      const clientName = args?.client_name || '(Nom du client)';
      const requirements = args?.requirements || '(Besoins)';
      const discount = args?.discount_percent;
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Je souhaite créer une proposition commerciale pour le client "${clientName}".
              
Voici les besoins identifiés :
${requirements}
${discount ? `\nRemise à appliquer : ${discount}%` : ''}

Merci de suivre ces étapes :
1. Recherche le tiers "${clientName}" pour obtenir son ID. S'il n'existe pas, propose de le créer.
2. Recherche les produits correspondants aux besoins.
3. Crée une proposition commerciale (brouillon) pour ce tiers.
4. Ajoute les lignes de produits identifiés à la proposition.${discount ? `\n5. Applique une remise de ${discount}% sur les lignes.` : ''}
6. Affiche le résumé de la proposition créée avec son montant total.`
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

    case 'invoice-reminder': {
      const invoiceId = args?.invoice_id || '';
      const tone = args?.tone || 'courtois';
      
      const toneInstructions: Record<string, string> = {
        'courtois': 'Reste poli et professionnel, rappelle la facture comme un simple oubli.',
        'ferme': 'Sois plus direct, mentionne l\'importance du règlement rapide.',
        'dernier-avis': 'Indique que c\'est le dernier rappel avant mise en contentieux.'
      };
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Génère un email de rappel pour la facture impayée ID ${invoiceId}.

Instructions de ton : ${toneInstructions[tone] || toneInstructions['courtois']}

Étapes :
1. Récupère les détails de la facture (montant, date, client).
2. Récupère les coordonnées du client.
3. Rédige un email de rappel professionnel incluant :
   - Référence de la facture
   - Montant dû
   - Date d'échéance
   - Coordonnées bancaires (si disponibles)
4. Propose d'ajouter un événement agenda pour le suivi.`
            }
          }
        ]
      };
    }

    case 'monthly-report': {
      const now = new Date();
      const month = args?.month || String(now.getMonth() + 1);
      const year = args?.year || String(now.getFullYear());
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Génère un rapport d'activité commerciale pour ${month}/${year}.

Analyse les données suivantes :
1. **Propositions commerciales** : nombre créées, validées, refusées, en attente.
2. **Commandes** : nombre et montant total.
3. **Factures** : émises, payées, impayées.
4. **Nouveaux clients** : tiers créés ce mois.
5. **Top 5 clients** : par chiffre d'affaires.

Présente un résumé exécutif avec les tendances (hausse/baisse par rapport au mois précédent si possible).`
            }
          }
        ]
      };
    }

    case 'convert-proposal-to-order': {
      const proposalId = args?.proposal_id || '';
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Convertis la proposition commerciale ID ${proposalId} en commande puis en facture.

Étapes :
1. Récupère les détails de la proposition (client, lignes, montant).
2. Vérifie que la proposition est validée (statut = 1). Sinon, propose de la valider.
3. Crée une commande à partir de la proposition.
4. Valide la commande.
5. Crée une facture à partir de la commande.
6. Affiche un récapitulatif : numéros de proposition, commande et facture créés.`
            }
          }
        ]
      };
    }

    case 'find-sales-opportunities': {
      const daysInactive = args?.days_inactive || '90';
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Trouve des opportunités de vente.

Analyse :
1. **Propositions en attente** : liste les propositions ouvertes depuis plus de 7 jours.
2. **Clients inactifs** : trouve les clients sans facture depuis ${daysInactive} jours mais avec un historique d'achat.
3. **Propositions refusées récemment** : opportunités de relance.
4. **Commandes en attente** : commandes validées non facturées.

Pour chaque opportunité, suggère une action commerciale.`
            }
          }
        ]
      };
    }

    case 'product-catalog-summary': {
      const category = args?.category;
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Génère un résumé du catalogue produits${category ? ` pour la catégorie "${category}"` : ''}.

Informations à collecter :
1. Liste des produits ${category ? `de la catégorie "${category}"` : 'actifs'}.
2. Pour chaque produit : référence, libellé, prix de vente, stock disponible.
3. Identifie les produits en rupture de stock.
4. Calcule le prix moyen et la valeur totale du stock.
5. Liste les produits les plus vendus (si l'info est disponible).`
            }
          }
        ]
      };
    }

    default:
      throw new Error(`Prompt not found: ${name}`);
  }
}
