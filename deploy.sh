#!/bin/bash

# ===========================================
# Script de déploiement - Clone + Docker Compose
# Utilisé avec Nginx Proxy Manager sur le VPS
# Usage: ./deploy.sh
# ===========================================

set -e

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

echo "=========================================="
echo "Déploiement Projet Junior"
echo "=========================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker doit être installé"
    exit 1
fi

if ! docker compose version &> /dev/null 2>&1; then
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose doit être installé"
        exit 1
    fi
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Vérifier/créer le fichier .env
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        echo "📋 Création du .env à partir de .env.example..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo "⚠️  Configurez le fichier .env avant de redéployer"
    else
        echo "❌ Le fichier .env n'existe pas"
        echo "Créez-le avec les variables suivantes:"
        echo "  MONGO_INITDB_ROOT_USERNAME=..."
        echo "  MONGO_INITDB_ROOT_PASSWORD=..."
        echo "  MONGO_INITDB_DATABASE=..."
        echo "  JWT_SECRET=..."
        echo "  CLIENT_URL=https://votre-domaine.com"
        exit 1
    fi
fi

# Construire et démarrer les conteneurs
echo "🔨 Construction des images..."
$COMPOSE_CMD build

echo "🛑 Arrêt des anciens conteneurs..."
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true

echo "🚀 Démarrage des conteneurs..."
$COMPOSE_CMD up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérification de l'état
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "Services exposés (pour Nginx Proxy Manager):"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3002"
echo ""
$COMPOSE_CMD ps
