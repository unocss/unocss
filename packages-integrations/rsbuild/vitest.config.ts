import { defineProject } from 'vitest/config'
import { aliasDeprecated, aliasEngine, aliasPresets, aliasVirtual } from '../../alias'

export default defineProject({
  resolve: {
    alias: {
      ...aliasEngine,
      ...aliasPresets,
      ...aliasDeprecated,
      ...aliasVirtual,
    },
  },
  test: {
    name: 'rsbuild:unit',
    testTimeout: 30_000,
  },
})
