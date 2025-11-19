"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const dashboard_1 = __importDefault(require("./dashboard"));
function registerRoutes(app) {
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/user", user_routes_1.default);
    app.use("/api/dashboard", dashboard_1.default);
}
//# sourceMappingURL=index.js.map