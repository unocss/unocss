import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'

describe('exclude', () => {
  test('basic', async() => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })
    const dos = createGenerator({
      warnExcluded: false,
      excluded: [
        'block',
        /^text-/,
      ],
      presets: [
        presetUno(),
      ],
    })
    const { css: css1 } = await uno.generate('block text-red-200 hover:block', { layerComments: false })
    const { css: css2 } = await dos.generate('block text-red-200 hover:block', { layerComments: false })
    expect(css1).toContain('.block')
    expect(css1).toContain('.text-red-200')
    expect(css2).toBe('')

    const { css: css3 } = await dos.generate('block text-red-200 hover:block', { layerComments: false })
    expect(css3).toBe('')
  })
})
