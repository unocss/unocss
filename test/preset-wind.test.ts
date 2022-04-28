import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind from '@unocss/preset-wind'
import { describe, expect, test } from 'vitest'
import { presetWindNonTargets, presetWindTargets } from './assets/preset-wind-targets'

export const localTargets: string[] = [
  // static
  'content-unocss',
  'content-attr(dashed-attr)',
  'content-attr_underline',
  'content-[unocss]',
  'content-[attr(underlined_attr)]',
  'content-$unocss-var',
]

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
    const targets = [...localTargets, ...presetWindTargets]
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
    const { matched } = await uno.generate(new Set(presetWindNonTargets))

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
    const { css, matched } = await uno.generate(new Set([...targets, ...nonTargets]))

    expect(matched).toEqual(new Set(targets))
    expect(css).toMatchSnapshot()
  })
})
