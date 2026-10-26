import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

//vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleString('sv-SE', {
        timeZone: 'Europe/Helsinki',
      })
    ),
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:4173",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true
    }
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    silent: false, 
    reporters: ['verbose'],
    exclude: [
      'tests/playwright/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/game/data/**',
        'tests/playwright/**'
      ]
    },
  },
})