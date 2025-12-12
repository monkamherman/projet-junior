"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paiement_controller_1 = require("../controllers/paiements/paiement.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protéger toutes les routes avec l'authentification
router.use(auth_middleware_1.authMiddleware);
// Créer un nouveau paiement
router.post('/', paiement_controller_1.creerPaiement);
// Obtenir le statut d'un paiement
router.get('/:reference', paiement_controller_1.getStatutPaiement);
// Lister les paiements de l'utilisateur connecté
router.get('/', paiement_controller_1.listerPaiementsUtilisateur);
exports.default = router;
//# sourceMappingURL=paiement.routes.js.map