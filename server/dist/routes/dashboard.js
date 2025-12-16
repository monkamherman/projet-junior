"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController = __importStar(require("../controllers/dashboard/certificates"));
const formationController = __importStar(require("../controllers/dashboard/formations"));
const paymentController = __importStar(require("../controllers/dashboard/payments"));
const statsController = __importStar(require("../controllers/dashboard/stats"));
const userController = __importStar(require("../controllers/dashboard/users"));
const router = (0, express_1.Router)();
// Routes pour les statistiques du tableau de bord
router.get("/stats", statsController.getDashboardStats);
// Routes pour la gestion des utilisateurs
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deactivateUser);
// Routes pour la gestion des formations
router.post("/formations", formationController.createFormation);
router.get("/formations", formationController.getAllFormations);
router.get("/formations/:id", formationController.getFormationById);
router.put("/formations/:id", formationController.updateFormation);
router.delete("/formations/:id", formationController.deleteFormation);
// Routes pour la gestion des paiements
router.post("/payments", paymentController.createPayment);
router.get("/payments", paymentController.getAllPayments);
router.get("/payments/:id", paymentController.getPaymentById);
router.patch("/payments/:id/status", paymentController.updatePaymentStatus);
// Routes pour la gestion des attestations
router.post("/certificates/generate", certificateController.generateCertificateForUser);
router.get("/certificates", certificateController.getAllCertificates);
router.get("/certificates/:id/download", certificateController.downloadCertificate);
router.post("/certificates/:id/send", certificateController.sendCertificateByEmail);
exports.default = router;
//# sourceMappingURL=dashboard.js.map