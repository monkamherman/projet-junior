import { Router } from "express";
import {
  creerPaiement,
  telechargerRecuPaiementTxt,
} from "../controllers/paiements/paiement.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

/**
 * @route POST /api/paiements
 * @desc Créer un nouveau paiement
 * @access Privé
 */
router.post("/", creerPaiement);

/**
 * @route GET /api/paiements/:id/recu
 * @desc Télécharger le reçu de paiement en format TXT
 * @access Privé
 */
router.get("/:id/recu", telechargerRecuPaiementTxt);

export default router;
