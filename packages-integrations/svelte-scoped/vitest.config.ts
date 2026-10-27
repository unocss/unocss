import { defaultExclude, defineProject } from 'vitest/config'
import { alias, aliasSource } from '../../alias.ts'

export default defineProject({
  resolve: {
    alias: { ...aliasSource, ...alias },
  },
  test: {
    name: 'svelte-scoped:unit',
    includeSource: ['src/**/*.ts'],
    exclude: [...defaultExclude, 'test/fixtures/**'],
  },
})
