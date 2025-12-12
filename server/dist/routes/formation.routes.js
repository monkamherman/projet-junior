"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formation_1 = require("../controllers/formations/formation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Routes publiques
router.get("/", formation_1.getFormations);
router.get("/:id", formation_1.getFormationById);
// Routes protégées par authentification
router.get("/mes-formations", auth_middleware_1.authMiddleware, formation_1.getUserFormations);
router.post("/", auth_middleware_1.authMiddleware, formation_1.createFormation);
router.put("/:id", auth_middleware_1.authMiddleware, formation_1.updateFormation);
router.delete("/:id", auth_middleware_1.authMiddleware, formation_1.deleteFormation);
exports.default = router;
//# sourceMappingURL=formation.routes.js.map