"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payments/payment");
const router = (0, express_1.Router)();
router.get("/", payment_1.getPayments);
router.get("/:id", payment_1.getPaymentById);
router.post("/", payment_1.createPayment);
router.put("/:id", payment_1.updatePayment);
router.delete("/:id", payment_1.deletePayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map