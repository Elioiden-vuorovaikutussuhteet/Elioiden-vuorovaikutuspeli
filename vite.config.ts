import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

//vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:4173",
        changeOrigin: true, 
      },
    },
  },
    test: {
    environment: 'jsdom',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})