import { createGenerator } from '@unocss/core'
import presetLegacyCompat, { type LegacyCompatOptions } from '@unocss/preset-legacy-compat'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

function generateUno(options: LegacyCompatOptions = {}) {
  return createGenerator({
    presets: [
      presetUno(),
      presetLegacyCompat(options),
    ],
  })
}

describe('preset-legacy-compat', () => {
  it('with commaStyleColorFunction', async () => {
    const uno = generateUno({
      commaStyleColorFunction: true,
    })

    const { css } = await uno.generate([
      'bg-[rgba(255,255,255,0.1)]',
      'text-red',
    ].join(' '), { preflights: false })

    await expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .bg-\\[rgba\\(255\\,255\\,255\\,0\\.1\\)\\]{--un-bg-opacity:0.1;background-color:rgba(255, 255, 255, var(--un-bg-opacity));}
      .text-red{--un-text-opacity:1;color:rgba(248, 113, 113, var(--un-text-opacity));}"
    `)
  })
})
