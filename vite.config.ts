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
      // In local dev, forward /api/proxy/* directly to the FastAPI backend,
      // rewriting the path so the proxy prefix is stripped.
      // e.g. /api/proxy/health  →  http://localhost:8000/api/v1/health
      '/api/proxy': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/api/v1'),
      },
    },
  },
})
