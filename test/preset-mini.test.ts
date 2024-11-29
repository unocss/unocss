import { createGenerator, escapeSelector } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { describe, expect, it } from 'vitest'
import { presetMiniNonTargets, presetMiniTargets, specialPresetMiniTargets } from './assets/preset-mini-targets'
import { presetWindTargets } from './assets/preset-wind-targets'

const uno = createGenerator({
  presets: [
    presetMini({
      dark: 'media',
    }),
  ],
  theme: {
    colors: {
      'custom': {
        a: 'var(--custom)',
        b: 'rgba(var(--custom), %alpha)',
      },
      'a': {
        b: {
          c: '#514543',
        },
        camelCase: '#234',
      },
      'with-hyphen': '#123456',
      'numbered-123': '#123',
      'numbered321': '#321',
    },
    spacing: {
      safe: 'max(env(safe-area-inset-left), env(safe-area-inset-right))',
      md: 'calc(var(--spacing-md))',
      lg: 'var(--spacing-lg)',
    },
  },
})

describe('preset-mini', () => {
  it('dark customizing selector', async () => {
    const uno = createGenerator({
      presets: [
        presetMini({
          dark: {
            dark: '[data-mode="dark"]',
            light: '[data-mode="light"]',
          },
        }),
      ],
    })

    const { css } = await uno.generate([
      'dark:bg-white',
      'dark:text-lg',
      'dark:hover:rounded',
      'light:bg-black',
      'light:text-sm',
      'light:disabled:w-full',
    ].join(' '), {
      preflights: false,
    })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-dark-customizing-selector.css')
  })

  it('targets', async () => {
    const code = presetMiniTargets.join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)

    const unmatched = []
    for (const i of presetMiniTargets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    expect(unmatched).toEqual([])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-targets.css')
    expect(css).toEqual(css2)
  })

  it('specialPresetMiniTargets', async () => {
    const code = specialPresetMiniTargets.join(' ')
    const { css: css2 } = await uno.generate(code)
    await expect(css2).toMatchFileSnapshot('./assets/output/preset-mini-special-targets.css')
  })

  it('utils from preset-wind should be non-targets', async () => {
    const code = presetWindTargets.join(' ')
    const { css, matched } = await uno.generate(code, { preflights: false })

    expect(Array.from(matched)).toEqual([
      'h-svh',
      'h-dvh',
      'h-lvh',
      'min-h-dvh',
      'min-h-lvh',
      'min-h-svh',
      'max-h-dvh',
      'max-h-svh',
      'max-h-lvh',
    ])
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .h-dvh{height:100dvh;}
      .h-lvh{height:100lvh;}
      .h-svh{height:100svh;}
      .max-h-dvh{max-height:100dvh;}
      .max-h-lvh{max-height:100lvh;}
      .max-h-svh{max-height:100svh;}
      .min-h-dvh{min-height:100dvh;}
      .min-h-lvh{min-height:100lvh;}
      .min-h-svh{min-height:100svh;}"
    `)
  })

  it('custom var prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetMini({
          variablePrefix: 'hi-',
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'scale-100',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-custom-var-prefix.css')
  })

  it('empty prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetMini({
          variablePrefix: '',
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'scale-100',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-empty-prefix.css')
  })

  it('nested theme colors', async () => {
    const { css, matched } = await uno.generate([
      'text-a-b-c',
      'text-a-camel-case',
      'bg-a-b-c',
    ], { preflights: false })

    expect(css).toMatchFileSnapshot('./assets/output/preset-mini-nested-theme-colors.css')
    expect(matched.size).toBe(3)
  })

  it('non-nested theme colors with hyphens and/or numbers', async () => {
    const { css, matched } = await uno.generate([
      'text-with-hyphen',
      'bg-with-hyphen',
      'text-numbered-123',
      'bg-numbered321',
    ], { preflights: false })

    expect(css).toMatchFileSnapshot('./assets/output/preset-mini-non-nested-theme-colors.css')
    expect(matched.size).toBe(4)
  })

  it('none targets', async () => {
    const { css, matched } = await uno.generate(new Set(presetMiniNonTargets), { minify: true, preflights: false })

    expect([...matched]).toEqual([])
    expect(css).toEqual('')
  })

  it('fontSize theme', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        fontSize: {
          small: '1rem',
          medium: ['2rem', '1.5em'],
          xs: '2rem',
          lg: ['3rem', '1.5em'],
        },
      },
    })

    const { css } = await uno.generate([
      'text-small',
      'text-medium',
      'text-xs',
      'text-lg',
    ].join(' '), { preflights: false })

    // @ts-expect-error types
    expect(uno.config.theme.fontSize.lg).toEqual(['3rem', '1.5em'])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-font-size-theme.css')
  })

  it('fontWeight theme', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        fontWeight: {
          head: '900',
          foot: '100',
        },
      },
    })

    const { css } = await uno.generate([
      'font-head',
      'font-foot',
    ].join(' '), { preflights: false })

    // @ts-expect-error types
    expect(uno.config.theme.fontWeight.head).toEqual('900')
    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-font-weight-theme.css')
  })

  it('dark class', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:scope-[.hello]:text-1/2',
      'scope-[[world]]:light:text-1/3',
    ].join(' '), {
      preflights: false,
    })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-dark-class.css')
  })

  it('the :active pseudo is sorted and separated after other pseudo', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'hover:bg-blue-3',
      'active:bg-blue-3',
      'focus:bg-blue-3',
    ].join(' '), {
      preflights: false,
    })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-active-pseudo.css')
  })

  it('css variable with `{` `}` will not generate css ', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      // eslint-disable-next-line no-template-curly-in-string
      'c-${variable}',
    ].join(' '), {
      preflights: false,
    })

    expect(css).toBe('')
  })

  it('define breakpoints with other unit', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        breakpoints: {
          md: '48rem',
          lg: '64rem',
          xl: '1000px',
        },
      },
    })

    const { css } = await uno.generate([
      'md:text-xl',
      '<lg:text-sm',
      '~md:text-base',
      '<xl:text-3xl',
    ], { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      @media (max-width: 999.9px){
      .\\<xl\\:text-3xl{font-size:1.875rem;line-height:2.25rem;}
      }
      @media (max-width: calc(64rem - 0.1px)){
      .\\<lg\\:text-sm{font-size:0.875rem;line-height:1.25rem;}
      }
      @media (min-width: 48rem){
      .md\\:text-xl{font-size:1.25rem;line-height:1.75rem;}
      }
      @media (min-width: 48rem) and (max-width: calc(64rem - 0.1px)){
      .\\~md\\:text-base{font-size:1rem;line-height:1.5rem;}
      }"
    `)
  })

  it('theme for zIndex', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        zIndex: {
          header: '500',
        },
      },
    })

    expect((await uno.generate('z-header', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .z-header{z-index:500;}"
      `)
  })

  it('theme font-size with letter-space', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        fontSize: {
          normal: '24px',
          ls: ['8rem', '1', '2.25rem'],
          obj: ['8rem', {
            'line-height': '2.25rem',
            'letter-spacing': '-0.02em',
            'font-weight': '700',
          }],
        },
      },
    })

    expect((await uno.generate('text-sm text-normal text-ls text-obj', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .text-ls{font-size:8rem;line-height:1;letter-spacing:2.25rem;}
        .text-normal{font-size:24px;line-height:1;}
        .text-obj{font-size:8rem;line-height:2.25rem;letter-spacing:-0.02em;font-weight:700;}
        .text-sm{font-size:0.875rem;line-height:1.25rem;}"
      `)
  })

  it('override colors differently', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        colors: {
          blue: {
            400: 'rgb(0 0 400)',
          },
        },
        textColor: {
          blue: {
            400: 'rgb(0 0 700)',
          },
        },
      },
    })

    expect((await uno.generate('bg-blue-400 text-blue-400', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .bg-blue-400{--un-bg-opacity:1;background-color:rgb(0 0 400 / var(--un-bg-opacity));}
        .text-blue-400{--un-text-opacity:1;color:rgb(0 0 700 / var(--un-text-opacity));}"
      `)
  })

  it('account custom color for shadow theme', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        colors: {
          blackA7: 'hsla(0, 0%, 0%, 0.169)',
        },
      },
    })

    expect((await uno.generate('shadow-[0_2px_10px] shadow-blackA7', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .shadow-\\[0_2px_10px\\]{--un-shadow:0 2px 10px var(--un-shadow-color);box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}
        .shadow-blackA7{--un-shadow-opacity:0.169;--un-shadow-color:hsla(0, 0%, 0%, var(--un-shadow-opacity));}"
      `)
    expect((await uno.generate('shadow-[0_0_7.5rem_0_var(--shadow)]', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .shadow-\\[0_0_7\\.5rem_0_var\\(--shadow\\)\\]{--un-shadow:0 0 7.5rem 0 var(--un-shadow-color, var(--shadow));box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}"
      `)

    expect((await uno.generate('shadow-[0_0_7.5rem_0_#000]', { preflights: false })).css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .shadow-\\[0_0_7\\.5rem_0_\\#000\\]{--un-shadow:0 0 7.5rem 0 var(--un-shadow-color, rgb(0 0 0));box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}"
      `)
  })

  it('support new color notation using css variables for compatibility', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        colors: {
          primary: 'var(--base-primary, oklch(var(--primary) / <alpha-value>))',
        },
      },
    })

    expect((await uno.generate('bg-primary bg-opacity-50 text-primary text-opacity-50', { preflights: false })).css)
      .toMatchInlineSnapshot(`
      "/* layer: default */
      .bg-primary{--un-bg-opacity:1;background-color:var(--base-primary, oklch(var(--primary) / var(--un-bg-opacity)));}
      .bg-opacity-50{--un-bg-opacity:0.5;}
      .text-primary{--un-text-opacity:1;color:var(--base-primary, oklch(var(--primary) / var(--un-text-opacity)));}
      .text-opacity-50{--un-text-opacity:0.5;}"
    `)

    expect((await uno.generate('bg-primary/50 ring-5 ring-primary ring-opacity-50', { preflights: false })).css)
      .toMatchInlineSnapshot(`
    "/* layer: default */
    .bg-primary\\/50{background-color:var(--base-primary, oklch(var(--primary) / 0.5));}
    .ring-5{--un-ring-width:5px;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color);--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color);box-shadow:var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);}
    .ring-primary{--un-ring-opacity:1;--un-ring-color:var(--base-primary, oklch(var(--primary) / var(--un-ring-opacity)));}
    .ring-opacity-50{--un-ring-opacity:0.5;}"
  `)

    expect((await uno.generate('border-5 border-primary border-opacity-50', { preflights: false })).css)
      .toMatchInlineSnapshot(`
    "/* layer: default */
    .border-5{border-width:5px;}
    .border-primary{--un-border-opacity:1;border-color:var(--base-primary, oklch(var(--primary) / var(--un-border-opacity)));}
    .border-opacity-50{--un-border-opacity:0.5;}"
  `)
  })
})
