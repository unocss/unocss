import { createGenerator, movePseudoElementsEnd } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import { variantMatcher } from '@unocss/preset-mini/utils'
import presetMini from '@unocss/preset-mini'

describe('order', () => {
  test('static', async () => {
    const uno = createGenerator({
      rules: [
        ['foo', { name: 'bar1' }],
        ['foo', { name: 'bar2' }],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  test('dynamic', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo$/, () => ({ name: 'bar1' })],
        [/^foo$/, () => ({ name: 'bar2' })],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  test('variant ordering', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => `.light $$ ${input}`),
        variantMatcher('group', input => `.group ${input}`),
        (v, ctx) => {
          const match = variantMatcher('dark', input => `.dark $$ ${input}`).match(v, ctx)
          if (typeof match === 'object') {
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
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  test('multiple variant sorting', async () => {
    const uno = createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:group-hover:group-focus-within:bg-blue-600',
      'group-hover:group-focus-within:dark:bg-red-600',
    ].join(' '), { preflights: false })

    expect(css).toMatchSnapshot()
  })

  test('movePseudoElementsEnd', () => {
    expect(movePseudoElementsEnd('.marker\\:file\\:hover\\:selection\\:mb-4::marker::file-selector-button:hover::selection'))
      .toMatchSnapshot()
  })

  test('variant sorting', async () => {
    const uno = createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ foo: m })],
      ],
      presets: [],
      variants: [
        (input: string) => {
          const m = input.match(/^(\w+):/)
          if (m) {
            return {
              matcher: input.slice(m[0].length),
              selector: s => `${m[1]} ${s}`,
              sort: {
                pre: -1,
                post: 1,
              }[m[1]],
            }
          }
        },
      ],
    })
    const code = [
      'any:foo-1',
      'post:foo-1',
      'pre:foo-1',
      'zzz:foo-1',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })
})
