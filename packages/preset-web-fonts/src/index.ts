import type { Preset } from '@unocss/core'
import { toArray } from '@unocss/core'
import { GoogleFontsProvider } from './providers/google'
import { NoneProvider } from './providers/none'
import type { WebFontMeta, WebFontsOptions, WebFontsProviders } from './types'

export * from './types'

const layerName = '__webfonts__'

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
    inlineImports = true,
    themeKey = 'fontFamily',
  } = options

  const fontObject = Object.fromEntries(
    Object.entries(options.fonts || {})
      .map(([name, meta]) => [name, toArray(meta).map(m => normalizedFontMeta(m, defaultProvider))]),
  )
  const fonts = Object.values(fontObject).flatMap(i => i)

  const importCache: Record<string, string> = {}

  async function importUrl(url: string) {
    if (inlineImports) {
      if (!importCache[url]) {
        try {
          const { $fetch } = await import('ohmyfetch')
          importCache[url] = await $fetch(url, { headers: {} })
        }
        catch (e) {
          console.error('Failed to fetch web fonts')
          console.error(e)
          if (typeof process !== 'undefined' && process.env.CI)
            throw e
        }
      }
      return importCache[url]
    }
    else {
      return `@import url('${url}')`
    }
  }

  const preset: Preset<any> = {
    name: '@unocss/preset-web-fonts',
    layers: { [layerName]: -40 },
    preflights: [
      {
        async getCSS() {
          const names = new Set(fonts.map(i => i.provider || defaultProvider))
          const preflights: (string | undefined)[] = []

          for (const name of names) {
            const fontsForProvider = fonts.filter(i => i.provider === name)
            const provider = providers[name]

            if (provider.getImportUrl) {
              const url = provider.getImportUrl(fontsForProvider)
              if (url)
                preflights.push(await importUrl(url))
            }

            preflights.push(provider.getPreflight?.(fontsForProvider))
          }

          return preflights.filter(Boolean).join('\n')
        },
        layer: layerName,
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
