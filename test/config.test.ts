import type { UserConfig } from '@unocss/core'
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

  test('themeResolved', async () => {
    const uno = createUno({
      themeResolved(mergedTheme) {
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

  test('extendTheme', async () => {
    const unocss = createGenerator<Theme>({
      extendTheme: (theme) => {
        theme.colors!.red = {
          100: 'red',
        }
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
      .text-red-100,
      .text-red-200{color:red;}"
    `)
  })
})
