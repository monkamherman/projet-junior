# Projet Junior - Centre de Formation

Application complète de gestion de centre de formation avec React frontend et Node.js backend.

## Architecture

- **Frontend** : React + TypeScript + TailwindCSS
- **Backend** : Node.js + Express + Prisma + MongoDB
- **Reverse Proxy** : Nginx

## Prérequis

- Node.js >= 20
- Bun (gestionnaire de paquets)
- MongoDB (Atlas ou local)
- Docker & Docker Compose (pour la production)

## Installation en local

### Backend

```bash
cd server
cp .env.example .env
bun install
bunx prisma generate
bunx prisma db push
bun dev
```

### Frontend

```bash
cd client
bun install
bun dev
```

## Déploiement Docker (Production)

### Architecture de production

```
centic.rageai.digital:80
        │
        ▼
    ┌─────────────┐
    │   Nginx     │  (Reverse Proxy)
    └─────┬───────┘
          │
    ┌─────┴───────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│ Client │   │ Server │
└────────┘   └───┬────┘
                 │
                 ▼
           ┌──────────┐
           │ MongoDB  │
           └──────────┘
```

### 1. Configuration GitHub Actions

Les images Docker sont automatiquement construites et publiées sur GHCR via GitHub Actions.

**Fichier concerné** : `.github/workflows/docker-build.yml`

### 2. Sur le VPS

```bash
# Créer le répertoire de déploiement
mkdir -p /opt/centic && cd /opt/centic

# Télécharger les fichiers de configuration
# Option 1: Cloner le repo (recommandé pour la première fois)
git clone https://github.com/monkamherman/projet-junior.git .

# Option 2: Créer les fichiers manuellement
# - docker-compose.prod.yml
# - nginx/nginx.conf
# - .env
# - deploy.sh

# Créer le fichier .env
cat > .env << EOF
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=votre_mot_de_passe_securise
MONGO_INITDB_DATABASE=projet_junior
JWT_SECRET=votre_jwt_secret_securise
CLIENT_URL=https://centic.rageai.digital
VITE_API_URL=/api
EOF

# Rendre le script exécutable
chmod +x deploy.sh

# Déployer
./deploy.sh latest
```

### 3. Déployer une nouvelle version

```bash
# Sur le VPS
cd /opt/centic
./deploy.sh latest        # dernière version
./deploy.sh v1.2.0        # version spécifique
```

### 4. Commandes utiles

```bash
# Voir l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Redémarrer
docker-compose -f docker-compose.prod.yml restart
```

## Images Docker

Les images sont publiées sur GitHub Container Registry :

- `ghcr.io/monkamherman/projet-junior-client:latest`
- `ghcr.io/monkamherman/projet-junior-server:latest`
- `ghcr.io/monkamherman/projet-junior-nginx:latest`

## Endpoints principaux

### Authentification

- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Formations

- `GET /api/formations/public` - Formations publiques
- `GET /api/formations` - Formations (auth)

### Paiements

- `POST /api/paiements` - Créer paiement
- `GET /api/paiements/:id/recu` - Télécharger reçu

### Attestations

- `POST /api/attestations/generer` - Générer attestation
- `GET /api/attestations/:id/telecharger` - Télécharger PDF

## Technologies

- **Frontend** : React 18, TypeScript, TailwindCSS, React Hook Form, Zod
- **Backend** : Node.js, Express, Prisma, MongoDB, JWT, PDFKit
- **Outils** : Bun, Vite, Docker, GitHub Actions

## Support

Pour toute question ou problème, contactez l'équipe de développement.