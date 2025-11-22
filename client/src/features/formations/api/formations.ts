import { FormationFormValues } from '../schemas/formation.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createFormation(data: FormationFormValues, token: string) {
  const response = await fetch(`${API_URL}/api/formations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création de la formation');
  }

  return response.json();
}

export async function updateFormation(id: string, data: FormationFormValues, token: string) {
  const response = await fetch(`${API_URL}/api/formations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour de la formation');
  }

  return response.json();
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
