import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'vitest.config.ts',
  'packages-engine/svelte-scoped/vitest.config.ts',
  'packages-presets/runtime/vitest.config.ts',
])
