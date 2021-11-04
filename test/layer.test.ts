import { createGenerator } from 'unocss'

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
        ['abc', 'a b c2 d3', { layer: 'shortcuts' }],
      ],
      presets: [],
    })
    const { css } = await uno.generate('a b abc d4 c5')
    expect(css).toMatchSnapshot()
  })
})
