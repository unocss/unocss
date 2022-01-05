import type { Preset } from '@unocss/core'
import { toArray } from '@unocss/core'
import { GoogleFontsProvider } from './providers/google'
import { NoneProvider } from './providers/none'
import type { WebFontMeta, WebFontsOptions, WebFontsProviders } from './types'

export * from './types'

export function normalizedFontMeta(meta: WebFontMeta | string, defaultProvider: WebFontsProviders): WebFontMeta {
  if (typeof meta !== 'string') {
    meta.provider = meta.provider ?? defaultProvider
    return meta
  }

  const [name, weights = ''] = meta.split(':')
  return {
    name,
    weights: weights.split(/[,;]\s*/).filter(Boolean),
    provider: defaultProvider,
  }
}

const providers = {
  google: GoogleFontsProvider,
  none: NoneProvider,
}

const preset = (options: WebFontsOptions = {}): Preset<any> => {
  const {
    provider: defaultProvider = 'google',
    extendTheme = true,
    themeKey = 'fontFamily',
  } = options

  const fontObject = Object.fromEntries(
    Object.entries(options.fonts || {})
      .map(([name, meta]) => [name, toArray(meta).map(m => normalizedFontMeta(m, defaultProvider))]),
  )
  const fonts = Object.values(fontObject).flatMap(i => i)

  const preset: Preset<any> = {
    name: '@unocss/preset-web-fonts',
    preflights: [
      {
        getCSS() {
          const names = new Set(fonts.map(i => i.provider || defaultProvider))
          const preflights = []
          for (const name of names) {
            const provider = providers[name]
            preflights.push(provider.getPreflight(fonts.filter(i => i.provider === name)))
          }
          return preflights.filter(Boolean).join('\n')
        },
        layer: '_webfonts',
      },
    ],
  }

  if (extendTheme) {
    preset.extendTheme = (theme) => {
      if (!theme[themeKey])
        theme[themeKey] = {}
      const obj = Object.fromEntries(
        Object.entries(fontObject)
          .map(([name, fonts]) => [name, fonts.map(f => providers[f.provider || defaultProvider].getFontName(f))]),
      )
      for (const key of Object.keys(obj)) {
        if (typeof theme[themeKey][key] === 'string')
          theme[themeKey][key] = obj[key].map(i => `${i},`).join('') + theme[themeKey][key]
        else
          theme[themeKey][key] = obj[key].join(',')
      }
    }
  }

  return preset
}

export default preset
