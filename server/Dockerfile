# Étape de construction
FROM oven/bun:latest AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lock ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN bun run build

# Étape de production
FROM oven/bun:latest

WORKDIR /app

# Installer les dépendances de production uniquement
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Copier les fichiers statiques nécessaires
COPY --from=builder /app/prisma ./prisma

# Installer Prisma Client
RUN bunx prisma generate

# Installer les dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y openssl

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["bun", "run", "start:prod"]
