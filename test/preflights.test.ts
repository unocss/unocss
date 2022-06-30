import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'

describe('preflights', () => {
  test('basic', async () => {
    const uno = createGenerator({
      preflights: [
        {
          getCSS() {
            return '.hello { text: red }'
          },
          layer: 'custom',
        },
        {
          getCSS() { return undefined },
          layer: 'void',
        },
        {
          getCSS() { return '.default-preflight {}' },
        },
      ],
      presets: [],
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })
})
