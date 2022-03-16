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
  it('should resolve autocomplete config', () => {
    expect(uno.config.autocomplete?.length).toBeGreaterThan(0)
  })

  it('should work', async() => {
    expect((await ac.suggest('m-1'))[0])
      .toMatchInlineSnapshot('"m-1"')

    expect((await ac.suggest('invalid'))[0])
      .not.toBe('invalid')
  })

  it('should provide static autocomplete', async() => {
    expect((await ac.suggest('fle')))
      .toMatchInlineSnapshot(`
        [
          "flex",
          "flex-1",
          "flex-auto",
          "flex-col",
          "flex-col-reverse",
          "flex-initial",
          "flex-inline",
          "flex-none",
          "flex-nowrap",
          "flex-row",
          "flex-row-reverse",
          "flex-wrap",
          "flex-wrap-reverse",
        ]
      `)
  })

  it('should provide dynamic autocomplete', async() => {
    expect((await ac.suggest('border-r')))
      .toMatchInlineSnapshot(`
        [
          "border-r",
          "border-rd-1",
          "border-rd-2",
          "border-rd-3",
          "border-rd-4",
          "border-rd-5",
          "border-rounded-1",
          "border-rounded-2",
          "border-rounded-3",
          "border-rounded-4",
          "border-rounded-5",
        ]
      `)
  })
})
