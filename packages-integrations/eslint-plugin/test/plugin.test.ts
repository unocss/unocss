import { describe, expect, it } from 'vitest'
import { version } from '../package.json'
import eslintPlugin from '../src'

describe('plugin meta', () => {
  // `meta.name` is the rule prefix in Oxlint, so changing it is a breaking change
  it('exposes name and version', () => {
    expect(eslintPlugin.meta).toEqual({ name: 'unocss', version })
  })

  it('is shared by the flat config', () => {
    expect(eslintPlugin.configs.flat.plugins.unocss.meta).toEqual(eslintPlugin.meta)
  })
})
