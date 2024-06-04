import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetUno from '@unocss/preset-uno'

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

  it('change layer name', async () => {
    const uno = createGenerator({
      presets: [presetUno()],
      shortcuts: {
        'custom-shortcut': 'text-lg text-orange hover:text-teal',
      },
      outputToCssLayers: {
        cssLayerName: (layer: string) => {
          if (layer === 'default')
            return 'utilities'

          if (layer === 'shortcuts')
            return 'utilities.shortcuts'
        },
      },
    })
    const { css } = await uno.generate('w-1 h-1 custom-shortcut', { preflights: false })
    expect(css).toMatchSnapshot()
  })
})
