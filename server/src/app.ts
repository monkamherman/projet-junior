// src/server.ts
import compression from "compression";
import cors from "cors";
import { logger } from "env-var";
import express from "express";
import cacheControl from "express-cache-controller";
import helmet from "helmet";
import morgan from "morgan";
import { createClient } from "redis";
import { ONE_HUNDRED, SIXTY } from "./core/constants";
import registerRoutes from "./routes";

// Création du client Redis (optionnel en dev/tests)
let redisReady = false;
const redisClient = createClient({ url: "redis://localhost:6379" });

redisClient.on("error", (err) => {
  console.warn("Redis indisponible:", (err as Error).message);
});

(async () => {
  try {
    await redisClient.connect();
    redisReady = true;
    console.log("Connexion Redis établie avec succès.");
  } catch (_err) {
    redisReady = false;
    console.warn("Redis non connecté, démarrage sans rate limiting Redis.");
  }
})();

const morganStream = {
  write: (message: string) => {
    logger("http", message.trim());
  },
};

const app = express();

// Configuration CORS simplifiée pour le développement
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://projet-junior-client.onrender.com",
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Helmet simplifiée pour le développement
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// Rate limiting (après les routes critiques)
app.use(async (req, res, next) => {
  if (!redisReady) return next();
  const ip = req.ip;
  const key = `rate_limit:${ip}`;
  const limit = ONE_HUNDRED;

  const current = await redisClient.incr(key);

  if (current === 1) {
    await redisClient.expire(key, SIXTY);
  }

  if (current > limit) {
    return res
      .status(429)
      .json({ error: "Trop de requêtes depuis cette adresse IP" });
  }

  next();
});

// Middleware de compression
app.use(compression());

// Middleware de contrôle du cache
app.use(cacheControl({ maxAge: 86400 }));
// Logging
app.use(morgan("combined", { stream: morganStream }));

app.use(express.static("public"));

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
registerRoutes(app);

// Route racine modifiée
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs CORS
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.message.includes("CORS")) {
      res.status(403).json({ error: err.message });
    } else {
      next(err);
    }
  }
);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10000;

app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Erreur de démarrage:", err.message);
    process.exit(1);
  });
