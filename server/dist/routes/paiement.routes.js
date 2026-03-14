"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paiement_controller_1 = require("../controllers/paiements/paiement.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
// Route publique pour le webhook Monetbil (pas d'authentification)
// Cette route est appelée par Monetbil pour notifier le statut du paiement
router.post("/webhook/monetbil", paiement_controller_1.monetbilWebhook);
// Appliquer le middleware d'authentification aux autres routes
router.use(auth_middleware_1.default);
/**
 * @route POST /api/paiements
 * @desc Créer un nouveau paiement avec intégration Monetbil
 * @access Privé
 */
router.post("/", paiement_controller_1.creerPaiement);
/**
 * @route GET /api/paiements
 * @desc Lister les paiements de l'utilisateur connecté
 * @access Privé
 */
router.get("/", paiement_controller_1.listerPaiementsUtilisateur);
/**
 * @route GET /api/paiements/:reference/statut
 * @desc Récupérer le statut d'un paiement
 * @access Privé
 */
router.get("/:reference/statut", paiement_controller_1.getStatutPaiement);
/**
 * @route GET /api/paiements/:reference/verifier
 * @desc Vérifier manuellement le statut d'un paiement Monetbil
 * @access Privé
 */
router.get("/:reference/verifier", paiement_controller_1.verifierStatutMonetbil);
/**
 * @route POST /api/paiements/:reference/annuler
 * @desc Annuler un paiement en cours
 * @access Privé
 */
router.post("/:reference/annuler", paiement_controller_1.annulerPaiement);
/**
 * @route GET /api/paiements/:id/recu
 * @desc Télécharger le reçu de paiement en format TXT
 * @access Privé
 */
router.get("/:id/recu", paiement_controller_1.telechargerRecuPaiementTxt);
exports.default = router;
//# sourceMappingURL=paiement.routes.js.map