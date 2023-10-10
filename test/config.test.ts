import type { Preset, UserConfig } from '@unocss/core'
import { createGenerator, mergeConfigs } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import presetMini from '@unocss/preset-mini'
import { describe, expect, it } from 'vitest'

describe('config', () => {
  const createUno = (userConfig: UserConfig) => {
    return createGenerator<Theme>({
      ...userConfig,
      presets: [
        presetMini(),
      ],
    })
  }
  it('theme', async () => {
    const uno = createUno({
      theme: {
        colors: {
          red: {
            500: '#0f0',
          },
        },
      },
    })
    const { css } = await uno.generate('text-red-500 text-blue', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-blue{--un-text-opacity:1;color:rgba(96,165,250,var(--un-text-opacity));}
      .text-red-500{--un-text-opacity:1;color:rgba(0,255,0,var(--un-text-opacity));}"
    `)
  })

  it('extendTheme with return extend', async () => {
    const uno = createUno({
      extendTheme() {
        return {
          colors: {
            red: {
              500: 'red',
            },
          },
        }
      },
    })
    expect(uno.config.theme.colors!.red).toMatchInlineSnapshot(`
      {
        "1": "#fee2e2",
        "100": "#fee2e2",
        "2": "#fecaca",
        "200": "#fecaca",
        "3": "#fca5a5",
        "300": "#fca5a5",
        "4": "#f87171",
        "400": "#f87171",
        "5": "#ef4444",
        "50": "#fef2f2",
        "500": "red",
        "6": "#dc2626",
        "600": "#dc2626",
        "7": "#b91c1c",
        "700": "#b91c1c",
        "8": "#991b1b",
        "800": "#991b1b",
        "9": "#7f1d1d",
        "900": "#7f1d1d",
        "950": "#450a0a",
        "DEFAULT": "#f87171",
      }
    `)
  })

  it('extendTheme with return', async () => {
    const unocss = createGenerator<Theme>({
      extendTheme: () => {
        return {
          colors: {
            red: {
              200: 'red',
            },
          },
        }
      },
      presets: [
        presetMini(),
      ],
    })
    const { css } = await unocss.generate('text-red-100 text-red-200', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red-100{--un-text-opacity:1;color:rgba(254,226,226,var(--un-text-opacity));}
      .text-red-200{color:red;}"
    `)
  })

  it('extendTheme with mutation', async () => {
    const unocss = createGenerator<Theme>({
      extendTheme: (theme) => {
        // @ts-expect-error test
        theme.colors.red[100] = 'green'
        // @ts-expect-error test
        theme.colors.red[200] = 'red'
      },
      presets: [
        presetMini(),
      ],
    })
    const { css } = await unocss.generate('text-red-100 text-red-200', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red-100{color:green;}
      .text-red-200{color:red;}"
    `)
  })

  it('nested presets', async () => {
    const presetA: Preset = {
      name: 'presetA',
      rules: [
        ['text-red-500', { color: 'red' }],
        ['bg-red-500', { backgroundColor: 'red' }],
      ],
      shortcuts: {
        'text-red': 'text-red-500',
      },
    }
    const presetB: Preset = {
      name: 'presetB',
      rules: [
        ['text-yellow-500', { color: 'yellow' }],
        ['bg-yellow-500', { backgroundColor: 'yellow' }],
      ],
      shortcuts: [{
        btn: 'text-red bg-yellow-500',
      }],
      presets: [
        presetA,
      ],
    }

    const uno = createGenerator({
      presets: [
        presetB,
      ],
    })

    expect(uno.config.presets.map(i => i.name))
      .toEqual(['presetB', 'presetA'])

    const { css } = await uno.generate('btn text-red text-yellow-500', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .btn{backgroundColor:yellow;color:red;}
      .text-red{color:red;}
      /* layer: default */
      .text-yellow-500{color:yellow;}"
    `)
  })

  it('uniq presets', async () => {
    const presetA: Preset = { name: 'presetA' }
    const presetB: Preset = { name: 'presetB' }
    const presetC: Preset = { name: 'presetC', presets: [presetA] }

    const unoA = createGenerator({
      presets: [
        presetA,
        presetB,
        presetA,
      ],
    })

    expect(unoA.config.presets.map(i => i.name)).toEqual(['presetA', 'presetB'])

    const unoB = createGenerator({
      presets: [
        presetA,
        presetB,
        presetC,
      ],
    })

    expect(unoB.config.presets.map(i => i.name)).toEqual(['presetA', 'presetB', 'presetC'])
  })
})

describe('mergeConfigs', () => {
  it('basic', () => {
    expect(mergeConfigs([
      {
        shortcuts: {
          foo: 'string',
        },
      },
      {
        shortcuts: [
          {
            bar: 'string',
          },
          [/a/i, () => 'a'],
        ],
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "shortcuts": [
            {
              "foo": "string",
            },
            {
              "bar": "string",
            },
            [
              /a/i,
              [Function],
            ],
          ],
        }
      `)
  })
  it('theme', () => {
    expect(mergeConfigs([
      {
        theme: {
          fontSize: {
            sm: ['0.875rem', '1.125rem'],
            md: ['1.125rem', '1.5rem'],
            lg: ['1.25rem', '1.5rem'],
          },
        },
      },
      {
        theme: {
          fontSize: {
            sm: ['1rem', '1.125rem'],
            xl: ['1.5rem', '1.75rem'],
          },
        },
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "theme": {
            "fontSize": {
              "lg": [
                "1.25rem",
                "1.5rem",
              ],
              "md": [
                "1.125rem",
                "1.5rem",
              ],
              "sm": [
                "1rem",
                "1.125rem",
              ],
              "xl": [
                "1.5rem",
                "1.75rem",
              ],
            },
          },
        }
      `)
  })
})
