import react from '@vitejs/plugin-react'
import { defineConfig, configDefaults} from 'vitest/config'

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
  //Remove all console calls from production (when using npm build)
  build: {
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
          },
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:3000",
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
    exclude: ['tests/playwright/**', ...configDefaults.exclude],
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