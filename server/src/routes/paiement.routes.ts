import { Router } from "express";
import { simulatePayment } from "../controllers/formations/formation.controller";
import {
  creerPaiement,
  getStatutPaiement,
  listerPaiementsUtilisateur,
  telechargerRecuPaiement,
} from "../controllers/paiements/paiement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Route publique pour la simulation de paiement
router.post("/simulate", simulatePayment);

// Protéger les autres routes avec l'authentification
router.use(authMiddleware);

// Créer un nouveau paiement
router.post("/", creerPaiement);

// Lister les paiements de l'utilisateur connecté
router.get("/", listerPaiementsUtilisateur);

// Route spécifique pour le frontend - mes paiements
router.get("/mes-paiements", listerPaiementsUtilisateur);

// Télécharger le reçu d'un paiement
router.get("/:id/recu", telechargerRecuPaiement);

// Obtenir le statut d'un paiement par référence
router.get("/:reference", getStatutPaiement);

export default router;
