import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import presetWebFonts from '@unocss/preset-web-fonts'
import { expect, it } from 'vitest'

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
  const uno = createGenerator({
    presets: [
      presetMini(),
      presetWebFonts({
        ...options,
        inlineImports: false,
      }),
    ],
  })

  const { css } = await uno.generate(classes)
  expect(css).toMatchFileSnapshot('./assets/output/preset-web-fonts.css')
})

it('web-fonts (inline: true)', async () => {
  const uno = createGenerator({
    presets: [
      presetMini(),
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
  const uno = createGenerator({
    presets: [
      presetMini(),
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
  const uno = createGenerator({
    presets: [
      presetMini(),
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
