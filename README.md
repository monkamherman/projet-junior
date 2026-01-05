# Projet Junior - Centre de Formation

Application complète de gestion de centre de formation avec React frontend et Node.js backend.

## Architecture

- **Frontend** : React + TypeScript + TailwindCSS (port 3001)
- **Backend** : Node.js + Express + Prisma + MongoDB (port 10000)

## Prérequis

- Node.js >= 20
- Bun (gestionnaire de paquets)
- MongoDB (Atlas ou local)
- Navigateur moderne

## Installation

### Backend

```bash
cd server
cp .env.example .env   # créez-le si absent
# éditez .env et définissez : DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS

bun install
bunx prisma generate
bunx prisma db push
```

### Frontend

```bash
cd client
bun install
```

## Commandes de lancement

### Démarrage complet (recommandé)

```bash
# Terminal 1 - Backend
cd server
bun dev

# Terminal 2 - Frontend
cd client
bun dev
```

### Backend uniquement

```bash
cd server
bun dev
# Serveur disponible sur http://localhost:10000
```

### Frontend uniquement

```bash
cd client
bun dev
# Application disponible sur http://localhost:3001
```

### Variables d'environnement requises

```bash
# Backend (.env)
DATABASE_URL=mongodb+srv://...
JWT_SECRET=votre-secret-ici
ALLOWED_ORIGINS=http://localhost:3001
PORT=10000
```

## Fonctionnalités principales

### 🎓 Formations

- Consultation des formations disponibles
- Inscription aux formations
- Suivi de progression

### 💳 Paiements

- Paiement en ligne (Orange Money, MTN Money)
- Génération de reçus (format TXT)
- Historique des paiements

### 📜 Attestations

- Génération automatique d'attestations
- Téléchargement en PDF
- Design professionnel camerounais

### 👤 Profil utilisateur

- Gestion des informations personnelles
- Historique des formations
- Téléchargement des documents

## Modèles de données (Prisma)

- **Utilisateur** : identité + authentification
- **Formation** : programmes de formation
- **Inscription** : inscription utilisateur ↔ formation
- **Paiement** : transactions financières
- **Attestation** : certificats de réussite

## Authentification

- JWT avec refresh token
- Rôles : ADMIN, FORMATEUR, APPRENANT
- Protection des routes par middleware

## Endpoints principaux

### Authentification

- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion

### Formations

- `GET /api/formations/public` - Formations publiques
- `GET /api/formations` - Formations (auth)

### Paiements

- `POST /api/paiements` - Créer paiement
- `GET /api/paiements/:id/recu` - Télécharger reçu

### Attestations

- `POST /api/attestations/generer` - Générer attestation
- `GET /api/attestations/:id/telecharger` - Télécharger PDF

## Sécurité

- Helmet, CORS, rate limiting
- Validation des entrées (Zod)
- Hashage des mots de passe
- Protection CSRF

## Développement

### Scripts backend

```bash
bun dev      # Serveur de développement
bun build    # Build TypeScript
bun start    # Production
```

### Scripts frontend

```bash
bun dev      # Serveur de développement
bun build    # Build pour production
bun preview  # Prévisualiser le build
```

## Déploiement

```bash
# Build production
cd client && bun build
cd server && bun build

# Lancement production
cd server && bun start
```

## Technologies

- **Frontend** : React 18, TypeScript, TailwindCSS, React Hook Form, Zod
- **Backend** : Node.js, Express, Prisma, MongoDB, JWT, PDFKit
- **Outils** : Bun, Vite, ESLint, Prettier

## Support

Pour toute question ou problème, contactez l'équipe de développement.
