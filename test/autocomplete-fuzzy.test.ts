import { createAutocomplete } from '@unocss/autocomplete'
import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetMini from '@unocss/preset-mini'

describe('autocomplete-fuzzy', () => {
  const uno = createGenerator({
    presets: [
      presetMini(),
    ],
    shortcuts: [
      {
        'foo': 'text-red',
        'foo-bar': 'text-red',
      },
      [/^bg-mode-(.+)$/, ([, mode]) => `bg-blend-${mode}`, { autocomplete: ['bg-mode-(color|normal)'] }],
    ],
  })

  const ac = createAutocomplete(uno, {
    matchType: 'fuzzy',
  })

  it('static', async () => {
    expect(await ac.suggest('itct'))
      .includes('items-center')

    expect(await ac.suggest('jc'))
      .includes('justify-center')
  })

  it('variant', async () => {
    expect(await ac.suggest('tsm'))
      .includes('text-sm')

    expect(await ac.suggest('tbl5'))
      .includes('text-blue-500')
  })

  it('shortcuts', async () => {
    expect(await ac.suggest('fb'))
      .includes('foo-bar')
    expect(await ac.suggest('bmc'))
      .includes('bg-mode-color')
  })

  it('group', async () => {
    const suggestions = await ac.suggest('ab')
    expect((suggestions).includes('absolute')).toBe(true)
  })

  it('order', async () => {
    const suggestions = await ac.suggest('ga')
    expect(suggestions.indexOf('gap-0')).toBeLessThan(suggestions.indexOf('gap-1'))
  })
})
