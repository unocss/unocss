import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import presetUno from '@unocss/preset-uno'

describe('prefix', () => {
  test('preset prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({ prefix: 'h-' }),
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
      'h-text-red',
      'hover:h-p4',
      'bar-bar',
      'bar-shortcut',
      'h-container',
      '2xl:h-container',
    ]), { preflights: false })

    expect(matched).toMatchInlineSnapshot(`
      Set {
        "bar-bar",
        "h-text-red",
        "hover:h-p4",
        "bar-shortcut",
        "h-container",
        "2xl:h-container",
      }
    `)

    expect(css).toMatchSnapshot()
  })
})
