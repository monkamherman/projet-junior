"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/server.ts
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const env_var_1 = require("env-var");
const express_1 = __importDefault(require("express"));
const express_cache_controller_1 = __importDefault(require("express-cache-controller"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const constants_1 = require("./core/constants");
const routes_1 = __importDefault(require("./routes"));
const morganStream = {
    write: (message) => {
        (0, env_var_1.logger)("http", message.trim());
    },
};
exports.app = (0, express_1.default)();
// Configuration CORS simplifiée pour le développement
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:4000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3001",
            "http://localhost:3002",
            "https://projet-junior-client.onrender.com",
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
};
// Middlewares critiques en premier
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Configuration Helmet simplifiée pour le développement
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));
// Rate limiting simple en mémoire (remplace Redis)
const rateLimitMap = new Map();
// Nettoyage périodique du rate limiting (toutes les 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitMap.entries()) {
        if (now > data.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);
// Rate limiting simplifié
exports.app.use(async (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const key = `rate_limit:${ip}`;
    const limit = constants_1.ONE_HUNDRED;
    const windowMs = constants_1.SIXTY * 1000;
    const existing = rateLimitMap.get(key);
    if (!existing || now > existing.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return next();
    }
    if (existing.count >= limit) {
        return res
            .status(429)
            .json({ error: "Trop de requêtes depuis cette adresse IP" });
    }
    existing.count++;
    next();
});
// Middleware de compression
exports.app.use((0, compression_1.default)());
// Middleware de contrôle du cache
exports.app.use((0, express_cache_controller_1.default)({ maxAge: 86400 }));
// Logging
exports.app.use((0, morgan_1.default)("combined", { stream: morganStream }));
exports.app.use(express_1.default.static("public"));
// Health check
exports.app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: "1.0.0",
    });
});
exports.app.get("/keep-alive", (req, res) => res.send("OK"));
// Enregistrer les routes applicatives après les middlewares
(0, routes_1.default)(exports.app);
// Route racine modifiée
exports.app.get("/api", (req, res) => {
    res.status(200).json({
        status: "online",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
// Gestion des erreurs CORS
exports.app.use((err, req, res, next) => {
    if (err.message.includes("CORS")) {
        res.status(403).json({ error: err.message });
    }
    else {
        next(err);
    }
});
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10000;
exports.app
    .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
})
    .on("error", (err) => {
    console.error("Erreur de démarrage:", err.message);
    process.exit(1);
});
//# sourceMappingURL=app.js.map