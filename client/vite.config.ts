/// <reference types="vite/client" />
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite'; // ← Ajouter loadEnv
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 🔹 Charger les variables d'environnement selon le mode
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // 🔹 Récupérer VITE_API_URL avec fallback
  const apiUrl =
    process.env.VITE_API_URL ||
    env.VITE_API_URL ||
    'https://api.rageai.digital';

  console.log('🔧 Vite config - API URL:', apiUrl, '(mode:', mode + ')');
  console.log('🔧 process.env.VITE_API_URL:', process.env.VITE_API_URL);
  console.log('🔧 env.VITE_API_URL:', env.VITE_API_URL);

  return {
    plugins: [react(), tsconfigPaths()],
    base: './',

    // 🔹 Injecter la variable dans le bundle via define
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },

    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: 'process', replacement: 'process/browser' },
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'zlib', replacement: 'browserify-zlib' },
        { find: 'util', replacement: 'util' },
      ],
    },

    server: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.PORT) || 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      rollupOptions: {
        input: './index.html',
      },
    },

    preview: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.PORT) || 4000,
    },

    css: {
      postcss: './postcss.config.js',
    },
  };
});
