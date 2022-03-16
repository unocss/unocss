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
          "flex-inline",
          "flex-1",
          "flex-auto",
          "flex-initial",
          "flex-none",
          "flex-row",
          "flex-row-reverse",
          "flex-col",
          "flex-col-reverse",
          "flex-wrap",
          "flex-wrap-reverse",
          "flex-nowrap",
          "inject-fle",
        ]
      `)
  })

  it('should provide dynamic autocomplete', async() => {
    expect((await ac.suggest('border-')))
      .toMatchInlineSnapshot(`
        [
          "border-collapse",
          "border-separate",
          "border-solid",
          "border-dashed",
          "border-dotted",
          "border-double",
          "border-hidden",
          "border-none",
          "inject-border-",
        ]
      `)
  })
})
