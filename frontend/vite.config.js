import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/my-1001-albums-app/',
  server: {
    proxy: {
      // Whenever the frontend asks for /api, forward it to your backend
      '/api': {
        target: 'http://localhost:8080', // <-- Replace with your backend's actual port
        changeOrigin: true,
      }
    }
  }
})