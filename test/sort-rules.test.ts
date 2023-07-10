import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'
import { sortRules } from '../packages/shared-integration/src/sort-rules'

describe('sort rules', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    shortcuts: [
      {
        'flex-center': 'items-center',
        'disblock': 'block',
        'bg-my-white': 'bg-white',
      }
    ]
  })

  async function sort(tokens: string) {
    return await sortRules(tokens, uno)
  }

  test('basic', async () => {
    expect(await sort('pt-2 p-4 foo'))
      .toMatchInlineSnapshot('"foo p-4 pt-2"')
    expect(await sort('hover:focus:p1 hover:mt1 hover:m2 pt-2 p-4'))
      .toMatchInlineSnapshot('"hover:focus:p1 hover:m2 hover:mt1 p-4 pt-2"')
    expect(await sort('hover:opacity-75 opacity-50 hover:scale-150 scale-125'))
      .toMatchInlineSnapshot('"hover:opacity-75 hover:scale-150 opacity-50 scale-125"')
    expect(await sort('lg:grid-cols-4 grid sm:grid-cols-3 grid-cols-2'))
      .toMatchInlineSnapshot('"grid grid-cols-2 lg:grid-cols-4 sm:grid-cols-3"')
    expect(await sort('items-center py1 bg-gray:20 pl3 pr2 rounded-full text-xs op50 hover:op100'))
      .toMatchInlineSnapshot('"bg-gray:20 hover:op100 items-center op50 pl3 pr2 py1 rounded-full text-xs"')
  })

  test('variant group', async () => {
    expect(await sort('hover:pt-2 hover:p-4 foo'))
      .toMatchInlineSnapshot('"foo hover:p-4 hover:pt-2"')
    expect(await sort('hover:(pt-2 p-4) hover:text-red hover:focus:(m1 mx2) foo'))
      .toMatchInlineSnapshot('"foo hover:focus:(m1 mx2) hover:(p-4 pt-2 text-red)"')
  })

  test('shortcuts variant', async () => {
    expect(await sort('flex-center disblock bg-my-white items-center'))
      .toMatchInlineSnapshot('"bg-my-white disblock flex-center items-center"')
  })
})
