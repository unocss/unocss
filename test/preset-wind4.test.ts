import type { VariantHandler } from '@unocss/core'
import { createGenerator, escapeSelector, symbols } from '@unocss/core'
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

  it('blend mode global keywords', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({ preflights: { reset: false } }),
      ],
    })

    const { css } = await uno.generate('bg-blend-inherit bg-blend-unset mix-blend-revert mix-blend-unset', { preflights: false })

    expect(css).toContain('background-blend-mode:inherit')
    expect(css).toContain('background-blend-mode:unset')
    expect(css).toContain('mix-blend-mode:revert')
    expect(css).toContain('mix-blend-mode:unset')
  })

  it('scrollbar gutter utilities', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({ preflights: { reset: false } }),
      ],
    })

    const { css } = await uno.generate('scrollbar-gutter-auto scrollbar-gutter-stable scrollbar-gutter-both md:scrollbar-gutter-stable', { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .scrollbar-gutter-auto{scrollbar-gutter:auto;}
      .scrollbar-gutter-stable{scrollbar-gutter:stable;}
      .scrollbar-gutter-both{scrollbar-gutter:stable both-edges;}
      @media (min-width: 48rem){
      .md\\:scrollbar-gutter-stable{scrollbar-gutter:stable;}
      }"
    `)
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
          // foo: 'var(--colors-bar)',
          // bar: 'var(--colors-baz-bcd, #000)',
          // baz: {
          //   bcd: 'var(--colors-test, #fff)',
          // },
          // ^^^ don't do this

          // issue #4994: Chaining CSS variables within a theme is strongly discouraged,
          // as it can cause browsers to fail to resolve variables to the correct values promptly during evaluation (or recalculation).
          // Furthermore, Uno does not perform in-depth analysis of the source of these references.
          primary: `var(--custom-css-variable, #123456)`,
          secondary: `calc(var(--another-css-variable, 10%) + 5%)`,
        },
      },
    })

    const { css } = await uno.generate('c-primary c-primary/50 c-secondary')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--un-text-opacity:100%;}}
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: default */
      .c-primary{color:color-mix(in srgb, var(--custom-css-variable, #123456) var(--un-text-opacity), transparent) /* var(--custom-css-variable, #123456) */;}
      .c-primary\\/50{color:color-mix(in srgb, var(--custom-css-variable, #123456) 50%, transparent) /* var(--custom-css-variable, #123456) */;}
      .c-secondary{color:color-mix(in srgb, calc(var(--another-css-variable, 10%) + 5%) var(--un-text-opacity), transparent) /* calc(var(--another-css-variable, 10%) + 5%) */;}"
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

    const prettified = await prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })

    expect(prettified).toMatchInlineSnapshot(`
      "/* layer: default */
      .has-aria-\\[hidden\\=false\\]\\:in-data-\\[state\\=collapsed\\]\\:b-3 {
        &:has(*[aria-hidden="false"]) {
          :where(*[data-state="collapsed"]) & {
            border-width: 3px;
          }
        }
      }
      .peer-aria-checked\\:has-aria-\\[level\\=3\\]\\:b-2 {
        &:is(:where(.peer)[aria-checked="true"] ~ *) {
          &:has(*[aria-level="3"]) {
            border-width: 2px;
          }
        }
      }
      .peer-data-\\[variant\\=inset\\]\\:peer-data-\\[state\\=collapsed\\]\\:b-1 {
        &:is(:where(.peer)[data-variant="inset"] ~ *) {
          &:is(:where(.peer)[data-state="collapsed"] ~ *) {
            border-width: 1px;
          }
        }
      }
      @media (min-width: 48rem) {
        .md\\:has-aria-\\[hidden\\=false\\]\\:peer-data-\\[dialog\\=open\\]\\:group-data-\\[vv\\=w\\]\\/accordion\\:b-4 {
          &:has(*[aria-hidden="false"]) {
            &:is(:where(.peer)[data-dialog="open"] ~ *) {
              &:is(:where(.group\\/accordion)[data-vv="w"] *) {
                border-width: 4px;
              }
            }
          }
        }
      }
      "
    `)
  })

  // https://github.com/unocss/unocss/issues/5043
  // https://github.com/unocss/unocss/issues/4726
  // https://github.com/unocss/unocss/issues/4962
  it('applies stacked variants left to right like Tailwind v4', async () => {
    const uno = await createGenerator({
      mergeSelectors: false,
      presets: [
        presetWind4({
          preflights: { reset: false },
        }),
      ],
      rules: [
        // a rule cloning the handlers of its variants
        [/^copied$/, () => ({ padding: '1px', [symbols.variants]: (variants: VariantHandler[]) => variants.map(v => ({ ...v })) })],
        // a rule providing the order of its parent
        [/^gridp$/, () => ({ padding: '20px', [symbols.parent]: ['@supports (display: grid)', -1] })],
        // a rule providing the same order as the `md` breakpoint
        [/^gridp2$/, () => ({ padding: '20px', [symbols.parent]: ['@supports (display: grid)', 3002] })],
        // a rule replacing the handlers of its variants
        [/^custom$/, () => ({ color: 'red', [symbols.variants]: () => [{ selector: () => '.target' }] })],
        // a rule appending a handler
        [/^icon$/, () => ({ color: 'red', [symbols.variants]: (variants: VariantHandler[]) => [...variants, { selector: (s: string) => `${s} > .icon` }] })],
        // a rule appending a modified copy of a handler
        [/^micon$/, () => ({ color: 'red', [symbols.variants]: (variants: VariantHandler[]) => [...variants, { ...variants[0], handle: undefined, selector: (s: string) => `${s} > .icon` }] })],
        // a rule appending a copy of a handler with a property removed
        [/^dicon$/, () => ({ color: 'red', [symbols.variants]: (variants: VariantHandler[]) => {
          const { handle: _, ...rest } = variants[0]
          return [...variants, { ...rest, selector: (s: string) => `${s} > .icon` }]
        } })],
      ],
      shortcuts: [
        ['child-pad', '*:p-2'],
        ['fpad', 'group-focus:p-2'],
        ['card', 'group-hover:container'],
        ['copied-pad', '*:copied'],
        ['sc-target', 'hover:custom'],
        ['plain', 'icon'],
        ['strong', '!icon'],
        ['sc-micon', 'focus:micon'],
        ['sc-dicon', 'focus:dicon'],
        ['sc-alias', 'hover:icon'],
        ['red', 'uno-layer-inner:p-2'],
      ],
    })

    const result = await uno.generate([
      '*:last:p-2',
      'last:*:p-2',
      '*:data-[avatar]:rounded-full',
      'data-[avatar]:*:rounded-full',
      '[&>*]:hover:p-2',
      'hover:[&>*]:p-2',
      'dark:group-hover:opacity-50',
      'group-hover:dark:opacity-50',
      'md:starting:opacity-0',
      'md:outline-hidden',
      'md:text-red-500',
      'hover:space-x-4',
      'hover:child-pad',
      'group-hover:fpad',
      'card',
      'hover:copied-pad',
      'focus:sc-target',
      'hover:icon',
      'hover:plain',
      'hover:strong',
      'hover:sc-micon',
      'hover:sc-dicon',
      'sc-alias',
      'uno-layer-outer:red',
      'md:gridp',
      'md:lt-lg:gridp2',
      'p-2',
      '!-rotate-45',
      '-rotate-45!',
      '!outline-hidden',
      '!text-red-500',
      '-m-[theme(spacing.sm)]',
      'sm:p-4',
      'md:lt-lg:p-2',
      'contrast-more:p-2',
      '@dark:contrast-more:p-4',
      'scope-[.foo]:[&>*]:p-2',
    ])

    const { css } = result
    // the written order is the nesting order: leftmost variant is the outermost
    expect(css).toContain(`.${escapeSelector('*:last:p-2')} > *:last-child{`)
    expect(css).toContain(`.${escapeSelector('last:*:p-2')}:last-child > *{`)
    expect(css).toContain(`.${escapeSelector('*:data-[avatar]:rounded-full')} > *[data-avatar]{`)
    expect(css).toContain(`.${escapeSelector('data-[avatar]:*:rounded-full')}[data-avatar] > *{`)
    expect(css).toContain(`.${escapeSelector('[&>*]:hover:p-2')}>*:hover{`)
    expect(css).toContain(`.${escapeSelector('hover:[&>*]:p-2')}:hover>*{`)
    // the scope placeholder survives the replacement of `&`
    expect(css).toContain(`.foo .${escapeSelector('scope-[.foo]:[&>*]:p-2')}>*{`)
    // prefix variants keep the written ancestor order
    expect(css).toContain(`.dark .group:hover .${escapeSelector('dark:group-hover:opacity-50')}{`)
    expect(css).toContain(`.group:hover .dark .${escapeSelector('group-hover:dark:opacity-50')}{`)
    // at-rules nest in the written order, the parents set by the rules stay outermost
    expect(css).toContain('@media (min-width: 48rem){@starting-style{')
    expect(css).toContain('@media (forced-colors: active){@media (min-width: 48rem){')
    expect(css).toContain('@supports (color: color-mix(in lab, red, red)){@media (min-width: 48rem){')
    // variants of a shortcut wrap the variants of its utilities
    expect(css).toContain(`.${escapeSelector('hover:child-pad')}:hover > *{`)
    expect(css).toContain(`.group:hover:focus .${escapeSelector('group-hover:fpad')}{`)
    // the `container` rule probes the handlers with an empty context
    expect(css).toContain('.group:hover .card{')
    // handlers cloned by a rule keep being the variants of the utility
    expect(css).toContain(`.${escapeSelector('hover:copied-pad')}:hover > *{`)
    // handlers replacing or appended to the ones of the utility are injected by the rule
    expect(css).toContain(`.target:focus{`)
    expect(css).toContain(`.${escapeSelector('hover:icon')}:hover > .icon{`)
    expect(css).toContain(`.${escapeSelector('hover:plain')} > .icon:hover{`)
    expect(css).toContain(`.${escapeSelector('hover:strong')} > .icon:hover{`)
    expect(css).toContain(`.${escapeSelector('hover:sc-micon')} > .icon:hover:focus{`)
    expect(css).toContain(`.${escapeSelector('hover:sc-dicon')} > .icon:hover:focus{`)
    // a shortcut without variants keeps the order of the utility
    expect(css).toContain('.sc-alias:hover > .icon{')
    // the leftmost variant decides the layer
    expect(result.getLayer('outer')).toContain(`.${escapeSelector('uno-layer-outer:red')}{`)
    // the `parentOrder` provided by a rule is a default, the breakpoint decides
    expect(css.indexOf('.p-2{')).toBeLessThan(css.indexOf(`.${escapeSelector('md:gridp')}{`))
    expect(css.indexOf('@media (min-width: 40rem){')).toBeLessThan(css.indexOf(`.${escapeSelector('md:lt-lg:gridp2')}{`))
    // body transforms keep their pipeline: theme() before negative before important
    expect(css).toContain(`.${escapeSelector('!-rotate-45')}{rotate:-45deg !important;}`)
    expect(css).toContain(`.${escapeSelector('-rotate-45!')}{rotate:-45deg !important;}`)
    expect(css).toContain(`.${escapeSelector('-m-[theme(spacing.sm)]')}{margin:-0.875rem;}`)
    expect(css).toContain('outline:2px solid transparent !important')
    expect(css).not.toContain(' !important){')
    // the leftmost breakpoint decides the position of the block: the `md`..`lg` range comes after `sm`
    expect(css.indexOf('@media (min-width: 40rem){')).toBeLessThan(css.indexOf('@media (min-width: 48rem){@media (max-width: calc(64rem - 0.1px)){'))
    // blocks with more conditions come after the ones with fewer, so `@dark:contrast-more:` wins over `contrast-more:`
    expect(css.indexOf(`.${escapeSelector('contrast-more:p-2')}{`)).toBeLessThan(css.indexOf(`.${escapeSelector('@dark:contrast-more:p-4')}{`))

    const prettified = await prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    })

    expect(prettified).toMatchInlineSnapshot(`
      "/* layer: properties */
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or
        ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
        *,
        ::before,
        ::after,
        ::backdrop {
          --un-space-x-reverse: initial;
          --un-text-opacity: 100%;
        }
      }
      @property --un-text-opacity {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 100%;
      }
      @property --un-space-x-reverse {
        syntax: "*";
        inherits: false;
        initial-value: 0;
      }
      /* layer: theme */
      :root,
      :host {
        --spacing: 0.25rem;
        --colors-red-500: oklch(63.7% 0.237 25.331);
      }
      /* layer: shortcuts */
      .hover\\:child-pad:hover > * {
        padding: calc(var(--spacing) * 2);
      }
      .group:hover:focus .group-hover\\:fpad {
        padding: calc(var(--spacing) * 2);
      }
      .hover\\:copied-pad:hover > * {
        padding: 1px;
      }
      .target:focus {
        color: red;
      }
      .hover\\:plain > .icon:hover {
        color: red;
      }
      .sc-alias:hover > .icon {
        color: red;
      }
      .hover\\:strong > .icon:hover {
        color: red !important;
      }
      .hover\\:sc-micon > .icon:hover:focus {
        color: red;
      }
      .hover\\:sc-dicon > .icon:hover:focus {
        color: red;
      }
      @media (min-width: 40rem) {
        .group:hover .card {
          max-width: 40rem;
        }
      }
      @media (min-width: 48rem) {
        .group:hover .card {
          max-width: 48rem;
        }
      }
      @media (min-width: 64rem) {
        .group:hover .card {
          max-width: 64rem;
        }
      }
      @media (min-width: 80rem) {
        .group:hover .card {
          max-width: 80rem;
        }
      }
      @media (min-width: 96rem) {
        .group:hover .card {
          max-width: 96rem;
        }
      }
      /* layer: default */
      .\\!text-red-500 {
        color: color-mix(
          in srgb,
          var(--colors-red-500) var(--un-text-opacity),
          transparent
        ) !important;
      }
      .-m-\\[theme\\(spacing\\.sm\\)\\] {
        margin: -0.875rem;
      }
      .foo .scope-\\[\\.foo\\]\\:\\[\\&\\>\\*\\]\\:p-2 > * {
        padding: calc(var(--spacing) * 2);
      }
      .p-2 {
        padding: calc(var(--spacing) * 2);
      }
      .\\[\\&\\>\\*\\]\\:hover\\:p-2 > *:hover {
        padding: calc(var(--spacing) * 2);
      }
      .hover\\:\\[\\&\\>\\*\\]\\:p-2:hover > * {
        padding: calc(var(--spacing) * 2);
      }
      .\\*\\:last\\:p-2 > *:last-child {
        padding: calc(var(--spacing) * 2);
      }
      .last\\:\\*\\:p-2:last-child > * {
        padding: calc(var(--spacing) * 2);
      }
      .\\!outline-hidden {
        outline-style: none !important;
      }
      .\\*\\:data-\\[avatar\\]\\:rounded-full > *[data-avatar] {
        border-radius: calc(infinity * 1px);
      }
      .data-\\[avatar\\]\\:\\*\\:rounded-full[data-avatar] > * {
        border-radius: calc(infinity * 1px);
      }
      .dark .group:hover .dark\\:group-hover\\:opacity-50 {
        opacity: 50%;
      }
      .group:hover .dark .group-hover\\:dark\\:opacity-50 {
        opacity: 50%;
      }
      .-rotate-45\\! {
        rotate: -45deg !important;
      }
      .\\!-rotate-45 {
        rotate: -45deg !important;
      }
      .hover\\:icon:hover > .icon {
        color: red;
      }
      .hover\\:space-x-4:hover {
        :where(& > :not(:last-child)) {
          --un-space-x-reverse: 0;
          margin-inline-start: calc(
            calc(var(--spacing) * 4) * var(--un-space-x-reverse)
          );
          margin-inline-end: calc(
            calc(var(--spacing) * 4) * calc(1 - var(--un-space-x-reverse))
          );
        }
      }
      @media (forced-colors: active) {
        .\\!outline-hidden {
          outline: 2px solid transparent !important;
          outline-offset: 2px !important;
        }
      }
      @media (prefers-contrast: more) {
        .contrast-more\\:p-2 {
          padding: calc(var(--spacing) * 2);
        }
      }
      @supports (color: color-mix(in lab, red, red)) {
        .\\!text-red-500 {
          color: color-mix(
            in oklab,
            var(--colors-red-500) var(--un-text-opacity),
            transparent
          ) !important;
        }
      }
      @media (prefers-color-scheme: dark) {
        @media (prefers-contrast: more) {
          .\\@dark\\:contrast-more\\:p-4 {
            padding: calc(var(--spacing) * 4);
          }
        }
      }
      @media (min-width: 40rem) {
        .sm\\:p-4 {
          padding: calc(var(--spacing) * 4);
        }
      }
      @media (min-width: 48rem) {
        .md\\:text-red-500 {
          color: color-mix(
            in srgb,
            var(--colors-red-500) var(--un-text-opacity),
            transparent
          );
        }
        .md\\:outline-hidden {
          outline-style: none;
        }
      }
      @media (forced-colors: active) {
        @media (min-width: 48rem) {
          .md\\:outline-hidden {
            outline: 2px solid transparent;
            outline-offset: 2px;
          }
        }
      }
      @media (min-width: 48rem) {
        @media (max-width: calc(64rem - 0.1px)) {
          .md\\:lt-lg\\:p-2 {
            padding: calc(var(--spacing) * 2);
          }
        }
      }
      @media (min-width: 48rem) {
        @starting-style {
          .md\\:starting\\:opacity-0 {
            opacity: 0%;
          }
        }
      }
      @supports (color: color-mix(in lab, red, red)) {
        @media (min-width: 48rem) {
          .md\\:text-red-500 {
            color: color-mix(
              in oklab,
              var(--colors-red-500) var(--un-text-opacity),
              transparent
            );
          }
        }
      }
      @supports (display: grid) {
        @media (min-width: 48rem) {
          .md\\:gridp {
            padding: 20px;
          }
        }
      }
      @supports (display: grid) {
        @media (min-width: 48rem) {
          @media (max-width: calc(64rem - 0.1px)) {
            .md\\:lt-lg\\:gridp2 {
              padding: 20px;
            }
          }
        }
      }
      /* layer: outer */
      .uno-layer-outer\\:red {
        padding: calc(var(--spacing) * 2);
      }
      "
    `)
  })

  it('basic variable prefix', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          variablePrefix: 'foo-',
          preflights: {
            reset: false,
            theme: false,
            property: true,
          },
        }),
      ],
    })
    const { css } = await uno.generate('bg-white')
    expect(css).toMatchInlineSnapshot(`
    "/* layer: properties */
    @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--foo-bg-opacity:100%;}}
    @property --foo-bg-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
    /* layer: default */
    .bg-white{background-color:color-mix(in srgb, var(--colors-white) var(--foo-bg-opacity), transparent);}
    @supports (color: color-mix(in lab, red, red)){
    .bg-white{background-color:color-mix(in oklab, var(--colors-white) var(--foo-bg-opacity), transparent);}
    }"
  `)
  })

  it('keeps media parents outside divide and space child selectors', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          dark: 'media',
        }),
      ],
    })

    const { css } = await uno.generate('dark:divide-gray-700 dark:space-y-4', { preflights: false })

    expect(css).toContain('@media (prefers-color-scheme: dark){.dark\\:divide-gray-700{\n:where(&>:not(:last-child)){border-color:')
    expect(css).toContain('@media (prefers-color-scheme: dark){.dark\\:space-y-4{\n:where(&>:not(:last-child)){--un-space-y-reverse:0;')
    expect(css).not.toContain('.dark\\:divide-gray-700{@media')
    expect(css).not.toContain('.dark\\:space-y-4{@media')
  })

  it('h-screen-* uses verticalBreakpoint', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          preflights: { reset: false, theme: false },
        }),
      ],
      theme: {
        breakpoint: {
          sm: '640px',
          md: '768px',
        },
        verticalBreakpoint: {
          sm: '400px',
          md: '500px',
        },
      },
    })

    const { getLayer } = await uno.generate([
      'h-screen-sm',
      'h-screen-md',
      'w-screen-sm',
    ])

    expect(getLayer('default')).toMatchInlineSnapshot(`
      "/* layer: default */
      .h-screen-md{height:500px;}
      .h-screen-sm{height:400px;}
      .w-screen-sm{width:640px;}"
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

    expect(css).toMatchInlineSnapshot(`
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

    expect(css).toMatchInlineSnapshot(`
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

    expect(css).toMatchInlineSnapshot(`
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

  it('custom properties', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({
          preflights: {
            reset: false,
            property: {
              parent: false,
              selector: ':host',
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('text-red')

    expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      :host{--un-text-opacity:100%;}
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: theme */
      :root, :host { --colors-red-DEFAULT: oklch(70.4% 0.191 22.216); }
      /* layer: default */
      .text-red{color:color-mix(in srgb, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
      @supports (color: color-mix(in lab, red, red)){
      .text-red{color:color-mix(in oklab, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
      }"
    `)
  })

  it('with no-merge shortcuts', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({ preflights: { reset: false } }),
      ],
      shortcuts: [
        ['btn', 'text-red dark:text-blue'],
      ],
    })

    const { css } = await uno.generate('hover:btn')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: properties */
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--un-text-opacity:100%;}}
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: theme */
      :root, :host { --colors-red-DEFAULT: oklch(70.4% 0.191 22.216); --colors-blue-DEFAULT: oklch(70.7% 0.165 254.624); }
      /* layer: shortcuts */
      .dark .hover\\:btn:hover{color:color-mix(in srgb, var(--colors-blue-DEFAULT) var(--un-text-opacity), transparent);}
      .hover\\:btn:hover{color:color-mix(in srgb, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
      @supports (color: color-mix(in lab, red, red)){
      .dark .hover\\:btn:hover{color:color-mix(in oklab, var(--colors-blue-DEFAULT) var(--un-text-opacity), transparent);}
      .hover\\:btn:hover{color:color-mix(in oklab, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
      }"
    `)
  })

  it('h.bracket new syntax', async () => {
    const uno = await createGenerator({
      presets: [
        presetWind4({ preflights: { reset: false } }),
      ],
      theme: {
        bar: '10px',
      } as any,
    })

    const cases = [
      'm-[--spacing]',
      'm-[--spacing(2)]',
      'px-[--spacing.sm(2.5)]',
      'text-[--colors.blue,#000]',
      'text-[--colors.red.200,#fff]',
      '[--foo:--bar(8)]',
      `w-[calc(var(--sidebar-width-icon)+--spacing(8))]`,
      `w-[--sidebar-width-icon+--spacing(8)+2px)+var(--foo)+theme(spacing.sm)]`,
    ]

    const { getLayer } = await uno.generate(cases)

    expect(getLayer('default')).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-\\[--colors\\.blue\\,\\#000\\]{color:color-mix(in oklab, var(--colors-blue-DEFAULT, #000) var(--un-text-opacity), transparent);}
      .text-\\[--colors\\.red\\.200\\,\\#fff\\]{color:color-mix(in oklab, var(--colors-red-200, #fff) var(--un-text-opacity), transparent);}
      .m-\\[--spacing\\(2\\)\\]{margin:calc(var(--spacing) * 2);}
      .m-\\[--spacing\\]{margin:var(--spacing);}
      .px-\\[--spacing\\.sm\\(2\\.5\\)\\]{padding-inline:calc(var(--spacing-sm) * 2.5);}
      .w-\\[--sidebar-width-icon\\+--spacing\\(8\\)\\+2px\\)\\+var\\(--foo\\)\\+theme\\(spacing\\.sm\\)\\]{width:var(--sidebar-width-icon)+calc(var(--spacing) * 8) + 2px) + var(--foo) + 0.875rem;}
      .w-\\[calc\\(var\\(--sidebar-width-icon\\)\\+--spacing\\(8\\)\\)\\]{width:calc(var(--sidebar-width-icon) + calc(var(--spacing) * 8));}
      .\\[--foo\\:--bar\\(8\\)\\]{--foo:calc(var(--bar) * 8);}"
    `)
  })
})
