import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { createRemToPxResolver } from '@unocss/preset-wind4/utils'
import { describe, expect, it } from 'vitest'
import { presetWind4Targets } from './assets/preset-wind4-targets'

describe('preset-wind4', () => {
  it('targets', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({ reset: false }),
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

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-targets.css')

    // The following is a list of safe differences, the expected behavior of `preset-wind4` is inconsistent with `preset-wind3`.
    expect(unmatched).toMatchInlineSnapshot(`
      [
        "outline-none",
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
        "flex-basis-1/2",
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
        "focus-visible:outline-none",
        "-mt-safe",
        "-!mb-safe",
        "!-ms-safe",
        "placeholder-color-red-1",
        "hover:not-first:checked:bg-true-gray/10",
        "hover:is-first:checked:bg-true-gray/10",
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
        "placeholder-inherit",
        "-space-x-4",
        "data-dropdown:ring-green",
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
        presetWind4({ themePreflight: true, reset: false }),
      ],
    })

    const { css } = await uno.generate('')
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind4-theme.css')
  })

  it('custom theme values with variable', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({ reset: false }),
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
      "/* layer: cssvar-property */
      @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
      /* layer: theme */
      :root, :host {
      --colors-foo: var(--colors-bar);
      --colors-bar: var(--colors-baz-bcd, #000);
      --colors-baz-bcd: var(--colors-test, #fff);
      --colors-test: #fff;
      }
      /* layer: default */
      .c-foo{color:color-mix(in oklch, var(--colors-foo) var(--un-text-opacity), transparent) /* var(--colors-bar) */;}"
    `)
  })

  it('custom theme vars', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          reset: false,
          utilityResolver(vars, layer) {
            if (layer === 'theme') {
              const [key, value] = vars
              if (key.includes('colors')) {
                vars[0] = key.replace('colors', 'ui')
              }
              if ((value as string).includes('rem')) {
                vars[1] = (value as string).replace('rem', 'px')
              }
            }
          },
        }),
      ],
    })

    const { getLayer } = await uno.generate('c-red mr-4')
    const css = getLayer('theme')

    expect(css).toMatchInlineSnapshot(`
      "/* layer: theme */
      :root, :host {
      --spacing: 0.25px;
      --ui-red-DEFAULT: oklch(0.704 0.191 22.216);
      }"
    `)
  })

  it('unitResolver', async () => {
    const uno = await createGenerator({
      envMode: 'dev',
      presets: [
        presetWind4({
          reset: false,
          utilityResolver: createRemToPxResolver(),
        }),
      ],
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
})
