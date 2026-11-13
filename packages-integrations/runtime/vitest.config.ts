import { defineConfig } from 'vitest/config'
import { alias, aliasSource } from '../../alias.ts'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {
    alias: { ...aliasSource, ...alias },
  },
  test: {
    testTimeout: 30_000,
    name: 'runtime:dom',
    globals: true,
    environment: 'jsdom',
    include: ['test-dom/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./test/setup.ts'],
  },
})
