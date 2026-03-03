# Dockerfile pour le reverse proxy Nginx
FROM nginx:stable-alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf:ro

# Exposer les ports
EXPOSE 80 443

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
