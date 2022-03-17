import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'
import { createAutocomplete, parseAutocomplete } from '@unocss/autocomplete'

const uno = createGenerator({
  presets: [
    presetUno(),
  ],
})

const ac = createAutocomplete(uno)

describe('autocomplete', () => {
  it('should resolve autocomplete config', () => {
    expect(ac.templates.length).toBeGreaterThan(0)

    ac.templates.forEach((i) => {
      if (typeof i === 'string')
        parseAutocomplete(i, uno.config.theme)
    })
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

    expect((await ac.suggest('b-x-')))
      .toMatchInlineSnapshot(`
        [
          "b-x-0",
          "b-x-1",
          "b-x-10",
          "b-x-12",
          "b-x-2",
          "b-x-24",
          "b-x-3",
          "b-x-36",
          "b-x-4",
          "b-x-5",
          "b-x-6",
          "b-x-8",
          "b-x-amber",
          "b-x-black",
          "b-x-blue",
          "b-x-blueGray",
          "b-x-bluegray",
          "b-x-coolGray",
          "b-x-coolgray",
          "b-x-current",
          "b-x-cyan",
          "b-x-dark",
          "b-x-emerald",
          "b-x-fuchsia",
          "b-x-gray",
          "b-x-green",
          "b-x-indigo",
          "b-x-inherit",
          "b-x-light",
          "b-x-lightBlue",
          "b-x-lightblue",
          "b-x-lime",
          "b-x-neutral",
          "b-x-orange",
          "b-x-pink",
          "b-x-purple",
          "b-x-red",
          "b-x-rose",
          "b-x-sky",
          "b-x-slate",
          "b-x-stone",
          "b-x-teal",
          "b-x-transparent",
          "b-x-trueGray",
          "b-x-truegray",
          "b-x-violet",
          "b-x-warmGray",
          "b-x-warmgray",
          "b-x-white",
          "b-x-yellow",
          "b-x-zinc",
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

    expect((await ac.suggest('bg-o')))
      .toMatchInlineSnapshot(`
        [
          "bg-op",
          "bg-opacity",
          "bg-orange",
          "bg-origin-border",
          "bg-origin-content",
          "bg-origin-padding",
        ]
      `)

    expect((await ac.suggest('bg-op-')))
      .toMatchInlineSnapshot(`
        [
          "bg-op-0",
          "bg-op-10",
          "bg-op-100",
          "bg-op-20",
          "bg-op-30",
          "bg-op-40",
          "bg-op-50",
          "bg-op-60",
          "bg-op-70",
          "bg-op-80",
          "bg-op-90",
        ]
      `)

    expect((await ac.suggest('v-')))
      .toMatchInlineSnapshot(`
        [
          "v-base",
          "v-baseline",
          "v-bottom",
          "v-btm",
          "v-mid",
          "v-middle",
          "v-sub",
          "v-super",
          "v-text-bottom",
          "v-text-top",
          "v-top",
        ]
      `)

    expect((await ac.suggest('outline-')))
      .toMatchInlineSnapshot(`
        [
          "outline-amber",
          "outline-auto",
          "outline-black",
          "outline-blue",
          "outline-blueGray",
          "outline-bluegray",
          "outline-coolGray",
          "outline-coolgray",
          "outline-current",
          "outline-cyan",
          "outline-dark",
          "outline-dashed",
          "outline-dotted",
          "outline-double",
          "outline-emerald",
          "outline-fuchsia",
          "outline-gray",
          "outline-green",
          "outline-groove",
          "outline-hidden",
          "outline-indigo",
          "outline-inherit",
          "outline-initial",
          "outline-inset",
          "outline-light",
          "outline-lightBlue",
          "outline-lightblue",
          "outline-lime",
          "outline-neutral",
          "outline-none",
          "outline-offset",
          "outline-orange",
          "outline-outset",
          "outline-pink",
          "outline-purple",
          "outline-red",
          "outline-revert",
          "outline-ridge",
          "outline-rose",
          "outline-size",
          "outline-sky",
          "outline-slate",
          "outline-solid",
          "outline-stone",
          "outline-teal",
          "outline-transparent",
          "outline-trueGray",
          "outline-truegray",
          "outline-unset",
          "outline-violet",
          "outline-warmGray",
          "outline-warmgray",
          "outline-white",
          "outline-width",
          "outline-yellow",
          "outline-zinc",
        ]
      `)

    expect((await ac.suggest('font')))
      .toMatchInlineSnapshot('[]')
  })
})
