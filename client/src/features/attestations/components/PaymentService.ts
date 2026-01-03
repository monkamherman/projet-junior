import { axiosInstance } from '@/api/api.config';
import { getPaymentService } from './PaymentService.abstract';
import type {
  Attestation,
  EligibiliteResult,
  PaymentDetails,
  PaymentResult,
} from './types';

const API_BASE_URL = '/api/attestations';

/**
 * Service pour gérer les opérations liées aux paiements et aux attestations
 */
export class AttestationService {
  private paymentService = getPaymentService();

  /**
   * Vérifie l'éligibilité pour une formation
   */
  async checkEligibility(formationId: string): Promise<EligibiliteResult> {
    try {
      const response = await axiosInstance.get<EligibiliteResult>(
        `${API_BASE_URL}/verifier-eligibilite/${formationId}`
      );

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification d'éligibilité:", error);
      throw new Error(
        "Impossible de vérifier l'éligibilité. Veuillez réessayer."
      );
    }
  }

  /**
   * Traite un paiement et génère une attestation
   */
  async processPaymentAndGenerateAttestation(
    details: PaymentDetails
  ): Promise<{ result: PaymentResult; attestation?: Attestation }> {
    // 1. Traitement du paiement
    const paymentResult = await this.paymentService.processPayment(details);

    if (!paymentResult.success) {
      return { result: paymentResult };
    }

    // 2. Si le paiement réussit, générer l'attestation
    try {
      const response = await axiosInstance.post<Attestation>(
        `${API_BASE_URL}/generer/${details.formationId}`,
        {
          paymentMethod: details.methode,
          phoneNumber: details.numeroTelephone,
          amount: details.montant,
          transactionId: paymentResult.transactionId,
        }
      );

      const attestation = response.data;
      return {
        result: { ...paymentResult, attestationId: attestation.id },
        attestation,
      };
    } catch (error) {
      console.error("Erreur lors de la génération de l'attestation:", error);
      return {
        result: {
          success: false,
          error:
            "Le paiement a réussi mais la génération de l'attestation a échoué. Contactez le support.",
        },
      };
    }
  }

  /**
   * Télécharge une attestation générée
   */
  async downloadAttestation(attestationId: string): Promise<void> {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/telecharger/${attestationId}`,
        {
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-${attestationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw new Error(
        "Impossible de télécharger l'attestation. Veuillez réessayer."
      );
    }
  }
}

// Export d'une instance unique du service
export const attestationService = new AttestationService();
