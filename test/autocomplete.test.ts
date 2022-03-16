import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'
import { createAutocomplete } from '@unocss/autocomplete'

const uno = createGenerator({
  presets: [
    presetUno(),
  ],
})

const ac = createAutocomplete(uno)

describe('autocomplete', () => {
  it('should work', () => {
    expect(ac.suggest('m-1')[0]).toMatchInlineSnapshot('"m-1"')
  })
})
