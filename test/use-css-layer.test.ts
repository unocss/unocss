import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('use-css-layer', () => {
  it('static', async () => {
    const uno = createGenerator({
      rules: [
        ['a', { name: 'bar1' }, { layer: 'a' }],
        ['b', { name: 'bar2' }, { layer: 'b' }],
        [/^c(\d+)$/, ([, d]) => ({ name: d }), { layer: 'c' }],
        [/^d(\d+)$/, ([, d]) => `/* RAW ${d} */`, { layer: 'd' }],
      ],
      shortcuts: [
        ['abcd', 'a b c2 d3', { layer: 's' }],
        ['abc', 'a b c4'],
      ],
      presets: [],
      outputToCssLayers: true,
    })
    const { css } = await uno.generate('a b abc abcd d4 c5', { preflights: false })
    expect(css).toMatchSnapshot()
  })
})
