import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import presetWebFonts from '@unocss/preset-web-fonts'
import { expect, test } from 'vitest'

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

test('web-fonts (inline: false)', async () => {
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
  expect(css).toMatchSnapshot()
})

test('web-fonts (inline: true)', async () => {
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
