import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import presetMini from '@unocss/preset-mini'

describe('unocss generator', () => {
  test('generator can enable noMerge option', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css: css1 } = await uno.generate('top-0 focus:top-0 hover:top-0', { preflights: false, noMerge: false })
    expect(css1).toMatchSnapshot()
    const { css: css2 } = await uno.generate('top-0 focus:top-0 hover:top-0', { preflights: false, noMerge: true })
    expect(css2).toMatchSnapshot()
  })
})
