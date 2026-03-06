# Étape de construction
FROM node:18-alpine AS builder

WORKDIR /app

# Arguments de build pour les variables d'environnement
ARG VITE_API_URL=/api

# Variables d'environnement pour le build
ENV VITE_API_URL=${VITE_API_URL}

# Copier les fichiers de configuration
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

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