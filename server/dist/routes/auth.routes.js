"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/users/creat/auth");
const signup_1 = require("../controllers/users/creat/signup");
const router = (0, express_1.Router)();
// Authentification
router.post("/login", auth_1.login);
router.post("/refresh", auth_1.refreshToken);
router.post("/logout", auth_1.logout);
// Inscription
router.post("/signup", signup_1.signup);
router.post("/send-otp", signup_1.sendOTP);
router.post("/verify-otp", signup_1.verifyOTP);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map