import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'vitest.config.ts',
  'packages/svelte-scoped/vitest.config.ts',
  'packages/runtime/vitest.config.ts',
])
