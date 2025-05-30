import type { LegacyCompatOptions } from '@unocss/preset-legacy-compat'
import { createGenerator } from '@unocss/core'
import presetLegacyCompat from '@unocss/preset-legacy-compat'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'

function generateUno(options: LegacyCompatOptions = {}) {
  return createGenerator({
    presets: [
      presetWind3(),
      presetLegacyCompat(options),
    ],
  })
}

describe('preset-legacy-compat', () => {
  it('with commaStyleColorFunction', async () => {
    const uno = await generateUno({
      commaStyleColorFunction: true,
      legacyColorSpace: true,
    })

    const { css } = await uno.generate([
      'bg-[rgba(255,255,255,0.1)]',
      'text-red',
      'bg-gradient-to-b',
    ].join(' '), { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .bg-\\[rgba\\(255\\,255\\,255\\,0\\.1\\)\\]{--un-bg-opacity:0.1;background-color:rgba(255, 255, 255, var(--un-bg-opacity));}
      .bg-gradient-to-b{--un-gradient-shape:to bottom;--un-gradient:var(--un-gradient-shape), var(--un-gradient-stops);background-image:linear-gradient(var(--un-gradient));}
      .text-red{--un-text-opacity:1;color:rgba(248, 113, 113, var(--un-text-opacity));}"
    `)
  })
})
