import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // In local dev: forward /api/* to the AWS FastAPI backend
      '/api': {
        target: 'http://3.27.150.43:8000',
        changeOrigin: true,
      },
    },
  },
})
