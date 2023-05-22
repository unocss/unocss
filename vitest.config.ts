import { defaultExclude, defineConfig } from 'vitest/config'
import { alias } from './alias'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {
    alias,
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    exclude: [...defaultExclude, '**/svelte-scoped/**'],
  },
})
