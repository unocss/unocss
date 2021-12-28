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
    postprocess: (obj) => {
      if (obj.selector.includes(prefix)
        && obj.entries.length === 2
        && obj.entries.find(([prop]) => prop === 'font-family')
        && obj.entries.find(([prop]) => prop === 'src'))
        obj.selector = '@font-face'
    },
    rules: [[
      new RegExp(`^${prefix}([\\w]+)-(.+)$`),
      async([full, fontAlias, glyphs]: string[]): Promise<CSSValues | undefined> => {
        if (!glyphs)
          return

        const path = fonts[fontAlias]
        if (!path) {
          if (warn)
            warnOnce(`no font defined for "${fontAlias}"`)
          return
        }

        // Subset space only if there's underscore
        if (glyphs.includes('_'))
          glyphs = ` ${glyphs}`

        const fontData = await subsetFont(path, glyphs)
        if (!fontData) {
          if (warn)
            warnOnce(`failed to load/subset font "${fontAlias}" at "${path}"`)
          return
        }

        if (!aliasMap[full]) {
          // Otherwise variant version with same name will take only the latest definition
          aliasMap[full] = `${fontAlias}-${Object.keys(aliasMap).length}`
        }

        const fontName = aliasMap[full]

        return [
          {
            'font-family': fontName,
            'src': `url(data:application/x-font-ttf;charset=utf-8;base64,${fontData}) format("truetype")`,
          },
          {
            'font-family': fontName,
          },
        ]
      },
      { layer },
    ]],
  }
}

export default preset
