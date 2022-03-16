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
          "prefix-b-dotted-suffix",
          "prefix-b-double-suffix",
          "prefix-b-dotted",
          "prefix-b-double",
        ]
      `)
    expect(parsed.suggest('prefix-border-'))
      .toMatchInlineSnapshot(`
        [
          "prefix-border-dashed-suffix",
          "prefix-border-dotted-suffix",
          "prefix-border-double-suffix",
          "prefix-border-hidden-suffix",
          "prefix-border-solid-suffix",
          "prefix-border-none-suffix",
          "prefix-border-dashed",
          "prefix-border-dotted",
          "prefix-border-double",
          "prefix-border-hidden",
          "prefix-border-solid",
          "prefix-border-none",
        ]
      `)
  })
})
