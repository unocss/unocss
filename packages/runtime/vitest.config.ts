import { defineConfig } from 'vitest/config'
import { alias } from '../../alias'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  resolve: {
    alias,
  },
  test: {
    testTimeout: 30_000,
    name: 'runtime:dom',
    globals: true,
    environment: 'jsdom',
    include: ['test-dom/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
})
