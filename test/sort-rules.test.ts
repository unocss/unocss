import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'
import { sortRules } from '../packages/shared-integration/src/sort-rules'

describe('sort rules', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })

  async function sort(tokens: string) {
    const result = await sortRules(tokens.split(' '), uno)
    return [...result.sorted, ...result.unknown].join(' ')
  }
  test('basic', async () => {
    expect(await sort('pt-2 p-4 foo'))
      .toMatchInlineSnapshot('"p-4 pt-2 foo"')
    expect(await sort('hover:focus:p1 hover:mt1 hover:m2 pt-2 p-4'))
      .toMatchInlineSnapshot('"p-4 pt-2 hover:m2 hover:mt1 hover:focus:p1"')
    expect(await sort('hover:opacity-75 opacity-50 hover:scale-150 scale-125'))
      .toMatchInlineSnapshot('"scale-125 opacity-50 hover:scale-150 hover:opacity-75"')
    expect(await sort('lg:grid-cols-4 grid sm:grid-cols-3 grid-cols-2'))
      .toMatchInlineSnapshot('"grid grid-cols-2 lg:grid-cols-4 sm:grid-cols-3"')
  })
})
