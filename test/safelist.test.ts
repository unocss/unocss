import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'

describe('safelist', () => {
  test('basic', async() => {
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
