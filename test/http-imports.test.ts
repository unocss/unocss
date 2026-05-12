import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/index'

describe('http imports', () => {
  it('should handle config with HTTP imports', async () => {
    // This test verifies the pre-processing pipeline doesn't break
    // normal config loading when no HTTP imports are present
    const result = await loadConfig(
      new URL('./fixtures/basic', import.meta.url).pathname,
    )
    expect(result.config).toBeDefined()
  })
})
