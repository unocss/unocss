import { createGenerator } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import presetMini from '@unocss/preset-mini'
import { describe, expect, test } from 'vitest'

describe('config', () => {
  test('override theme', async () => {
    const unocss = createGenerator({
      theme: {
      },
      presets: [
        presetMini(),
      ],
    })
    expect(unocss.config.theme).toEqual({})
    const { css } = await unocss.generate('text-red text-blue')
    expect(css).toMatchInlineSnapshot('""')
  })

  test('extend theme', async () => {
    const unocss = createGenerator<Theme
    >({
      extendTheme: (theme) => {
        theme.colors!.antfu = {
          100: 'red',
        }
        return {
          colors: {
            antfu: {
              200: 'blue',
            },
          },
        }
      },
      presets: [
        presetMini(),
      ],
    })
    const { css } = await unocss.generate('text-antfu-100 text-antfu-200')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: preflights */
      *,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}
      /* layer: default */
      .text-antfu-100{color:red;}
      .text-antfu-200{color:blue;}"
    `)
  })
})
