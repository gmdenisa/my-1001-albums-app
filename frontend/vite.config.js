// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/* gets forwarded to your backend silently —
      // no CORS preflight because the browser thinks it's same-origin.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
 