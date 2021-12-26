import { createGenerator } from '@unocss/core'
import presetGlyphs from '@unocss/preset-glyphs'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'

describe('preset-glyphs', () => {
  const fixture1 = `
<button class="g-rondure-uno hover:g-rondure-css">unocss</button>
`

  const uno = createGenerator({
    presets: [
      presetGlyphs({
        fonts: {
          rondure: './test/fonts/Rondure-Regular.ttf',
        },
      }),
      presetUno(),
    ],
  })

  test('fixture1', async() => {
    const { css, layers } = await uno.generate(fixture1)
    expect(layers).toEqual(['glyphs', 'default'])
    expect(css).toMatchSnapshot()
  })
})
