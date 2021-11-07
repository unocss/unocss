import { createGenerator } from '@unocss/core'

describe('layers', () => {
  test('static', async() => {
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
    })
    const { css } = await uno.generate('a b abc abcd d4 c5')
    expect(css).toMatchSnapshot()
  })
})
