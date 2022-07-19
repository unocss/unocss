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
      custom: {
        a: 'var(--custom)',
        b: 'rgba(var(--custom), %alpha)',
      },
      a: {
        b: {
          c: '#514543',
        },
        camelCase: '#234',
      },
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

    expect(css).toMatchSnapshot()
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
    expect(css).toMatchSnapshot()
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

    expect(css).toMatchSnapshot()
  })

  test('nested theme colors', async () => {
    const { css, matched } = await uno.generate([
      'text-a-b-c',
      'text-a-camel-case',
      'bg-a-b-c',
    ], { preflights: false })

    expect(css).toMatchSnapshot('')
    expect(matched.size).toBe(3)
  })

  test('none targets', async () => {
    const { css, matched } = await uno.generate(new Set(presetMiniNonTargets), { minify: true, preflights: false })

    expect(css).toMatchInlineSnapshot('""')
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
    expect(css).toMatchSnapshot()
  })
})
