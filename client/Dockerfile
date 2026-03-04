# Étape de construction
FROM oven/bun:latest as builder
WORKDIR /app

# Arguments de build pour les variables d'environnement
ARG NODE_ENV=production
ARG VITE_API_URL=/api

# Variables d'environnement pour le build
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_URL=${VITE_API_URL}

# Copier les fichiers de configuration
COPY package.json bun.lock ./

# Installer npm (Alpine Linux)
RUN apk add --no-cache nodejs npm

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN bun run build

# Étape de production
FROM nginx:stable-alpine

# Copier la configuration Nginx interne au container
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape de construction
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80 (port interne du container)
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]