// src/server.ts
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cors from 'cors';
import { ONE_HUNDRED, SIXTY } from './core/constants';
import { logger } from 'env-var';
import { createClient } from 'redis';
import registerRoutes from './routes';
import helmet from 'helmet';
import compression from 'compression';
import cacheControl from 'express-cache-controller';

// Création du client Redis en dehors de toute fonction
const redisClient = createClient({
	url: 'redis://localhost:6379',
  });
  
  // Gestion des erreurs Redis
  redisClient.on('error', (err) => {
	console.error('Erreur de connexion Redis:', err.message);
  });
  
  // Fonction pour démarrer le serveur
  async function startServer() {
	try {
	  await redisClient.connect();
	  console.log("Connexion Redis établie avec succès.");
	} catch (err) {
	  console.error('Erreur lors de la connexion Redis:');
	  process.exit(1); // Arrête le serveur si Redis ne se connecte pas
	}
}

startServer()

const morganStream = {
	write: (message: string) => {
		logger('http', message.trim());
	}
};

const app = express();


registerRoutes(app)

// Configuration CORS dynamique
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('origin recived',origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Blocked by CORS policy'));
    }
    
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With','accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares critiques en premier
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      imgSrc: ["'self'", "data:", "https://trusted.cdn.com"],
      fontSrc: ["'self'", "https://trusted.cdn.com"],
      connectSrc: ["'self'", "https://api.trusted.com"],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' }, // Empêche le clickjacking
  hidePoweredBy: true,           // Masque l'en-tête X-Powered-By
  noSniff: true,                 // Empêche le sniffing MIME
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Politique de référent
  xssFilter: true, 
}));
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

app.get('/keep-alive', (req, res) => res.send('OK'))

// Rate limiting (après les routes critiques)


app.use(async (req, res, next) => {
	const ip = req.ip;
	const key = `rate_limit:${ip}`;
	const limit = ONE_HUNDRED;
  
	const current = await redisClient.incr(key);
  
	if (current === 1) {
	  await redisClient.expire(key, SIXTY); // Expire après 60 secondes
	}
  
	if (current > limit) {
	  return res.status(429).json({ error: 'Trop de requêtes depuis cette adresse IP' });
	}
  
	next();
  });

app.use(compression())
app.use(cacheControl({ maxAge: 86400 }));
// Logging
app.use(morgan('combined', { stream: morganStream }));

app.use(express.static('public'));

// Route racine modifiée
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


// Gestion des erreurs CORS
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message.includes('CORS')) {
    res.status(403).json({ error: err.message });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10000;

// Ajoutez ce contrôle d'erreur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
}).on('error', (err) => {
  console.error('Erreur de démarrage:', err.message);
  process.exit(1);
});

