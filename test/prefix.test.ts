import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import presetUno from '@unocss/preset-uno'

describe('prefix', () => {
  test('preset prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({ prefix: 'foo-' }),
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
      'foo-container',
      '2xl:foo-container',
    ]), { preflights: false })

    expect(matched).toMatchInlineSnapshot(`
      Set {
        "bar-bar",
        "foo-text-red",
        "hover:foo-p4",
        "bar-shortcut",
        "foo-container",
        "2xl:foo-container",
      }
    `)

    expect(css).toMatchSnapshot()
  })
})
