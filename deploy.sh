#!/bin/bash

# ===========================================
# Script de déploiement pour le VPS
# Usage: ./deploy.sh [tag]
# ===========================================

set -e

# Configuration
REGISTRY="ghcr.io"
IMAGE_PREFIX="monkamherman/projet-junior"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Tag des images (défaut: latest)
IMAGE_TAG="${1:-latest}"

echo "=========================================="
echo "Déploiement de Centic - Tag: $IMAGE_TAG"
echo "=========================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker et Docker Compose doivent être installés"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Le fichier $ENV_FILE n'existe pas"
    echo "Créez-le avec les variables suivantes:"
    echo "  MONGO_INITDB_ROOT_USERNAME=..."
    echo "  MONGO_INITDB_ROOT_PASSWORD=..."
    echo "  MONGO_INITDB_DATABASE=..."
    echo "  JWT_SECRET=..."
    exit 1
fi

# Connexion à GHCR (si credentials disponibles)
if [ -n "$GHCR_USERNAME" ] && [ -n "$GHCR_TOKEN" ]; then
    echo "🔐 Connexion à GHCR..."
    echo "$GHCR_TOKEN" | docker login $REGISTRY -u "$GHCR_USERNAME" --password-stdin
fi

# Pull des nouvelles images
echo "📥 Téléchargement des images..."
export IMAGE_TAG
docker-compose -f $COMPOSE_FILE pull

# Arrêt des anciens conteneurs
echo "🛑 Arrêt des anciens conteneurs..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Démarrage des nouveaux conteneurs
echo "🚀 Démarrage des conteneurs..."
docker-compose -f $COMPOSE_FILE up -d

# Nettoyage des anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

# Vérification de l'état
echo ""
echo "✅ Déploiement terminé!"
echo ""
docker-compose -f $COMPOSE_FILE ps
