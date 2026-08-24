import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import presetWebFonts from '@unocss/preset-web-fonts'
import { describe, expect, it } from 'vitest'

describe('layers', () => {
  it('applies async CSS loaders before exposing synchronous layer getters', async () => {
    const uno = await createGenerator({
      rules: [
        ['a', { color: 'red' }, { layer: 'a' }],
        ['b', { color: 'blue' }, { layer: 'b' }],
      ],
      loaders: [
        {
          name: 'second',
          order: 2,
          load: async css => `${css}\n/* second */`,
        },
        {
          name: 'first',
          order: 1,
          load: async css => `${css}\n/* first */`,
        },
      ],
      presets: [],
    })

    const result = await uno.generate('a b', { preflights: false })

    expect(result.getLayer('a')).toContain('.a{color:red;}\n/* first */\n/* second */')
    expect(result.getLayer('b')).toContain('.b{color:blue;}\n/* first */\n/* second */')
    expect(result.getLayers()).toBe(result.css)

    await result.setLayer('a', async (css) => {
      expect(css).not.toContain('/* first */')
      expect(css).not.toContain('/* second */')
      return css.replace('red', 'green')
    })

    expect(result.getLayer('a')).toContain('.a{color:green;}\n/* first */\n/* second */')
    expect(result.getLayer('a')?.match(/\/\* first \*\//g)).toHaveLength(1)
    expect(result.getLayers()).toBe(result.css)
  })

  it('static', async () => {
    const uno = await createGenerator({
      rules: [
        ['a', { name: 'bar1' }, { layer: 'a' }],
        ['b', { name: 'bar2' }, { layer: 'b' }],
        [/^c(\d+)$/, ([, d]) => ({ name: d }), { layer: 'c' }],
        [/^d(\d+)$/, ([, d]) => `/* RAW ${d} */`, { layer: 'd' }],
      ],
      shortcuts: [
        ['abcd', 'a b c2 d3', { layer: 's' }],
        ['abc', 'a b c4'],
      ],
      presets: [],
    })
    const { css } = await uno.generate('a b abc abcd d4 c5', { preflights: false })
    expect(css).toMatchSnapshot()
  })

  it('@import layer', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
        presetWebFonts({
          provider: 'google',
          fonts: {
            mono: ['Fira Code', 'Fira Mono:400,700'],
          },
          inlineImports: false,
        }),
      ],
    })
    const { css } = await uno.generate('font-mono', { preflights: true })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: imports */
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code&family=Fira+Mono:wght@400;700&display=swap');
      /* layer: preflights */
      *,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / 0.5);}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / 0.5);}
      /* layer: default */
      .font-mono{font-family:"Fira Code","Fira Mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}"
    `)
  })
})
