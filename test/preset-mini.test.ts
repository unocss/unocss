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

    expect(css).toEqual('')
    expect([...matched]).toEqual([])
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
})
