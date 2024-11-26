import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import presetRemToPx from '@unocss/preset-rem-to-px'
import { describe, expect, it } from 'vitest'

describe('rem-to-px', async () => {
  const uno = await createGenerator({
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
        .m4{margin:16px;}
        .mx2{margin-left:8px;margin-right:8px;}
        .gap2{gap:8px;}
        .-p2{padding:-8px;}"
      `)
  })

  it('important prefix should works', async () => {
    expect((await uno.generate(
      new Set(['!m4', '!mx2', '!-p2', '!gap2']),
      { preflights: false },
    )).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .\\!m4{margin:16px !important;}
        .\\!mx2{margin-left:8px !important;margin-right:8px !important;}
        .\\!gap2{gap:8px !important;}
        .\\!-p2{padding:-8px !important;}"
      `)
  })
})
