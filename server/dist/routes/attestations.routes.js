"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const attestation_controller_1 = require("../controllers/attestations/attestation.controller");
const formation_controller_1 = require("../controllers/formations/formation.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Route publique pour la simulation d'attestation
router.post("/generate", formation_controller_1.generateAttestation);
// Route pour servir les fichiers PDF d'attestation
router.get("/attestations/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(__dirname, "../../public/attestations", filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ message: "Fichier non trouvé" });
        }
    });
});
// Appliquer l'authentification aux autres routes
router.use(auth_middleware_1.default);
/**
 * @route GET /api/attestations
 * @desc Récupérer les attestations de l'utilisateur connecté
 * @access Privé
 */
router.get("/", attestation_controller_1.getMesAttestations);
/**
 * @route GET /api/attestations/user
 * @desc Récupérer les attestations de l'utilisateur connecté (alias)
 * @access Privé
 */
router.get("/user", attestation_controller_1.getMesAttestations);
/**
 * @route GET /api/attestations/:id
 * @desc Récupérer les détails d'une attestation spécifique
 * @access Privé
 */
router.get("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        const { id } = req.params;
        const attestation = await prisma.attestation.findUnique({
            where: { id },
            include: {
                inscription: {
                    include: {
                        utilisateur: true,
                        formation: true,
                    },
                },
            },
        });
        if (!attestation) {
            return res.status(404).json({ message: "Attestation non trouvée" });
        }
        // Vérifier que l'utilisateur est bien le propriétaire
        if (attestation.inscription.utilisateurId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Non autorisé à accéder à cette attestation" });
        }
        res.json(attestation);
    }
    catch (error) {
        console.error("Erreur lors de la récupération de l'attestation:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de l'attestation",
        });
    }
});
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