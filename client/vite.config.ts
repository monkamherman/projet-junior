/// <reference types="vite/client" />
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  // ✅ NOUVEAU : Configuration pour le déploiement
  base: './',

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: 'process', replacement: 'process/browser' },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'zlib', replacement: 'browserify-zlib' },
      { find: 'util', replacement: 'util' },
    ],
  },

  // ✅ NOUVEAU : Configuration build pour SPA
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
    },
  },

  server: {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 4000,
  },

  css: {
    postcss: './postcss.config.js',
  },
});
