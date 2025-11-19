"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/users/creat/user");
const userRoute = (0, express_1.Router)();
userRoute.get("/:id", user_1.getUser);
userRoute.put("/:id", user_1.updateUser);
userRoute.delete("/:id", user_1.deleteUser);
exports.default = userRoute;
//# sourceMappingURL=user.routes.js.map