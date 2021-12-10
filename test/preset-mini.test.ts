import { createGenerator, escapeSelector } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { describe, expect, test } from 'vitest'
import { presetMiniTargets } from './preset-mini-targets'
import { presetWindiTargets } from './preset-wind-targets'

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
  test('targets', async() => {
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

  test('utils from preset-wind should be non-targets', async() => {
    const code = presetWindiTargets.join(' ')
    const { css, matched } = await uno.generate(code)

    expect(Array.from(matched)).toEqual([])
    expect(css).toBe('')
  })
})
