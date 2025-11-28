import { Router } from 'express';
import { creerPaiement, getStatutPaiement, listerPaiementsUtilisateur } from '../controllers/paiements/paiement.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware);

// Créer un nouveau paiement
router.post('/', creerPaiement);

// Obtenir le statut d'un paiement
router.get('/:reference', getStatutPaiement);

// Lister les paiements de l'utilisateur connecté
router.get('/', listerPaiementsUtilisateur);

export default router;
