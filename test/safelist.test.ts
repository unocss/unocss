import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

describe('safelist', () => {
  it('basic', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      safelist: [
        'm1',
      ],
    })
    const { css } = await uno.generate('m2')
    expect(css).toContain('.m1')
    expect(css).toContain('.m2')
  })
})
