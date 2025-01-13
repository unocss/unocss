import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetMini from '../src/index'

describe('on demand generate preflights', () => {
  it('default preflights', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: 'on-demand' }),
      ],
    })
    const { css: noPreflightCSS } = await uno.generate('text-red')
    expect(noPreflightCSS).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}"
    `)

    const { css: hasPreflightCSS } = await uno.generate('ring')
    expect(hasPreflightCSS).toMatchInlineSnapshot(`
      "/* layer: preflights */
      *,::before,::after{--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / 0.5);}::backdrop{--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / 0.5);}
      /* layer: default */
      .ring{--un-ring-width:3px;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color);--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color);box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}"
    `)
  })

  it('custom depends', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: 'on-demand' }),
      ],
      rules: [
        [
          'custom-rule',
          { blur: 'var(--un-shadow)' },
          // depend on `--shadow` from presetMini
          { custom: { preflightKeys: '--un-shadow' } },
        ],
      ],
    })
    const { css } = await uno.generate('custom-rule')

    expect(css).toMatchInlineSnapshot(`
      "/* layer: preflights */
      *,::before,::after{--un-shadow:0 0 rgb(0 0 0 / 0);}::backdrop{--un-shadow:0 0 rgb(0 0 0 / 0);}
      /* layer: default */
      .custom-rule{blur:var(--un-shadow);}"
    `)
  })
})
