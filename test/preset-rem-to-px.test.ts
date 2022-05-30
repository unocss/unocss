import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetMini from '@unocss/preset-mini'

describe('rem-to-px', () => {
  const uno = createGenerator({
    presets: [
      presetMini(),
      presetRemToPx(),
    ],
  })

  test('should works', async () => {
    expect((await uno.generate(
      new Set(['m4', 'mx2', '-p2', 'gap2']),
      { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .-p2{padding:-8px;}
        .m4{margin:16px;}
        .mx2{margin-left:8px;margin-right:8px;}
        .gap2{grid-gap:8px;gap:8px;}"
      `)
  })
})
