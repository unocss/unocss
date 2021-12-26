import type { Rule } from '@unocss/core'
import { e } from '@unocss/core'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fontmin = require('fontmin')

// Copy font files here. Actual variable should be in preset config
const fontList: Record<string, string> = {
  webdings: './packages/preset-mini/fonts/webdings.ttf',
}

export const glyphs: Rule[] = [
  [/^glyph-([\w]+)-(.+)$/, ([, font, glyphs]: string[], { rawSelector }) => {
    const path = fontList[font]
    if (path) {
      return new Promise<string | undefined>((resolve) => {
        const f = new Fontmin()
          // Load font file
          .src(path)

          // Subset glyphs
          .use(Fontmin.glyph({ text: glyphs }))

          // Save as base64. I cannot figure out how to get out just the raw ttf font data
          .use(Fontmin.css({ base64: true }))

        f.run((err: any, files: any[]) => {
          if (err)
            return resolve(undefined)

          const fontName = `un-${font}`

          // The @font-face selector. Search inside fontmin source for font-face.tpl
          const fontMinCss = files[1].contents.toString()

          // Take out the font data
          const base64FontData = fontMinCss.replace(/^[\s\S]*?;base64,([^)]+)\)[\s\S]*$/, '$1')

          // Redo the @font-face with less properties than the original
          const fontCss = `@font-face{font-family:"${fontName}";src:url(data:application/x-font-ttf;charset=utf-8;base64,${base64FontData}) format("truetype");}`

          // Apply the font to the selector
          const css = `.${e(rawSelector)}{font-family:"${fontName}";}`

          resolve(`${fontCss}\n${css}`)
        })
      })
    }
  }],
]
