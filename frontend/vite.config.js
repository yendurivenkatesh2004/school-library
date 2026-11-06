import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api calls to the Express backend, so no CORS fuss in development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
