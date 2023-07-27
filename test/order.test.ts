import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import { variantMatcher } from '@unocss/preset-mini/utils'
import presetMini from '@unocss/preset-mini'
import presetWebFonts from '@unocss/preset-web-fonts'

describe('order', () => {
  test('static', async () => {
    const uno = createGenerator({
      rules: [
        ['foo', { name: 'bar1' }],
        ['foo', { name: 'bar2' }],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  test('dynamic', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo$/, () => ({ name: 'bar1' })],
        [/^foo$/, () => ({ name: 'bar2' })],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  test('variant ordering', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => ({ prefix: `${input.prefix}.light $$ ` })),
        variantMatcher('group', input => ({ prefix: `${input.prefix}.group ` })),
        (v, ctx) => {
          const match = variantMatcher('dark', input => ({ prefix: `${input.prefix}.dark $$ ` })).match(v, ctx)
          if (typeof match === 'object') {
            return {
              ...match,
              order: 1,
            }
          }
        },
      ],
    })
    const code = [
      'light:group:foo-1',
      'group:light:foo-2',
      'dark:group:foo-3',
      'group:dark:foo-4',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('variant ordering reversed', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => ({ prefix: `.light $$ ${input.prefix}` })),
        variantMatcher('group', input => ({ prefix: `.group ${input.prefix}` })),
        (v, ctx) => {
          const match = variantMatcher('dark', input => ({ prefix: `.dark $$ ${input.prefix}` })).match(v, ctx)
          if (typeof match === 'object') {
            return {
              ...match,
              order: 1,
            }
          }
        },
      ],
    })
    const code = [
      'light:group:foo-1',
      'group:light:foo-2',
      'dark:group:foo-3',
      'group:dark:foo-4',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('multiple variant sorting', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:group-hover:group-focus-within:bg-blue-600',
      'group-hover:group-focus-within:dark:bg-red-600',
      'parent-hover:light:parent-focus-within:bg-green-600',
      'parent-hover:light:group-focus-within:bg-yellow-600',
    ].join(' '), { preflights: false })

    expect(css).toMatchSnapshot()
  })

  test('pseudo-elements sorting', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:hover:file:marker:bg-red-600',
      'dark:file:marker:hover:bg-red-600',
    ].join(' '), { preflights: false })

    expect(css).toMatchSnapshot()
  })

  test('variant sorting', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ foo: m })],
      ],
      presets: [],
      variants: [
        (input: string) => {
          const m = input.match(/^(\w+):/)
          if (m) {
            return {
              matcher: input.slice(m[0].length),
              selector: s => `${m[1]} ${s}`,
              sort: {
                pre: -1,
                post: 1,
              }[m[1]],
            }
          }
        },
      ],
    })
    const code = [
      'any:foo-1',
      'post:foo-1',
      'pre:foo-1',
      'zzz:foo-1',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('fully controlled rules merged and sorted by body', async () => {
    const uno = createGenerator({
      rules: [
        ['uno', { '--var': 'uno' }],
        [/^foo-(.+)$/, ([, match]) => {
          return `/* sort: ${match} */ .foo{--foo:0}`
        }],
        [/^bar-(.+)$/, ([, match]) => {
          return [
            `/* sort: ${match} */ .foo{--foo:0}`,
            { '--bar': match },
          ]
        }],
        ['css', { '--var': 'css' }],
      ],
      presets: [],
    })
    const code = 'foo-uno uno css bar-uno bar-css foo-css'
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('generated css @import sorting', async () => {
    const uno = createGenerator({
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
      preflights: [{
        layer: 'testImports',
        getCSS: () => `
@import url('https://test.import.com/normalize.css');
@import url('fineprint.css') print;
.a {
  color: red;
}
@import url('bluish.css') projection, tv;
.b {
  color: blue;
}
@import 'custom.css';
.c {
  color: green;
}
@import url('chrome://communicator/skin/');
.d {
  color: yellow;
}
@import 'common.css' screen, projection;
.e {
  color: purple;
}
@import url('landscape.css') screen and (orientation: landscape);
.f {
  color: orange;
}
`,
      }],
    })
    const { css } = await uno.generate('font-mono', { preflights: true })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: @imports */
      @import url('https://test.import.com/normalize.css');
      @import url('fineprint.css') print;
      @import url('bluish.css') projection, tv;
      @import 'custom.css';
      @import url('chrome://communicator/skin/');
      @import 'common.css' screen, projection;
      @import url('landscape.css') screen and (orientation: landscape);
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code&family=Fira+Mono:wght@400;700&display=swap');
      /* layer: preflights */
      *,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}
      /* layer: default */
      .font-mono{font-family:\\"Fira Code\\",\\"Fira Mono\\",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\\"Liberation Mono\\",\\"Courier New\\",monospace;}
      /* layer: testImports */
      .a {
      color: red;
      }
      .b {
      color: blue;
      }
      .c {
      color: green;
      }
      .d {
      color: yellow;
      }
      .e {
      color: purple;
      }
      .f {
      color: orange;
      }
      "
    `)
  })
})
