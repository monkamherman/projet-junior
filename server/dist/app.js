"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const env_var_1 = require("env-var");
const express_1 = __importDefault(require("express"));
const express_cache_controller_1 = __importDefault(require("express-cache-controller"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const redis_1 = require("redis");
const constants_1 = require("./core/constants");
const routes_1 = __importDefault(require("./routes"));
// Création du client Redis (optionnel en dev/tests)
let redisReady = false;
const redisClient = (0, redis_1.createClient)({ url: "redis://localhost:6379" });
redisClient.on("error", (err) => {
    console.warn("Redis indisponible:", err.message);
});
(async () => {
    try {
        await redisClient.connect();
        redisReady = true;
        console.log("Connexion Redis établie avec succès.");
    }
    catch (_err) {
        redisReady = false;
        console.warn("Redis non connecté, démarrage sans rate limiting Redis.");
    }
})();
const morganStream = {
    write: (message) => {
        (0, env_var_1.logger)("http", message.trim());
    },
};
const app = (0, express_1.default)();
// Configuration CORS simplifiée pour le développement
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:4000",
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configuration Helmet simplifiée pour le développement
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));
// Rate limiting (après les routes critiques)
app.use(async (req, res, next) => {
    if (!redisReady)
        return next();
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    const limit = constants_1.ONE_HUNDRED;
    const current = await redisClient.incr(key);
    if (current === 1) {
        await redisClient.expire(key, constants_1.SIXTY);
    }
    if (current > limit) {
        return res
            .status(429)
            .json({ error: "Trop de requêtes depuis cette adresse IP" });
    }
    next();
});
// Middleware de compression
app.use((0, compression_1.default)());
// Middleware de contrôle du cache
app.use((0, express_cache_controller_1.default)({ maxAge: 86400 }));
// Logging
app.use((0, morgan_1.default)("combined", { stream: morganStream }));
app.use(express_1.default.static("public"));
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: "1.0.0",
    });
});
app.get("/keep-alive", (req, res) => res.send("OK"));
// Enregistrer les routes applicatives après les middlewares
(0, routes_1.default)(app);
// Route racine modifiée
app.get("/api", (req, res) => {
    res.status(200).json({
        status: "online",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
// Gestion des erreurs CORS
app.use((err, req, res, next) => {
    if (err.message.includes("CORS")) {
        res.status(403).json({ error: err.message });
    }
    else {
        next(err);
    }
});
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10000;
app
    .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
})
    .on("error", (err) => {
    console.error("Erreur de démarrage:", err.message);
    process.exit(1);
});
//# sourceMappingURL=app.js.map