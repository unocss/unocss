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
            "value": "prefix-(border|b)-(solid|dashed|dotted|double|hidden|none)(-suffix|)",
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
            "value": "prefix-(border|b)-(solid|dashed|dotted|double|hidden|none)(-suffix|)",
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
      .toMatchInlineSnapshot('[]')
    expect(parsed.suggest('prefix-border-'))
      .toMatchInlineSnapshot('[]')
  })

  it('shorthands', () => {
    const parsed = parseAutocomplete('(m|p)(x|y|t|b|l|r|s|e|)-#num')
    expect(parsed.suggest('pt-')).toMatchInlineSnapshot('[]')
  })

  it('theme', () => {
    const parsed = parseAutocomplete(
      'text-$colors',
      {
        colors: {
          red: {},
          green: {},
          yellow: {},
        },
      },
    )
    expect(parsed.parts)
      .toMatchInlineSnapshot(`
        [
          {
            "type": "static",
            "value": "text-",
          },
          {
            "type": "group",
            "values": [
              "red",
              "green",
              "yellow",
            ],
          },
        ]
      `)

    expect(parsed.suggest('prefix-b-do'))
      .toMatchInlineSnapshot('[]')
    expect(parsed.suggest('prefix-border-'))
      .toMatchInlineSnapshot('[]')
  })
})
