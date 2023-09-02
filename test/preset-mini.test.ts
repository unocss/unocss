import { createGenerator, escapeSelector } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { describe, expect, test } from 'vitest'
import { presetMiniNonTargets, presetMiniTargets } from './assets/preset-mini-targets'
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
    },
  },
})

describe('preset-mini', () => {
  test('dark customizing selector', async () => {
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

  test('targets', async () => {
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

  test('utils from preset-wind should be non-targets', async () => {
    const code = presetWindTargets.join(' ')
    const { css, matched } = await uno.generate(code, { preflights: false })

    expect(Array.from(matched)).toEqual([])
    expect(css).toBe('')
  })

  test('custom var prefix', async () => {
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

  test('empty prefix', async () => {
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

  test('nested theme colors', async () => {
    const { css, matched } = await uno.generate([
      'text-a-b-c',
      'text-a-camel-case',
      'bg-a-b-c',
    ], { preflights: false })

    expect(css).toMatchFileSnapshot('./assets/output/preset-mini-nested-theme-colors.css')
    expect(matched.size).toBe(3)
  })

  test('non-nested theme colors with hyphens and/or numbers', async () => {
    const { css, matched } = await uno.generate([
      'text-with-hyphen',
      'bg-with-hyphen',
      'text-numbered-123',
      'bg-numbered321',
    ], { preflights: false })

    expect(css).toMatchFileSnapshot('./assets/output/preset-mini-non-nested-theme-colors.css')
    expect(matched.size).toBe(4)
  })

  test('none targets', async () => {
    const { css, matched } = await uno.generate(new Set(presetMiniNonTargets), { minify: true, preflights: false })

    expect([...matched]).toEqual([])
    expect(css).toEqual('')
  })

  test('fontSize theme', async () => {
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

  test('fontWeight theme', async () => {
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

  test('dark class', async () => {
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

  test('the :active pseudo is sorted and separated after other pseudo', async () => {
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

  test('css variable with `{` `}` will not generate css ', async () => {
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

  test('group data variant', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'group-data-[state=open]:rotate-180',
      'group-data-[state=open]:text-black',
      'data-[state=open]:text-red',
      'group-hover:font-bold',
    ].join(' '), {
      preflights: false,
    })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-mini-group-data.css')
  })

  test('define breakpoints with other unit', async () => {
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
      .\\\\<xl\\\\:text-3xl{font-size:1.875rem;line-height:2.25rem;}
      }
      @media (max-width: calc(64rem - 0.1px)){
      .\\\\<lg\\\\:text-sm{font-size:0.875rem;line-height:1.25rem;}
      }
      @media (min-width: 48rem){
      .md\\\\:text-xl{font-size:1.25rem;line-height:1.75rem;}
      }
      @media (min-width: 48rem) and (max-width: calc(64rem - 0.1px)){
      .\\\\~md\\\\:text-base{font-size:1rem;line-height:1.5rem;}
      }"
    `)
  })

  test('theme for zIndex', async () => {
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
})
