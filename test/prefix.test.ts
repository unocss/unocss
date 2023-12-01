import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetUno from '@unocss/preset-uno'

describe('prefix', () => {
  it('preset prefix', async () => {
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

    const unexpected = [
      'text-red',
      'hover:p4',
      'bar',
      'shortcut',
    ]

    const expected = [
      'h-text-red',
      'hover:h-p4',
      'bar-bar',
      'bar-shortcut',
      'h-container',
      '2xl:h-container',
      'dark:children:hover:h-space-x-4',
      'dark:hover:children:h-space-x-4',
      'dark:hover:children:h-divide-x',
      'group-hover:h-bg-red',
      'group-data-[enabled]:h-bg-green',
    ]

    const { css, matched } = await uno.generate(new Set([
      ...unexpected,
      ...expected,
    ]), { preflights: false })

    expect([...matched].sort()).toEqual(expected.sort())
    expect(css).toMatchSnapshot()
  })

  it('uses first truthy prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({
          prefix: ['', 'h-'],
        }),
      ],
    })

    expect((await uno.generate('group-hover:h-bg-red group-data-[enabled]:h-bg-green', { preflights: false })).css).toMatchSnapshot()
  })

  it('generate tagged attributify', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({
          prefix: 'h-',
          attributifyPseudo: true,
        }),
      ],
    })

    expect((await uno.generate('group-hover:h-bg-red group-data-[enabled]:h-bg-green', { preflights: false })).css).toMatchSnapshot()
  })

  it('multiple preset prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetUno({ prefix: ['h-', 'x-'] }),
      ],
      rules: [
        ['bar', { color: 'bar' }, { prefix: ['bar-', 'foo-', ''] }],
        [/^regex$/, () => ({ color: 'regex' }), { prefix: ['bar-', 'foo-', ''] }],
      ],
      shortcuts: [
        ['shortcut', 'bar-bar', { prefix: ['bar-', 'x-'] }],
      ],
    })

    const unexpected = [
      'text-red',
      'hover:p4',
      'bar',
      'shortcut',
    ]

    const expected = [
      'h-text-red',
      'hover:h-p4',

      'bar-bar',
      'foo-bar',
      'bar',

      'bar-regex',
      'foo-regex',
      'regex',

      'bar-shortcut',
      'x-shortcut',

      'h-container',
      '2xl:h-container',
    ]

    const { css, matched } = await uno.generate(new Set([
      ...unexpected,
      ...expected,
    ]), { preflights: false })

    expect([...matched].sort()).toEqual(expected.sort())
    expect(css).toMatchSnapshot()
  })
})
