import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/stat-cache': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      }
    }
  }
})
