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

# L'image Bun inclut déjà les dépendances nécessaires

# Installer toutes les dépendances pour générer Prisma
COPY package.json bun.lock ./
RUN bun install

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Copier les fichiers statiques nécessaires
COPY --from=builder /app/prisma ./prisma

# Générer le client Prisma pendant le build
RUN ./node_modules/.bin/prisma generate

# Exposer le port (Render utilise le port 10000 par défaut)
EXPOSE 10000

# Variables d'environnement pour Render
ENV NODE_ENV=production
ENV PORT=10000

# Commande de démarrage
CMD ["bun", "run", "start:prod"]
