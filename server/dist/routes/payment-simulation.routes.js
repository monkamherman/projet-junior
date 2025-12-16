"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formations/formation.controller");
const router = (0, express_1.Router)();
// Simulation de paiement
router.post("/simulate", formation_controller_1.simulatePayment);
exports.default = router;
//# sourceMappingURL=payment-simulation.routes.js.map