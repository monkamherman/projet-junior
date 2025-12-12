"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attestation_controller_1 = require("../controllers/attestations/attestation.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
// Appliquer l'authentification à toutes les routes
router.use(auth_middleware_1.default);
/**
 * @route GET /api/attestations
 * @desc Récupérer les attestations de l'utilisateur connecté
 * @access Privé
 */
router.get("/", attestation_controller_1.getMesAttestations);
/**
 * @route GET /api/attestations/verifier-eligibilite/:formationId
 * @desc Vérifier si l'utilisateur peut générer une attestation pour une formation
 * @access Privé
 */
router.get("/verifier-eligibilite/:formationId", attestation_controller_1.verifierEligibiliteAttestation);
/**
 * @route POST /api/attestations/generer
 * @desc Générer une attestation pour l'utilisateur connecté
 * @access Privé
 */
router.post("/generer", attestation_controller_1.genererMonAttestation);
/**
 * @route GET /api/attestations/:id/telecharger
 * @desc Télécharger une attestation
 * @access Privé
 */
router.get("/:id/telecharger", attestation_controller_1.telechargerMonAttestation);
exports.default = router;
//# sourceMappingURL=attestations.routes.js.map