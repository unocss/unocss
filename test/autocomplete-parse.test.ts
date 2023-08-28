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
    const parsed = parseAutocomplete('(m|p)<directions>-<percentage>')
    expect(parsed.suggest('pt-')).toMatchInlineSnapshot(`
      [
        "pt-100%",
        "pt-10%",
        "pt-20%",
        "pt-30%",
        "pt-40%",
        "pt-50%",
        "pt-60%",
        "pt-70%",
        "pt-80%",
        "pt-90%",
      ]
    `)

    const parsed2 = parseAutocomplete('text-<size>', {}, {
      size: '(sm|md|lg|xl)',
    })
    expect(parsed2.suggest('text-')).toMatchInlineSnapshot(`
      [
        "text-sm",
        "text-md",
        "text-lg",
        "text-xl",
      ]
    `)
  })

  it('theme', () => {
    const parsed = parseAutocomplete(
      'text-$colors|fontSize',
      {
        colors: {
          red: {
            100: 'red',
            200: 'darkred',
          },
          green: 'green',
          yellow: 'yellow',
          magenta: {
            100: 'magenta',
            200: 'darkmagenta',
          },
        },
        fontSize: {
          sm: '0.5em',
          md: '1em',
          lg: '1.5em',
          xl: '2em',
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
            "objects": [
              {
                "green": "green",
                "magenta": {
                  "100": "magenta",
                  "200": "darkmagenta",
                },
                "red": {
                  "100": "red",
                  "200": "darkred",
                },
                "yellow": "yellow",
              },
              {
                "lg": "1.5em",
                "md": "1em",
                "sm": "0.5em",
                "xl": "2em",
              },
            ],
            "type": "theme",
          },
        ]
      `)

    expect(parsed.suggest('text-m'))
      .toMatchInlineSnapshot(`
        [
          "text-magenta",
          "text-md",
        ]
      `)
  })
})
