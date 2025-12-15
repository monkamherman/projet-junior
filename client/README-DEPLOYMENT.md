# Déploiement sur Render

## Configuration

### URLs de déploiement

- **API**: https://projet-junior-api.onrender.com
- **Client**: https://projet-junior-client.onrender.com

### Variables d'environnement

#### Développement (.env.development)

```
VITE_API_URL=http://localhost:10000
```

#### Production (.env.production)

```
VITE_API_URL=https://projet-junior-api.onrender.com
```

### Build et déploiement

1. **Build local pour test**:

   ```bash
   bun run build
   ```

2. **Déploiement automatique via Render**:
   - Le fichier `render.yaml` configure le déploiement
   - Build automatique avec Bun
   - Fichiers statiques servis depuis `dist/`

### Configuration Vite

- `base: './'` pour les chemins relatifs
- Support des routes SPA avec redirection vers `index.html`
- Optimisation pour la production

### Notes importantes

- Les assets sont optimisés et minifiés
- Le chunk principal est ~1.3MB (gzippé à ~400KB)
- Support du routing côté client
- Configuration CORS pour l'API distante
