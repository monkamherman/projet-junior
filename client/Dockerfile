# Étape de construction
FROM oven/bun:latest as builder
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json bun.lock ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN bun run build

# Étape de production
FROM nginx:stable-alpine

# Copier la configuration Nginx
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape de construction
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
