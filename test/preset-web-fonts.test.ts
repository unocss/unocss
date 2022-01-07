import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import presetWebFonts from '@unocss/preset-web-fonts'
import { expect, test } from 'vitest'

for (const inline of [true, false]) {
  test(`web-fonts (inline: ${inline})`, async() => {
    const uno = createGenerator({
      presets: [
        presetMini(),
        presetWebFonts({
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
          inlineImports: inline,
        }),
      ],
    })

    const { css } = await uno.generate(new Set([
      'font-sans',
      'font-mono',
      'font-lobster',
      'font-lato',
    ]))

    expect(css).toMatchSnapshot()
  })
}
