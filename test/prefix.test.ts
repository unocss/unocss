import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import presetMini from '@unocss/preset-mini'

describe('prefix', () => {
  test('preset prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetMini({ prefix: 'foo-' }),
      ],
      rules: [
        ['bar', { color: 'bar' }, { prefix: 'bar-' }],
      ],
      shortcuts: [
        ['shortcut', 'bar-bar', { prefix: 'bar-' }],
      ],
    })

    const { css, matched } = await uno.generate(new Set([
      'text-red',
      'hover:p4',
      'bar',
      'shortcut',
      // expected
      'foo-text-red',
      'hover:foo-p4',
      'bar-bar',
      'bar-shortcut',
    ]), { preflights: false })

    expect(matched).toMatchInlineSnapshot(`
      Set {
        "bar-bar",
        "foo-text-red",
        "hover:foo-p4",
        "bar-shortcut",
      }
    `)

    expect(css).toMatchSnapshot()
  })
})
