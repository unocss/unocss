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

async function enumerateSuggestions(inputs: string[]) {
  return Object.fromEntries(await Promise.all(inputs.map(async input => [
    input,
    (await ac.suggest(input)).slice(0, 10).join(' '),
  ])))
}

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

  it('should provide autocomplete', async() => {
    expect(
      await enumerateSuggestions([
        // sort this list in alphabetical order
        'border-r',
        'border',
        'fle',
        'font-',
        'leading-',
        'm-',
        'mx-',
        'text-r',
        'text-red-',
        'bg-',
        'bg-r',
        'v-',
        'align-',
        'outline-',
        'outline-offset-',
      ]),
    ).toMatchInlineSnapshot(`
      {
        "align-": "align-base align-baseline align-bottom align-btm align-mid align-middle align-sub align-super align-text-bottom align-text-top",
        "bg-": "bg-amber bg-auto bg-black bg-blend-color bg-blend-color-burn bg-blend-color-dodge bg-blend-darken bg-blend-difference bg-blend-exclusion bg-blend-hard-light",
        "bg-r": "bg-red bg-repeat bg-repeat-round bg-repeat-space bg-repeat-x bg-repeat-y bg-rose",
        "border": "border border-collapse border-dashed border-dotted border-double border-hidden border-none border-separate border-solid",
        "border-r": "border-r border-red border-rose",
        "fle": "flex flex-1 flex-auto flex-col flex-col-reverse flex-initial flex-inline flex-none flex-nowrap flex-row",
        "font-": "font-100 font-200 font-300 font-400 font-500 font-600 font-700 font-mono font-sans font-serif",
        "leading-": "leading-loose leading-none leading-normal leading-relaxed leading-snug leading-tight",
        "m-": "m-0 m-1 m-2 m-3 m-4 m-5 m-6 m-8 m-10 m-12",
        "mx-": "mx-0 mx-1 mx-2 mx-3 mx-4 mx-5 mx-6 mx-8 mx-10 mx-12",
        "outline-": "outline-amber outline-auto outline-black outline-blue outline-bluegray outline-blueGray outline-coolgray outline-coolGray outline-current outline-cyan",
        "outline-offset-": "outline-offset-0 outline-offset-1 outline-offset-2 outline-offset-3 outline-offset-4 outline-offset-5 outline-offset-6 outline-offset-8 outline-offset-10 outline-offset-12",
        "text-r": "text-red text-right text-rose",
        "text-red-": "text-red-1 text-red-2 text-red-3 text-red-4 text-red-5 text-red-6 text-red-7 text-red-8 text-red-9 text-red-50",
        "v-": "v-base v-baseline v-bottom v-btm v-mid v-middle v-sub v-super v-text-bottom v-text-top",
      }
    `)
  })

  it('should provide skip DEFAULT', async() => {
    expect((await ac.suggest('text-red-')))
      .toMatchInlineSnapshot(`
        [
          "text-red-1",
          "text-red-2",
          "text-red-3",
          "text-red-4",
          "text-red-5",
          "text-red-6",
          "text-red-7",
          "text-red-8",
          "text-red-9",
          "text-red-50",
          "text-red-100",
          "text-red-200",
          "text-red-300",
          "text-red-400",
          "text-red-500",
          "text-red-600",
          "text-red-700",
          "text-red-800",
          "text-red-900",
        ]
      `)
  })
})
