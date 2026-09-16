import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE is set to "/thermal-sentinel/" by the GitHub Pages workflow; local dev uses "/".
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } },
  },
})
