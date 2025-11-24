import axios from 'axios';

interface CompanySearchResult {
  siren: string;
  nom_complet: string;
  activite_principale: string;
  siege: {
    adresse: string;
    code_postal: string;
    libelle_commune: string;
    siret: string;
  };
}

export async function searchFrenchCompany(query: string): Promise<CompanySearchResult | null> {
  try {
    const response = await axios.get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: query,
        limit: 1,
        per_page: 1
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0] as CompanySearchResult;
    }
    return null;
  } catch (error) {
    console.error('Error searching for company:', error);
    return null;
  }
}
