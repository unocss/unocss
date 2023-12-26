import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetMini from '@unocss/preset-mini'

describe('rem-to-px', () => {
  const uno = createGenerator({
    presets: [
      presetMini(),
      presetRemToPx(),
    ],
  })

  it('should works', async () => {
    expect((await uno.generate(
      new Set(['m4', 'mx2', '-p2', 'gap2']),
      { preflights: false },
    )).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .-p2{padding:-8px;}
        .m4{margin:16px;}
        .mx2{margin-left:8px;margin-right:8px;}
        .gap2{gap:8px;}"
      `)
  })

  it('important prefix should works', async () => {
    expect((await uno.generate(
      new Set(['!m4', '!mx2', '!-p2', '!gap2']),
      { preflights: false },
    )).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .\\!-p2{padding:-8px !important;}
        .\\!m4{margin:16px !important;}
        .\\!mx2{margin-left:8px !important;margin-right:8px !important;}
        .\\!gap2{gap:8px !important;}"
      `)
  })
})
