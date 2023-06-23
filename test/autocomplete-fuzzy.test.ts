import { createAutocomplete } from '@unocss/autocomplete'
import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import presetUno from '@unocss/preset-uno'

describe('autocomplete-fuzzy', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
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
})
