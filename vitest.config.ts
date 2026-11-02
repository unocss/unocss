import { defaultExclude, defineConfig } from 'vitest/config'
import { alias, aliasSource } from './alias.ts'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {
    alias: { ...aliasSource, ...alias },
  },
  test: {
    testTimeout: 30_000,
    name: 'unit',
    setupFiles: ['./test/setup.ts'],
    exclude: [...defaultExclude, '**/svelte-scoped/**', '**/test-dom/**'],
    projects: [
      'vitest.config.ts',
      'packages-integrations/svelte-scoped/vitest.config.ts',
      'packages-integrations/runtime/vitest.config.ts',
    ],
  },
})
