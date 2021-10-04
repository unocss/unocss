import { createGenerator } from 'unocss'

describe('order', () => {
  test('static', async() => {
    const generate = createGenerator({
      rules: [
        ['foo', { name: 'bar1' }],
        ['foo', { name: 'bar2' }],
      ],
      presets: [],
    })
    const { css } = await generate('foo')
    expect(css).toContain('bar2')
  })

  test('dynamic', async() => {
    const generate = createGenerator({
      rules: [
        [/^foo$/, () => ({ name: 'bar1' })],
        [/^foo$/, () => ({ name: 'bar2' })],
      ],
      presets: [],
    })
    const { css } = await generate('foo')
    expect(css).toContain('bar2')
  })
})
