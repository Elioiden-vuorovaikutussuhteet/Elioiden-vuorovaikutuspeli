import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

//vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:4173",
        changeOrigin: true, 
      }
    }
  }
})