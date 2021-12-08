import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'

describe('order', () => {
  test('static', async() => {
    const uno = createGenerator({
      rules: [
        ['foo', { name: 'bar1' }],
        ['foo', { name: 'bar2' }],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo')
    expect(css).toContain('bar2')
  })

  test('dynamic', async() => {
    const uno = createGenerator({
      rules: [
        [/^foo$/, () => ({ name: 'bar1' })],
        [/^foo$/, () => ({ name: 'bar2' })],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo')
    expect(css).toContain('bar2')
  })
})
