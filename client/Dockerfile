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

# Exposer le port 10000 (Render utilise ce port par défaut)
EXPOSE 10000

# Créer un script pour démarrer Nginx sur le port 10000
RUN echo 'daemon off;' > /etc/nginx/conf.d/daemon_off.conf && \
    sed -i 's/listen 80;/listen 10000;/g' /etc/nginx/conf.d/default.conf

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
