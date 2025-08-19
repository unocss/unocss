import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { describe, expect, it } from 'vitest'
import { presetWind4Targets } from './assets/preset-wind4-targets'

describe('preset-wind4', () => {
  it('targets', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
    })

    const targets = presetWind4Targets
    const code = targets.join(' ')
    const { css } = await uno.generate(code)

    const unmatched = []
    for (const i of targets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }

    await expect(`${css}\n`).toMatchFileSnapshot('./assets/output/preset-wind4-targets.css')

    // The following is a list of safe differences, the expected behavior of `preset-wind4` is inconsistent with `preset-wind3`.
    expect(unmatched).toMatchInlineSnapshot(`
      [
        "outline-size-none",
        "outline-color-red-1",
        "outline-blue-2",
        "border-size-none",
        "border-red2",
        "color-blue-gray",
        "color-blue-gray-400",
        "color-bluegray",
        "color-bluegray-400",
        "color-blue-gray-400/10",
        "color-blue-gray/10",
        "color-bluegray-400/10",
        "color-bluegray/10",
        "text-red2",
        "text-[color:--variable]",
        "text-[color:var(--color)]",
        "text-[color:var(--color-x)]:[trick]",
        "ring-red2",
        "ring-red2/5",
        "ring-width-px",
        "ring-size-px",
        "ring-offset-red2",
        "ring-offset-red2/5",
        "decoration-size-none",
        "decoration-offset-none",
        "basis-none",
        "gap-none",
        "inset-none",
        "ring-none",
        "ring-offset-none",
        "ring-offset-green5",
        "shadow-inset",
        "p-ie-none",
        "m-inline-none",
        "pxy",
        "p-xy",
        "p-is",
        "mxy",
        "m-xy",
        "-m-md",
        "m--md",
        "m-md",
        "stroke-size-none",
        "stroke-offset-none",
        "preserve-3d",
        "preserve-flat",
        "indent-1/2",
        "indent-lg",
        "-mt-safe",
        "-!mb-safe",
        "!-ms-safe",
        "placeholder-color-red-1",
        "hover:not-first:checked:bg-true-gray/10",
        "hover:is-first:checked:bg-true-gray/10",
        "group-aria-focus:p-4",
        "parent-aria-hover:text-center",
        "group-aria-hover:font-10",
        "group-aria-hover/label:font-15",
        "@container-inline-size",
        "@container/label-inline-size",
        "@container-size",
        "@container/label-size",
        "divide-block-4",
        "divide-inline-4",
        "divide-inline-reverse",
        "divide-x-none",
        "divide-inline-none",
        "line-clamp-unset",
        "scroll-m-none",
        "scroll-p-inline-none",
        "space-y-none",
        "space-inline-2",
        "space-block-4",
        "space-block-none",
        "space-inline-reverse",
        "space-inline-$space",
        "border-spacing-none",
        "divide-inline-$variable",
        "uno-layer-_pre:contrast-less:bg-gray-3",
        "-space-x-4",
        "data-dropdown:ring-green",
        "mask-tb",
      ]
    `)
  })

  it('wind4 reset style', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4(),
      ],
    })

    const { css } = await uno.generate('')
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-reset.css')
  })

  it('fully theme prefight', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          preflights: {
            theme: true,
            reset: false,
          },
        }),
      ],
    })

    const { css } = await uno.generate('')
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-theme.css')
  })

  it('custom theme values with variable', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({ preflights: { reset: false } }),
      ],
      theme: {
        colors: {
          foo: 'var(--colors-bar)',
          bar: 'var(--colors-baz-bcd, #000)',
          baz: {
            bcd: 'var(--colors-test, #fff)',
          },
          test: '#fff',
        },
      },
    })

    const { css } = await uno.generate('c-foo')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--un-text-opacity:100%;}}
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: theme */
      :root, :host {
      --colors-foo: var(--colors-bar);
      --colors-bar: var(--colors-baz-bcd, #000);
      --colors-baz-bcd: var(--colors-test, #fff);
      --colors-test: #fff;
      }
      /* layer: default */
      .c-foo{color:color-mix(in srgb, var(--colors-foo) var(--un-text-opacity), transparent) /* var(--colors-bar) */;}
      @supports (color: color-mix(in lab, red, red)){
      .c-foo{color:color-mix(in oklab, var(--colors-foo) var(--un-text-opacity), transparent) /* var(--colors-bar) */;}
      }"
    `)
  })

  it('custom theme vars', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          preflights: {
            reset: false,
            theme: {
              process: [
                (entry) => {
                  const [key] = entry
                  if (key.includes('colors')) {
                    entry[0] = key.replace('colors', 'ui')
                  }
                },
                createRemToPxProcessor(),
              ],
            },
          },
        }),
      ],
    })

    const { getLayer } = await uno.generate('c-red mr-4')
    const css = getLayer('theme')

    expect(css).toMatchInlineSnapshot(`
      "/* layer: theme */
      :root, :host {
      --spacing: 4px;
      --ui-red-DEFAULT: oklch(70.4% 0.191 22.216);
      }"
    `)
  })

  it('unit resolve rem to px', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          preflights: {
            reset: false,
            theme: {
              process: createRemToPxProcessor(),
            },
          },
        }),
      ],
      postprocess: [createRemToPxProcessor()],
    })
    const { css } = await uno.generate('p-4 m-5rem')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: theme */
      :root, :host {
      --spacing: 4px;
      }
      /* layer: default */
      .m-5rem{margin:80px;}
      .p-4{padding:calc(var(--spacing) * 4);}"
    `)
  })

  it('smarter theme parser', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
      theme: {
        colors: {
          'foo-bar': '#fff', // highest priority
          'foo': {
            '100': {
              bar: '#000',
            },
            'bar': '#0f0',
            'baz-qux': '#f00',
            'primary-1': {
              DEFAULT: 'red',
            },
            'primary-2': 'red',
            'primary-3': {
              'kebab-value': 'red',
            },
            'primary': {
              veryCool: {
                'kebab-value': {
                  test: 'red',
                },
              },
            },
          },
          'baz1': {
            DEFAULT: '#000',
            qux1: '#fff',
          },
          'qux': {
            2: '#000',
          },
          'quxx_1': '#000',
          'a2b': '#000',
        },
      },
    })

    const templates = [
      'text-foo-bar',
      'text-foo-100-bar',
      'text-foo-baz-qux',
      'text-foo-primary-1',
      'text-foo-primary-2',
      'text-foo-primary-3-kebab-value',
      'text-foo-primary-veryCool-kebab-value-test',
      'text-red',
      'text-baz1',
      'text-baz1-qux1',
      'text-qux2',
      'text-quxx_1',
      'text-a2b',
    ]

    const { css } = await uno.generate(templates)
    expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--un-text-opacity:100%;}}
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: theme */
      :root, :host {
      --colors-foo-bar: #fff;
      --colors-foo-100-bar: #000;
      --colors-foo-baz-qux: #f00;
      --colors-foo-primary-1-DEFAULT: red;
      --colors-foo-primary-2: red;
      --colors-foo-primary-3-kebab-value: red;
      --colors-foo-primary-veryCool-kebab-value-test: red;
      --colors-red-DEFAULT: oklch(70.4% 0.191 22.216);
      --colors-baz1-DEFAULT: #000;
      --colors-baz1-qux1: #fff;
      --colors-qux-2: #000;
      --colors-quxx_1: #000;
      --colors-a2b: #000;
      }
      /* layer: default */
      .text-a2b{color:color-mix(in srgb, var(--colors-a2b) var(--un-text-opacity), transparent) /* #000 */;}
      .text-baz1{color:color-mix(in srgb, var(--colors-baz1-DEFAULT) var(--un-text-opacity), transparent) /* #000 */;}
      .text-baz1-qux1{color:color-mix(in srgb, var(--colors-baz1-qux1) var(--un-text-opacity), transparent) /* #fff */;}
      .text-foo-100-bar{color:color-mix(in srgb, var(--colors-foo-100-bar) var(--un-text-opacity), transparent) /* #000 */;}
      .text-foo-bar{color:color-mix(in srgb, var(--colors-foo-bar) var(--un-text-opacity), transparent) /* #fff */;}
      .text-foo-baz-qux{color:color-mix(in srgb, var(--colors-foo-baz-qux) var(--un-text-opacity), transparent) /* #f00 */;}
      .text-foo-primary-1{color:color-mix(in srgb, var(--colors-foo-primary-1-DEFAULT) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-2{color:color-mix(in srgb, var(--colors-foo-primary-2) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-3-kebab-value{color:color-mix(in srgb, var(--colors-foo-primary-3-kebab-value) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-veryCool-kebab-value-test{color:color-mix(in srgb, var(--colors-foo-primary-veryCool-kebab-value-test) var(--un-text-opacity), transparent) /* red */;}
      .text-qux2{color:color-mix(in srgb, var(--colors-qux-2) var(--un-text-opacity), transparent) /* #000 */;}
      .text-quxx_1{color:color-mix(in srgb, var(--colors-quxx_1) var(--un-text-opacity), transparent) /* #000 */;}
      .text-red{color:color-mix(in srgb, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent) /* oklch(70.4% 0.191 22.216) */;}
      @supports (color: color-mix(in lab, red, red)){
      .text-a2b{color:color-mix(in oklab, var(--colors-a2b) var(--un-text-opacity), transparent) /* #000 */;}
      .text-baz1{color:color-mix(in oklab, var(--colors-baz1-DEFAULT) var(--un-text-opacity), transparent) /* #000 */;}
      .text-baz1-qux1{color:color-mix(in oklab, var(--colors-baz1-qux1) var(--un-text-opacity), transparent) /* #fff */;}
      .text-foo-100-bar{color:color-mix(in oklab, var(--colors-foo-100-bar) var(--un-text-opacity), transparent) /* #000 */;}
      .text-foo-bar{color:color-mix(in oklab, var(--colors-foo-bar) var(--un-text-opacity), transparent) /* #fff */;}
      .text-foo-baz-qux{color:color-mix(in oklab, var(--colors-foo-baz-qux) var(--un-text-opacity), transparent) /* #f00 */;}
      .text-foo-primary-1{color:color-mix(in oklab, var(--colors-foo-primary-1-DEFAULT) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-2{color:color-mix(in oklab, var(--colors-foo-primary-2) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-3-kebab-value{color:color-mix(in oklab, var(--colors-foo-primary-3-kebab-value) var(--un-text-opacity), transparent) /* red */;}
      .text-foo-primary-veryCool-kebab-value-test{color:color-mix(in oklab, var(--colors-foo-primary-veryCool-kebab-value-test) var(--un-text-opacity), transparent) /* red */;}
      .text-qux2{color:color-mix(in oklab, var(--colors-qux-2) var(--un-text-opacity), transparent) /* #000 */;}
      .text-quxx_1{color:color-mix(in oklab, var(--colors-quxx_1) var(--un-text-opacity), transparent) /* #000 */;}
      .text-red{color:color-mix(in oklab, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent) /* oklch(70.4% 0.191 22.216) */;}
      }"
    `)
  })

  it('theme safelist', async () => {
    const uno = await createGenerator<object>({
      envMode: 'dev',
      theme: {
        custom: {
          foo: 'var(--custom-bar)',
          bar: 'var(--custom-baz-DEFAULT, inherit)',
          baz: {
            DEFAULT: 'inherit',
          },
        },
      },
      presets: [
        presetWind4({
          preflights: {
            reset: false,
          },
        }),
      ],
      safelist: [
        'spacing',
        'colors:red-100',
        'breakpoint:sm',
        ({ theme }) => {
          if ('custom' in theme) {
            return [
              'custom:foo',
            ]
          }
          return []
        },
      ],
    })

    const { getLayer } = await uno.generate('')
    const css = getLayer('theme')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: theme */
      :root, :host {
      --spacing: 0.25rem;
      --colors-red-100: oklch(93.6% 0.032 17.717);
      --breakpoint-sm: 40rem;
      --custom-foo: var(--custom-bar);
      --custom-bar: var(--custom-baz-DEFAULT, inherit);
      --custom-baz-DEFAULT: inherit;
      }"
    `)
  })

  it('nested pseudo selectors', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
    })

    const { css } = await uno.generate([
      'peer-data-[variant=inset]:peer-data-[state=collapsed]:b-1',
      'peer-aria-checked:has-aria-[level=3]:b-2',
      'has-aria-[hidden=false]:in-data-[state=collapsed]:b-3',
      'md:has-aria-[hidden=false]:peer-data-[dialog=open]:group-data-[vv=w]/accordion:b-4',
    ])

    const prettified = prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })

    expect(prettified).toMatchInlineSnapshot(`
      "/* layer: default */
      .has-aria-\\[hidden\\=false\\]\\:in-data-\\[state\\=collapsed\\]\\:b-3 {
        :where(*[data-state="collapsed"]) & {
          &:has(*[aria-hidden="false"]) {
            border-width: 3px;
          }
        }
      }
      .peer-aria-checked\\:has-aria-\\[level\\=3\\]\\:b-2 {
        &:has(*[aria-level="3"]) {
          &:is(:where(.peer)[aria-checked="true"] ~ *) {
            border-width: 2px;
          }
        }
      }
      .peer-data-\\[variant\\=inset\\]\\:peer-data-\\[state\\=collapsed\\]\\:b-1 {
        &:is(:where(.peer)[data-state="collapsed"] ~ *) {
          &:is(:where(.peer)[data-variant="inset"] ~ *) {
            border-width: 1px;
          }
        }
      }
      .md\\:has-aria-\\[hidden\\=false\\]\\:peer-data-\\[dialog\\=open\\]\\:group-data-\\[vv\\=w\\]\\/accordion\\:b-4 {
        &:is(:where(.group\\/accordion)[data-vv="w"] *) {
          &:is(:where(.peer)[data-dialog="open"] ~ *) {
            @media (min-width: 48rem) {
              &:has(*[aria-hidden="false"]) {
                border-width: 4px;
              }
            }
          }
        }
      }
      "
    `)
  })
})

describe('important', () => {
  it(`should add " !important" at the end when "true" unless it's already marked important`, async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          important: true,
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'important:scale-100',
      'dark:bg-blue',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-important-true.css')
  })

  it(`should prefix selector with provided important string and wrap the original selector in ":is()"`, async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          important: '#app',
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'important:scale-100',
      'dark:bg-blue',
      'after:m-4',
      'selection:bg-yellow',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-important-string.css')
  })

  it('shadow with opacity', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4(),
      ],
    })

    const { css } = await uno.generate([
      'shadow',
      'shadow/50',
      'shadow-sm',
      'shadow-sm/50',
      'shadow-red-300',
      'shadow-red-300/30',
    ].join(' '), { preflights: false })

    await expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @property --un-inset-ring-color{syntax:"*";inherits:false;}
      @property --un-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}
      @property --un-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}
      @property --un-inset-shadow-color{syntax:"*";inherits:false;}
      @property --un-ring-color{syntax:"*";inherits:false;}
      @property --un-ring-inset{syntax:"*";inherits:false;}
      @property --un-ring-offset-color{syntax:"*";inherits:false;}
      @property --un-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}
      @property --un-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0px;}
      @property --un-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}
      @property --un-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}
      @property --un-shadow-color{syntax:"*";inherits:false;}
      @property --un-shadow-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: default */
      .shadow,
      .shadow-sm{--un-shadow:0 1px 3px 0 var(--un-shadow-color, rgb(0 0 0 / 0.1)),0 1px 2px -1px var(--un-shadow-color, rgb(0 0 0 / 0.1));box-shadow:var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}
      .shadow-red-300{--un-shadow-color:color-mix(in srgb, var(--colors-red-300) var(--un-shadow-opacity), transparent);}
      .shadow-red-300\\/30{--un-shadow-color:color-mix(in srgb, var(--colors-red-300) 30%, transparent);}
      .shadow-sm\\/50,
      .shadow\\/50{--un-shadow-opacity:50%;--un-shadow:0 1px 3px 0 var(--un-shadow-color, oklab(from rgb(0 0 0 / 0.1) l a b / 50%)),0 1px 2px -1px var(--un-shadow-color, oklab(from rgb(0 0 0 / 0.1) l a b / 50%));box-shadow:var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}
      @supports (color: color-mix(in lab, red, red)){
      .shadow-red-300{--un-shadow-color:color-mix(in oklab, var(--colors-red-300) var(--un-shadow-opacity), transparent);}
      .shadow-red-300\\/30{--un-shadow-color:color-mix(in oklab, color-mix(in oklab, var(--colors-red-300) 30%, transparent) var(--un-shadow-opacity), transparent);}
      }"
    `)
  })

  it('text-shadow with opacity', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4(),
      ],
    })

    const { css } = await uno.generate([
      'text-shadow-sm',
      'text-shadow-sm/50',
      'text-shadow-red-300',
      'text-shadow-red-300/30',
    ].join(' '), { preflights: false })

    await expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @property --un-text-shadow-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: default */
      .text-shadow-red-300{--un-text-shadow-color:color-mix(in srgb, var(--colors-red-300) var(--un-text-shadow-opacity), transparent);}
      .text-shadow-red-300\\/30{--un-text-shadow-color:color-mix(in srgb, var(--colors-red-300) 30%, transparent);}
      .text-shadow-sm{--un-text-shadow:0 1px 0 var(--un-text-shadow-color, rgb(0 0 0 / 0.075)),0 1px 1px var(--un-text-shadow-color, rgb(0 0 0 / 0.075)),0 2px 2px var(--un-text-shadow-color, rgb(0 0 0 / 0.075));text-shadow:var(--un-text-shadow);}
      .text-shadow-sm\\/50{--un-text-shadow-opacity:50%;--un-text-shadow:0 1px 0 var(--un-text-shadow-color, oklab(from rgb(0 0 0 / 0.075) l a b / 50%)),0 1px 1px var(--un-text-shadow-color, oklab(from rgb(0 0 0 / 0.075) l a b / 50%)),0 2px 2px var(--un-text-shadow-color, oklab(from rgb(0 0 0 / 0.075) l a b / 50%));text-shadow:var(--un-text-shadow);}
      @supports (color: color-mix(in lab, red, red)){
      .text-shadow-red-300{--un-text-shadow-color:color-mix(in oklab, var(--colors-red-300) var(--un-text-shadow-opacity), transparent);}
      .text-shadow-red-300\\/30{--un-text-shadow-color:color-mix(in oklab, color-mix(in oklab, var(--colors-red-300) 30%, transparent) var(--un-text-shadow-opacity), transparent);}
      }"
    `)
  })

  it('drop-shadow with opacity', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4(),
      ],
    })

    const { css } = await uno.generate([
      'drop-shadow',
      'drop-shadow/50',
      'drop-shadow-sm',
      'drop-shadow-sm/50',
      'drop-shadow-red-300',
      'drop-shadow-red-300/30',
    ].join(' '), { preflights: false })

    await expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @property --un-blur{syntax:"*";inherits:false;}
      @property --un-brightness{syntax:"*";inherits:false;}
      @property --un-contrast{syntax:"*";inherits:false;}
      @property --un-drop-shadow{syntax:"*";inherits:false;}
      @property --un-drop-shadow-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      @property --un-grayscale{syntax:"*";inherits:false;}
      @property --un-hue-rotate{syntax:"*";inherits:false;}
      @property --un-invert{syntax:"*";inherits:false;}
      @property --un-saturate{syntax:"*";inherits:false;}
      @property --un-sepia{syntax:"*";inherits:false;}
      /* layer: default */
      .drop-shadow{--un-drop-shadow:drop-shadow(0 1px 2px var(--un-drop-shadow-color, rgb(0 0 0 / 0.1))) drop-shadow(0 1px 1px var(--un-drop-shadow-color, rgb(0 0 0 / 0.06)));filter:var(--un-blur,) var(--un-brightness,) var(--un-contrast,) var(--un-grayscale,) var(--un-hue-rotate,) var(--un-invert,) var(--un-saturate,) var(--un-sepia,) var(--un-drop-shadow,);}
      .drop-shadow-red-300{--un-drop-shadow-color:color-mix(in srgb, var(--colors-red-300) var(--un-drop-shadow-opacity), transparent);}
      .drop-shadow-red-300\\/30{--un-drop-shadow-color:color-mix(in srgb, var(--colors-red-300) 30%, transparent);}
      .drop-shadow-sm{--un-drop-shadow:drop-shadow(0 1px 2px var(--un-drop-shadow-color, rgb(0 0 0 / 0.15)));filter:var(--un-blur,) var(--un-brightness,) var(--un-contrast,) var(--un-grayscale,) var(--un-hue-rotate,) var(--un-invert,) var(--un-saturate,) var(--un-sepia,) var(--un-drop-shadow,);}
      .drop-shadow-sm\\/50{--un-drop-shadow-opacity:50%;--un-drop-shadow:drop-shadow(0 1px 2px var(--un-drop-shadow-color, oklab(from rgb(0 0 0 / 0.15) l a b / 50%)));filter:var(--un-blur,) var(--un-brightness,) var(--un-contrast,) var(--un-grayscale,) var(--un-hue-rotate,) var(--un-invert,) var(--un-saturate,) var(--un-sepia,) var(--un-drop-shadow,);}
      .drop-shadow\\/50{--un-drop-shadow-opacity:50%;--un-drop-shadow:drop-shadow(0 1px 2px var(--un-drop-shadow-color, oklab(from rgb(0 0 0 / 0.1) l a b / 50%))) drop-shadow(0 1px 1px var(--un-drop-shadow-color, oklab(from rgb(0 0 0 / 0.06) l a b / 50%)));filter:var(--un-blur,) var(--un-brightness,) var(--un-contrast,) var(--un-grayscale,) var(--un-hue-rotate,) var(--un-invert,) var(--un-saturate,) var(--un-sepia,) var(--un-drop-shadow,);}
      @supports (color: color-mix(in lab, red, red)){
      .drop-shadow-red-300{--un-drop-shadow-color:color-mix(in oklab, var(--colors-red-300) var(--un-drop-shadow-opacity), transparent);}
      .drop-shadow-red-300\\/30{--un-drop-shadow-color:color-mix(in oklab, color-mix(in oklab, var(--colors-red-300) 30%, transparent) var(--un-drop-shadow-opacity), transparent);}
      }"
    `)
  })
})
