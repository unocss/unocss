import { createGenerator } from '@unocss/core'

describe('preflights', () => {
  test('basic', async() => {
    const uno = createGenerator({
      preflights: [
        {
          getCSS() {
            return '.hello { text: red }'
          },
          layer: 'preflight',
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
