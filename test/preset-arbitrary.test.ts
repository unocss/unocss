import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind from '@unocss/preset-wind'
import { describe, expect, test } from 'vitest'
import presetArbitrary from '@unocss/preset-arbitrary'
import { presetArbitraryTargets } from './assets/preset-arbitrary-target'

const uno = createGenerator({
  presets: [
    presetWind(),
    presetArbitrary(),
  ],
})

describe('preset-arbitrary', () => {
  test('targets', async () => {
    const code = presetArbitraryTargets.join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)

    expect(uno.config.extractors).toHaveLength(1)
    expect(uno.config.extractors[0].name).toBe('split-arbitrary')

    const unmatched = []
    for (const i of presetArbitraryTargets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    expect(unmatched).toEqual([])
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })
})
