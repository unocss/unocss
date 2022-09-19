import { createGenerator } from '@unocss/core'
import { presetMini } from '@unocss/preset-mini'
import presetUno from '@unocss/preset-uno'
import presetWind from '@unocss/preset-wind'
import { describe, expect, test } from 'vitest'

describe('preflights', () => {
  test('basic', async () => {
    const uno = createGenerator({
      preflights: [
        {
          getCSS() {
            return '.hello { text: red }'
          },
          layer: 'custom',
        },
        {
          getCSS() { return undefined },
          layer: 'void',
        },
        {
          getCSS() { return '.default-preflight {}' },
        },
      ],
      presets: [],
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })

  test('no preflights with preset', async () => {
    const unoMini = createGenerator({
      presets: [presetMini({ preflight: false })],
    })
    const unoWind = createGenerator({
      presets: [presetWind({ preflight: false })],
    })
    const unoUno = createGenerator({
      presets: [presetUno({ preflight: false })],
    })
    const { css: cssMini } = await unoMini.generate('')
    const { css: cssWind } = await unoWind.generate('')
    const { css: cssUno } = await unoUno.generate('')
    expect(cssMini).toMatchInlineSnapshot('""')
    expect(cssWind).toMatchInlineSnapshot('""')
    expect(cssUno).toMatchInlineSnapshot('""')
  })
})
