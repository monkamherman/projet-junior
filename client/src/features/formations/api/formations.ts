import { FormationFormValues } from '../schemas/formation.schema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiError extends Error {
  validationErrors?: Record<string, string>;
}

export async function createFormation(data: FormationFormValues, token: string) {
  console.log('[createFormation] Début de la fonction avec les données:', data);
  
  try {
    const url = `${API_URL}/api/formations`;
    console.log('[createFormation] URL de l\'API:', url);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    };
    
    console.log('[createFormation] Options de la requête:', {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': 'Bearer [REDACTED]' // Ne pas logger le token complet
      }
    });
    
    console.log('[createFormation] Envoi de la requête...');
    const response = await fetch(url, options);
    console.log('[createFormation] Réponse reçue, statut:', response.status);
    
    const responseData = await response.json().catch(e => {
      console.error('[createFormation] Erreur lors du parsing de la réponse JSON:', e);
      throw new Error('Erreur lors de la lecture de la réponse du serveur');
    });
    
    console.log('[createFormation] Données de la réponse:', responseData);

    if (!response.ok) {
      // Si le serveur renvoie des erreurs de validation
      if (response.status === 400 && responseData.errors) {
        // Formater les erreurs de validation pour les afficher dans le formulaire
        const validationErrors = responseData.errors.reduce((acc: Record<string, string>, error: any) => {
          acc[error.path] = error.message;
          return acc;
        }, {});
        
        const error: ApiError = new Error('Validation failed');
        error.validationErrors = validationErrors;
        throw error;
      }
      
      // Pour les autres types d'erreurs
      throw new Error(responseData.message || 'Erreur lors de la création de la formation');
    }

    return responseData;
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    throw error;
  }
}

export async function getFormation(id: string, token: string) {
  const response = await fetch(`${API_URL}/api/formations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération de la formation');
  }

  return response.json();
}

export async function getFormationById(id: string) {
  const response = await fetch(`${API_URL}/api/formations/${id}/public`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération de la formation');
  }

  return response.json();
}
