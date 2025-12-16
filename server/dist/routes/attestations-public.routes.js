"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formations/formation.controller");
const router = (0, express_1.Router)();
// Génération d'attestation
router.post("/generate", formation_controller_1.generateAttestation);
router.get("/user/:userId", async (req, res) => {
    // Endpoint pour récupérer les attestations d'un utilisateur
    try {
        // Pour l'instant, retourner une liste vide
        res.json([]);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des attestations" });
    }
});
exports.default = router;
//# sourceMappingURL=attestations-public.routes.js.map