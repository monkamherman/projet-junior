"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formation_1 = require("../controllers/formations/formation");
const router = (0, express_1.Router)();
router.get("/", formation_1.getFormations);
router.get("/:id", formation_1.getFormationById);
router.post("/", formation_1.createFormation);
router.put("/:id", formation_1.updateFormation);
router.delete("/:id", formation_1.deleteFormation);
exports.default = router;
//# sourceMappingURL=formation.routes.js.map