import { createGenerator, presetWind } from 'unocss'

describe('exclude', () => {
  test('basic', async() => {
    const uno = createGenerator({
      presets: [
        presetWind(),
      ],
    })
    const dos = createGenerator({
      warnExcluded: false,
      excluded: [
        'block',
        /^text-/,
      ],
      presets: [
        presetWind(),
      ],
    })
    const { css: css1 } = await uno.generate('block text-red-200 hover:block')
    const { css: css2 } = await dos.generate('block text-red-200 hover:block')
    expect(css1).toContain('.block')
    expect(css1).toContain('.text-red-200')
    expect(css2).toBe('')

    const { css: css3 } = await dos.generate('block text-red-200 hover:block')
    expect(css3).toBe('')
  })
})
