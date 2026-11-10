import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import markdown from '@eslint/markdown'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'tests']),

  // 1. TypeScript & React files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // 2. Markdown files
  ...markdown.configs.recommended,
  // 3. Code blocks inside Markdown
  {
    files: ['**/*.md/*.{ts,tsx,js}'],
    rules: {
      'no-console': 'off',
    },
  },
])