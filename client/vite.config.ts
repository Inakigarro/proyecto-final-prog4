import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Permite importar con @/ en lugar de rutas relativas largas
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Redirige llamadas a /api al servidor Express para evitar CORS en desarrollo
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
