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
          "border-rd-",
          "border-red",
          "border-rose",
          "border-rounded-",
        ]
      `)

    expect((await ac.suggest('mx-')))
      .toMatchInlineSnapshot(`
        [
          "mx-0",
          "mx-1",
          "mx-10",
          "mx-12",
          "mx-2",
          "mx-24",
          "mx-3",
          "mx-36",
          "mx-4",
          "mx-5",
          "mx-6",
          "mx-8",
        ]
      `)

    expect((await ac.suggest('border-r')))
      .toMatchInlineSnapshot(`
        [
          "border-r",
          "border-rd-",
          "border-red",
          "border-rose",
          "border-rounded-",
        ]
      `)

    expect((await ac.suggest('text-r')))
      .toMatchInlineSnapshot(`
        [
          "text-red",
          "text-right",
          "text-rose",
        ]
      `)

    expect((await ac.suggest('text-red-')))
      .toMatchInlineSnapshot(`
        [
          "text-red-1",
          "text-red-100",
          "text-red-2",
          "text-red-200",
          "text-red-3",
          "text-red-300",
          "text-red-4",
          "text-red-400",
          "text-red-5",
          "text-red-50",
          "text-red-500",
          "text-red-6",
          "text-red-600",
          "text-red-7",
          "text-red-700",
          "text-red-8",
          "text-red-800",
          "text-red-9",
          "text-red-900",
          "text-red-DEFAULT",
        ]
      `)

    expect((await ac.suggest('font')))
      .toMatchInlineSnapshot('[]')
  })
})
