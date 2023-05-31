import { defaultExclude, defineProject } from 'vitest/config'

export default defineProject({
  test: {
    includeSource: ['src/**/*.ts'],
    exclude: [...defaultExclude, 'test/fixtures/**'],
  },
})
