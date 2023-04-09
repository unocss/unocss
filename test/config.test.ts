import type { Preset, UserConfig } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import presetMini from '@unocss/preset-mini'
import { describe, expect, test } from 'vitest'

describe('config', () => {
  const createUno = (userConfig: UserConfig) => {
    return createGenerator<Theme>({
      ...userConfig,
      presets: [
        presetMini(),
      ],
    })
  }
  test('theme', async () => {
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

  test('extendTheme with return extend', async () => {
    const uno = createUno({
      extendTheme(mergedTheme) {
        return {
          ...mergedTheme,
          colors: {
            red: {
              500: 'red',
            },
          },
        }
      },
    })
    expect(uno.config.theme.colors).toEqual({ red: { 500: 'red' } })
  })

  test('extendTheme with return', async () => {
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
      .text-red-200{color:red;}"
    `)
  })

  test('extendTheme with mutation', async () => {
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

  test('nested presets', async () => {
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
})
