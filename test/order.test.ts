import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import { variantMatcher } from '@unocss/preset-mini/utils'

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

  test('variant', async() => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => `.light $$ ${input}`),
        variantMatcher('group', input => `.group ${input}`),
        (v) => {
          const match = variantMatcher('dark', input => `.dark $$ ${input}`)(v)
          if (match) {
            return {
              ...match,
              order: 1,
            }
          }
        },
      ],
    })
    const code = [
      'light:group:foo-1',
      'group:light:foo-2',
      'dark:group:foo-3',
      'group:dark:foo-4',
    ].join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })
})
