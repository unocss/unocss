import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind from '@unocss/preset-wind'
import { describe, expect, test } from 'vitest'
import { presetWindNonTargets, presetWindTargets } from './assets/preset-wind-targets'

const uno = createGenerator({
  presets: [
    presetWind({
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

describe('preset-wind', () => {
  test('targets', async () => {
    const targets = presetWindTargets
    const code = targets.join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)

    const unmatched = []
    for (const i of targets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    expect(unmatched).toEqual([])
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('non-targets', async () => {
    const { matched } = await uno.generate(new Set(presetWindNonTargets), { preflights: false })

    expect([...matched]).toEqual([])
  })

  test('containers', async () => {
    const targets = [
      'container',
      'md:container',
      'lg:container',
    ]
    const nonTargets = [
      '__container',
    ]
    const { css, matched } = await uno.generate(new Set([...targets, ...nonTargets]), { preflights: false })

    expect(matched).toEqual(new Set(targets))
    expect(css).toMatchSnapshot()
  })

  test('centered containers', async () => {
    const uno = createGenerator({
      presets: [
        presetWind(),
      ],
      theme: {
        container: {
          center: true,
        },
      },
    })

    const targets = [
      'container',
      'md:container',
      'lg:container',
    ]
    const { css, matched } = await uno.generate(new Set(targets), { preflights: false })

    expect(matched).toEqual(new Set(targets))
    expect(css).toMatchSnapshot()
  })
})
