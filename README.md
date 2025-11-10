# Projet Junior - Backend (Centre de Formation)

API Node.js/Express + Prisma (MongoDB) pour la gestion d’un centre de formation.

## Prérequis
- Node.js >= 20
- Yarn 1.x
- MongoDB (Atlas ou local) et une URL `DATABASE_URL`
- (Optionnel) Redis pour le rate limiting

## Installation
```bash
cd server
cp .env.example .env   # créez-le si absent
# éditez .env et définissez : DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS

yarn
npx prisma generate
npx prisma db push
```

### Lancement en dev
```bash
cd server
JWT_SECRET=change-me ALLOWED_ORIGINS=http://localhost:5173 PORT=10000 yarn dev
```

## Modèles principaux (Prisma)
- Participant: identité + champs d’auth (email, password, role)
- Formation, Formateur
- Dispense (session)
- Inscription (pivot Participant ↔ Formation)
- Parlement (paiement)
- Interdiction, Fonction, Concerne

## Authentification
- Endpoints:
  - POST `/api/auth/signup` { email, password, nom, prenom, sexe, dateNaissance, lieuNaissance, telephone }
  - POST `/api/auth/login` { email, password }
  - GET `/api/auth/me` (Bearer Token)
  - POST `/api/auth/logout`
- JWT: mettre `JWT_SECRET` dans `.env`

## Middleware
- `requireAuth`: protège les routes en vérifiant le token JWT

## Endpoints V0 (CRUD minimal)
- Participants: `/api/participants` (POST, GET, GET/:id)
- Formations: `/api/formations` (POST, GET, GET/:id)
- Formateurs: `/api/formateurs` (POST, GET, GET/:id)
- Dispenses: `/api/dispenses` (POST, GET, GET/:id)
- Inscriptions: `/api/inscriptions` (POST, GET, GET/:id)
- Parlements: `/api/parlements` (POST, GET, GET/:id)

Toutes ces routes sont protégées par `requireAuth` (utiliser un token obtenu via login/signup).

## Sécurité
- Helmet, CORS, rate limiting (Redis optionnel en dev)

## Scripts
- `yarn dev`: dev server (ts-node-dev)
- `yarn build`: build TypeScript
- `yarn start`: run build

## Prochaines étapes
- Rôles avancés (admin/formateur)
- Validation de schémas (zod/yup)
- Pagination/filtrage avancé
- Génération PDF (attestations/factures)
- Upload fichiers (S3/local)
