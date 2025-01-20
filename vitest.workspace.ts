import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'vitest.config.ts',
  'packages-integrations/svelte-scoped/vitest.config.ts',
  'packages-integrations/runtime/vitest.config.ts',
])
