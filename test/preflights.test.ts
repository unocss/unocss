import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
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
    const cssArray = [presetMini, presetUno, presetWind].map(async (preset) => {
      const uno = createGenerator({
        presets: [preset({ preflight: false })],
      })
      const { css } = await uno.generate('')
      return css
    })
    expect(await Promise.all(cssArray)).toMatchInlineSnapshot(`
      [
        "",
        "",
        "",
      ]
    `)
  })
})
