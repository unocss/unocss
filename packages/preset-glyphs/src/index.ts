import type { CSSValues, Preset } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import { subsetFont } from './utils'
import type { GlyphsOptions } from './types'

export { GlyphsOptions }

export const preset = (options: GlyphsOptions = {}): Preset => {
  const {
    prefix = 'g-',
    warn = false,
    layer = 'glyphs',
    fonts = {},
  } = options

  const aliasMap: Record<string, string> = {}

  return {
    name: '@unocss/preset-glyphs',
    enforce: 'pre',
    options,
    layers: {
      glyphs: -10,
    },
    rules: [[
      new RegExp(`^${prefix}([\\w]+)-(.+)$`),
      async([full, fontAlias, glyphs]: string[]): Promise<CSSValues | undefined> => {
        if (!glyphs)
          return

        const path = fonts[fontAlias]
        if (!path) {
          if (warn)
            warnOnce(`failed to load font "${fontAlias}" at "${path}"`)
          return
        }

        // Always subset space
        const fontData = await subsetFont(path, ` ${glyphs}`)
        if (!fontData) {
          if (warn)
            warnOnce(`failed to subset font "${fontAlias}"`)
          return
        }

        if (!aliasMap[full]) {
          // Otherwise variant version with same name will take only the latest definition
          aliasMap[full] = `${fontAlias}-${Object.keys(aliasMap).length}`
        }

        const fontName = aliasMap[full]
        const url = `data:application/x-font-ttf;charset=utf-8;base64,${fontData}`
        const rule = `@font-face{font-family:"${fontName}";src:url(${url}) format("truetype");}`

        return [
          [
            [`--un-dummy:none;}\n${rule}\n.un-dummy{--un-dummy`, 'none'], // TODO: raw string CSSValues support
          ],
          { 'font-family': fontName },
        ]
      },
      { layer },
    ]],
  }
}

export default preset
