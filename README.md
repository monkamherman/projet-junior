# Projet Junior - Centre de Formation

Application complète de gestion de centre de formation avec React frontend et Node.js backend.

## Architecture

- **Frontend** : React + TypeScript + TailwindCSS
- **Backend** : Node.js + Express + Prisma + MongoDB
- **Proxy** : Nginx Proxy Manager (sur le VPS)

## Prérequis

- Node.js >= 20
- MongoDB (Atlas ou local pour le dev)
- Docker & Docker Compose (pour le déploiement)

## Installation en local

### Backend

```bash
cd server
cp .env.example .env
npm install  # ou bun install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd client
npm install  # ou bun install
npm run dev
```

## Déploiement sur VPS (clone + Nginx Proxy Manager)

### Architecture de production

```
                    Nginx Proxy Manager (80/443)
                              │
        centic.rageai.digital │
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    / (frontend)         /api/*              /socket.io
    localhost:3001       localhost:3002      localhost:3002
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐          ┌──────────┐
    │ Client  │          │ Server  │──────────│ MongoDB  │
    └─────────┘          └─────────┘          └──────────┘
```

### 1. Sur le VPS : cloner et déployer

```bash
# Créer le répertoire de déploiement
mkdir -p /opt/centic && cd /opt/centic

# Cloner le projet
git clone https://github.com/votre-org/projet-junior.git .

# Créer le fichier .env
cp .env.example .env
nano .env   # Adapter les valeurs (MongoDB, JWT_SECRET, CLIENT_URL)

# Lancer le déploiement
chmod +x deploy.sh
./deploy.sh
```

### 2. Configuration Nginx Proxy Manager

Dans l'interface NPM (généralement `http://vps-ip:81`), créer un **Proxy Host** :

| Champ | Valeur |
|-------|--------|
| **Domain Names** | `centic.rageai.digital` (votre domaine) |
| **Scheme** | `http` |
| **Forward Hostname / IP** | `host.docker.internal` ou `172.17.0.1` (ou IP du host si NPM est sur le host) |
| **Forward Port** | `3001` |
| **Cache Assets** | Activé (optionnel) |

**Custom Locations** à ajouter dans le même Proxy Host :

| Location | Forward Hostname | Forward Port | Websockets |
|----------|------------------|--------------|------------|
| `/api` | `host.docker.internal` ou `172.17.0.1` | `3002` | ☐ |
| `/socket.io` | `host.docker.internal` ou `172.17.0.1` | `3002` | ☑ |

> **Note** : Si NPM tourne sur le host (pas dans Docker), utiliser `127.0.0.1` au lieu de `host.docker.internal`.

Activer **SSL** (Let's Encrypt) dans l'onglet SSL du Proxy Host pour HTTPS.

### 3. Mise à jour

```bash
cd /opt/centic
git pull
./deploy.sh
```

### 4. Commandes utiles

```bash
# Voir l'état des conteneurs
docker compose ps

# Voir les logs
docker compose logs -f

# Arrêter les services
docker compose down

# Reconstruire après modification du code
docker compose build --no-cache && docker compose up -d
```

## Ports exposés

| Service | Port | Usage |
|---------|------|-------|
| Client (frontend) | 3001 | NPM forward `/` |
| Server (backend) | 3002 | NPM forward `/api`, `/socket.io` |

## Variables d'environnement (.env)

| Variable | Description |
|----------|-------------|
| `MONGO_INITDB_ROOT_USERNAME` | Utilisateur MongoDB |
| `MONGO_INITDB_ROOT_PASSWORD` | Mot de passe MongoDB |
| `MONGO_INITDB_DATABASE` | Nom de la base |
| `JWT_SECRET` | Clé secrète JWT |
| `CLIENT_URL` | URL du frontend (ex: https://centic.rageai.digital) |

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

- **Frontend** : React 19, TypeScript, TailwindCSS, React Hook Form, Zod
- **Backend** : Node.js, Express, Prisma, MongoDB, JWT, PDFKit
- **Outils** : Vite, Docker, Nginx Proxy Manager
