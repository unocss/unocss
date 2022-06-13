import { createGenerator, escapeSelector } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { describe, expect, test } from 'vitest'
import { presetMiniNonTargets, presetMiniStrayTargets, presetMiniTargets } from './assets/preset-mini-targets'
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
    },
  },
})

describe('preset-mini', () => {
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

  test('stray targets', async () => {
    const code = presetMiniStrayTargets.join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)

    const unmatched = []
    for (const i of presetMiniStrayTargets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    expect(unmatched).toEqual([])
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('none targets', async () => {
    const { css, matched } = await uno.generate(new Set(presetMiniNonTargets))

    expect([...matched]).toEqual([])
    expect(css).toMatchSnapshot()
  })
})
