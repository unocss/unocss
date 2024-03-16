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
              "solid",
              "dashed",
              "dotted",
              "double",
              "hidden",
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
          "prefix-border-solid-suffix",
          "prefix-border-dashed-suffix",
          "prefix-border-dotted-suffix",
          "prefix-border-double-suffix",
          "prefix-border-hidden-suffix",
          "prefix-border-none-suffix",
          "prefix-border-solid",
          "prefix-border-dashed",
          "prefix-border-dotted",
          "prefix-border-double",
          "prefix-border-hidden",
          "prefix-border-none",
        ]
      `)
  })

  it('shorthands', () => {
    const parsed = parseAutocomplete('(m|p)<directions>-<num>')
    expect(parsed.suggest('pt-')).toMatchInlineSnapshot(`
      [
        "pt-0",
        "pt-1",
        "pt-2",
        "pt-3",
        "pt-4",
        "pt-5",
        "pt-6",
        "pt-8",
        "pt-10",
        "pt-12",
        "pt-24",
        "pt-36",
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

    const parsed3 = parseAutocomplete('w-<percentage>')
    expect(parsed3.suggest('w-')).toMatchInlineSnapshot(`
      [
        "w-10%",
        "w-20%",
        "w-30%",
        "w-40%",
        "w-50%",
        "w-60%",
        "w-70%",
        "w-80%",
        "w-90%",
        "w-100%",
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
