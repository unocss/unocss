import { parseAutocomplete } from '@unocss/autocomplete'
import { describe, expect, it } from 'vitest'

describe('autocomplete-parse', () => {
  it('works', () => {
    const parsed = parseAutocomplete('prefix-(border|b)-(solid|dashed|dotted|double|hidden|none)(-suffix|)')
    expect(parsed.parts)
      .toMatchInlineSnapshot(`
        [
          {
            "type": "static",
            "value": "prefix-",
          },
          {
            "type": "group",
            "values": [
              "border",
              "b",
            ],
          },
          {
            "type": "static",
            "value": "-",
          },
          {
            "type": "group",
            "values": [
              "dashed",
              "dotted",
              "double",
              "hidden",
              "solid",
              "none",
            ],
          },
          {
            "type": "group",
            "values": [
              "-suffix",
              "",
            ],
          },
        ]
      `)

    expect(parsed.suggest('prefix-b-do'))
      .toMatchInlineSnapshot(`
        [
          "prefix-b-dotted",
          "prefix-b-double",
        ]
      `)
    expect(parsed.suggest('prefix-border-'))
      .toMatchInlineSnapshot(`
        [
          "prefix-border-dashed",
          "prefix-border-dotted",
          "prefix-border-double",
          "prefix-border-hidden",
          "prefix-border-solid",
          "prefix-border-none",
        ]
      `)
  })

  it('shorthands', () => {
    const parsed = parseAutocomplete('(m|p)(x|y|t|b|l|r|s|e|)-#num')
    expect(parsed.suggest('pt-')).toMatchInlineSnapshot(`
      [
        "pt-10",
        "pt-12",
        "pt-24",
        "pt-36",
        "pt-0",
        "pt-1",
        "pt-2",
        "pt-3",
        "pt-4",
        "pt-5",
        "pt-6",
        "pt-8",
      ]
    `)
  })
})
