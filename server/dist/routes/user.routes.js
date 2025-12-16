"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/users/creat/user");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRoute = (0, express_1.Router)();
// Route pour le profil de l'utilisateur connecté
userRoute.get("/profile", auth_middleware_1.authMiddleware, user_1.getProfile);
userRoute.put("/profile", auth_middleware_1.authMiddleware, user_1.updateUser);
userRoute.put("/password", auth_middleware_1.authMiddleware, user_1.updatePassword);
userRoute.get("/:id", user_1.getUser);
userRoute.put("/:id", user_1.updateUser);
userRoute.delete("/:id", user_1.deleteUser);
exports.default = userRoute;
//# sourceMappingURL=user.routes.js.map