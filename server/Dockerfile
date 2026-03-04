# Étape de construction
FROM oven/bun:latest AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lock ./

# Installer npm (Alpine Linux)
RUN apk add --no-cache nodejs npm

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN rm -rf ./dist && bunx tsc --noCheck

# Étape de production
FROM oven/bun:latest

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lock ./

# Installer les dépendances de production + prisma
RUN npm install --only=production && \
    npm install prisma@6

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Copier les fichiers Prisma
COPY --from=builder /app/prisma ./prisma

# Générer le client Prisma
RUN bunx prisma generate

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["bun", "run", "start:prod"]