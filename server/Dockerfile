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
RUN rm -rf ./dist && bunx tsc --noCheck

# Étape de production
FROM oven/bun:latest

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lock ./

# Installer uniquement les dépendances de production
RUN bun install --production

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Copier les fichiers Prisma
COPY --from=builder /app/prisma ./prisma

# Générer le client Prisma
RUN ./node_modules/.bin/prisma generate

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["bun", "run", "start:prod"]