import { Router } from "express";
import {
  genererMonAttestation,
  getMesAttestations,
  telechargerMonAttestation,
  verifierEligibiliteAttestation,
} from "../controllers/attestations/attestation.controller";
import { generateAttestation } from "../controllers/formations/formation.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Route publique pour la simulation d'attestation
router.post("/generate", generateAttestation);

// Appliquer l'authentification aux autres routes
router.use(authMiddleware);

/**
 * @route GET /api/attestations
 * @desc Récupérer les attestations de l'utilisateur connecté
 * @access Privé
 */
router.get("/", getMesAttestations);

/**
 * @route GET /api/attestations/verifier-eligibilite/:formationId
 * @desc Vérifier si l'utilisateur peut générer une attestation pour une formation
 * @access Privé
 */
router.get(
  "/verifier-eligibilite/:formationId",
  verifierEligibiliteAttestation
);

/**
 * @route POST /api/attestations/generer
 * @desc Générer une attestation pour l'utilisateur connecté
 * @access Privé
 */
router.post("/generer", genererMonAttestation);

/**
 * @route GET /api/attestations/:id/telecharger
 * @desc Télécharger une attestation
 * @access Privé
 */
router.get("/:id/telecharger", telechargerMonAttestation);

export default router;
