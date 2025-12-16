"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const attestations_public_routes_1 = __importDefault(require("./attestations-public.routes"));
const attestations_routes_1 = __importDefault(require("./attestations.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const dashboard_1 = __importDefault(require("./dashboard"));
const formation_routes_1 = __importDefault(require("./formation.routes"));
const paiement_routes_1 = __importDefault(require("./paiement.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
function registerRoutes(app) {
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/user", user_routes_1.default);
    app.use("/api/formations", formation_routes_1.default);
    app.use("/api/dashboard", dashboard_1.default);
    app.use("/api/paiements", paiement_routes_1.default);
    // Routes attestations publiques d'abord
    app.use("/api/attestations", attestations_public_routes_1.default);
    // Routes attestations protégées ensuite
    app.use("/api/attestations", attestations_routes_1.default);
}
//# sourceMappingURL=index.js.map