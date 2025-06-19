import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import presetWebFonts from '@unocss/preset-web-fonts'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'

const options: WebFontsOptions = {
  provider: 'google',
  fonts: {
    // these will extend the default theme
    sans: 'Roboto',
    mono: ['Fira Code', 'Fira Mono:400,700'],
    // custom ones
    lobster: 'Lobster',
    lato: [
      {
        name: 'Lato',
        weights: ['400', '700'],
        italic: true,
      },
      {
        name: 'sans-serif',
        provider: 'none',
      },
    ],
  },
}
const classes = new Set([
  'font-sans',
  'font-mono',
  'font-lobster',
  'font-lato',
])

it('web-fonts (inline: false)', async () => {
  const uno = await createGenerator({
    presets: [
      presetMini({ preflight: false }),
      presetWebFonts({
        ...options,
        inlineImports: false,
      }),
    ],
  })

  const { css } = await uno.generate(classes)
  await expect(css).toMatchFileSnapshot('./assets/output/preset-web-fonts.css')
})

it('web-fonts (inline: true)', async () => {
  const uno = await createGenerator({
    presets: [
      presetMini({ preflight: false }),
      presetWebFonts({
        ...options,
        inlineImports: true,
      }),
    ],
  })

  const { css } = await uno.generate(classes)
  expect(css).toContain('@font-face')
})

it('web-fonts weight sort', async () => {
  const uno = await createGenerator({
    presets: [
      presetMini({ preflight: false }),
      presetWebFonts({
        provider: 'google',
        fonts: {
          mono: 'Fira Mono:1000,200',
          lato: [
            {
              name: 'Lato',
              weights: ['1000', '200'],
              italic: true,
            },
          ],
        },
        inlineImports: false,
      }),
    ],
  })

  const { css } = await uno.generate(classes)
  const importUrl = css.match(/@import url\('(.*)'\)/)![1]
  expect(importUrl).toMatchInlineSnapshot('"https://fonts.googleapis.com/css2?family=Fira+Mono:wght@200;1000&family=Lato:ital,wght@0,200;0,1000;1,200;1,1000&display=swap"')
})

it('web-fonts weight deduplicate', async () => {
  const uno = await createGenerator({
    presets: [
      presetMini({ preflight: false }),
      presetWebFonts({
        provider: 'google',
        fonts: {
          mono: 'Fira Mono:200,1000,1000',
          lato: [
            {
              name: 'Lato',
              weights: ['1000', '200', '1000', '400'],
              italic: true,
            },
          ],
        },
        inlineImports: false,
      }),
    ],
  })

  const { css } = await uno.generate(classes)
  const importUrl = css.match(/@import url\('(.*)'\)/)![1]
  expect(importUrl).toMatchInlineSnapshot('"https://fonts.googleapis.com/css2?family=Fira+Mono:wght@200;1000&family=Lato:ital,wght@0,200;0,400;0,1000;1,200;1,400;1,1000&display=swap"')
})

it('createLocalFontProcessor', async () => {
  const uno = await createGenerator({
    presets: [
      presetMini({ preflight: false }),
      presetWebFonts({
        provider: 'google',
        fonts: {
          mono: 'Fira Mono',
          lato: [
            {
              name: 'Lato',
              italic: true,
            },
          ],
        },
        processors: [
          createLocalFontProcessor({
            cacheDir: 'test/.cache/fonts',
            fontAssetsDir: 'test/assets/fonts',
            fontServeBaseUrl: '/__base__/fonts',
          }),
        ],
      }),
    ],
  })

  const { css } = await uno.generate(classes)

  expect(css).includes('url(/__base__/fonts/')

  await expect(css)
    .toMatchFileSnapshot('./assets/output/preset-web-fonts-local.css')
})

describe('fontsource provider', async () => {
  const fontMap = {
    staticFonts: ['Fira Mono'],
    variableFonts: ['Dm Sans'],
  }

  it.each(Object.entries(fontMap))('%s', async (_, fonts) => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: fonts.reduce((acc, font) => {
            acc[font.toLowerCase().replace(/\s+/g, '-')] = font
            return acc
          }, {} as any),
        }),
      ],
    })

    const { css } = await uno.generate(classes)

    expect(css).toMatchSnapshot()
  })

  it('custom wght', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: {
            fm: 'Fira Mono:400,700',
            dm: {
              name: 'Dm Sans',
              // When use variable font, `weights` will be ignored
              // So it not produce any `@font-face` for `400` and `800`
              weights: ['400', '800'],
              italic: true,
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('font-fm')

    expect(css).toMatchSnapshot()
  })

  it('custom variable', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: {
            dm: {
              name: 'Dm Sans',
              italic: true,
              variable: {
                wght: {
                  default: '400',
                  min: '200',
                  max: '800',
                  step: '1',
                },
              },
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('font-dm')

    expect(css).toMatchSnapshot()
  })

  it('specific subsets', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: {
            fm: {
              name: 'Fira Mono',
              weights: ['400', '700'],
              subsets: ['cyrillic', 'latin'],
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('font-fm')

    expect(css).toMatchSnapshot()
  })

  it('prefer static', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: {
            dm: {
              name: 'Dm Sans',
              // When `preferStatic` is true, it will use static font files
              // So it produces `@font-face` for `400` and `700`
              weights: ['400', '700'],
              preferStatic: true,
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('font-dm')

    expect(css).toMatchSnapshot()
  })

  it('numbered subsets support', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({ preflight: false }),
        presetWebFonts({
          provider: 'fontsource',
          fonts: {
            sc: {
              name: 'Noto Sans SC',
              subsets: ['chinese-simplified'],
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('font-sc')

    expect(css).toMatchSnapshot()
  })
})

it('with presetWind4', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind4({ preflights: { reset: false } }),
      presetWebFonts({
        fonts: {
          custom: {
            name: 'Fira Code',
            weights: ['400'],
          },
        },
      }),
    ],
  })

  const { css } = await uno.generate('font-custom')

  expect(css).toMatchSnapshot()
})
