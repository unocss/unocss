import type { Preset } from '@unocss/core'
import { toArray } from '@unocss/core'
import { LAYER_IMPORTS } from '../../core/src/constants'
import { BunnyFontsProvider } from './providers/bunny'
import { GoogleFontsProvider } from './providers/google'
import { FontshareProvider } from './providers/fontshare'
import { NoneProvider } from './providers/none'
import { isNode } from './util'
import type { Provider, ResolvedWebFontMeta, WebFontMeta, WebFontsOptions, WebFontsProviders } from './types'

const builtinProviders = {
  google: GoogleFontsProvider,
  bunny: BunnyFontsProvider,
  fontshare: FontshareProvider,
  none: NoneProvider,
}

function resolveProvider(provider: WebFontsProviders): Provider {
  if (typeof provider === 'string')
    return builtinProviders[provider]
  return provider
}

export function normalizedFontMeta(meta: WebFontMeta | string, defaultProvider: WebFontsProviders): ResolvedWebFontMeta {
  if (typeof meta !== 'string') {
    meta.provider = resolveProvider(meta.provider || defaultProvider)
    if (meta.weights)
      meta.weights = [...new Set(meta.weights.sort((a, b) => a.toString().localeCompare(b.toString(), 'en', { numeric: true })))]
    return meta as ResolvedWebFontMeta
  }

  const [name, weights = ''] = meta.split(':')

  return {
    name,
    weights: [...new Set(weights.split(/[,;]\s*/).filter(Boolean).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })))],
    provider: resolveProvider(defaultProvider),
  }
}

export function createWebFontPreset(fetcher: (url: string) => Promise<any>) {
  return (options: WebFontsOptions = {}): Preset<any> => {
    const {
      provider: defaultProvider = 'google',
      extendTheme = true,
      inlineImports = true,
      themeKey = 'fontFamily',
      customFetch = fetcher,
      downloadLocally = false,
      downloadDir,
    } = options

    const fontObject = Object.fromEntries(
      Object.entries(options.fonts || {})
        .map(([name, meta]) => [name, toArray(meta).map(m => normalizedFontMeta(m, defaultProvider))]),
    )

    const preset: Preset<any> = {
      name: '@unocss/preset-web-fonts',
      preflights: [
        {
          async getCSS() {
            if (!isNode || !downloadLocally) {
              const { getRemoteFontsCSS } = await import('./remote-font')
              return getRemoteFontsCSS(fontObject, { inlineImports, customFetch })
            }

            const { readFontCSS, resolveDownloadDir } = await import('./local-font')
            const resolvedDownloadDir = await resolveDownloadDir(downloadDir)
            return readFontCSS(resolvedDownloadDir)
          },
          layer: inlineImports ? undefined : LAYER_IMPORTS,
        },
      ],
      options: {
        downloadLocally,
        downloadDir,
        fontObject,
      },
    }

    if (extendTheme) {
      preset.extendTheme = (theme) => {
        if (!theme[themeKey])
          theme[themeKey] = {}
        const obj = Object.fromEntries(
          Object.entries(fontObject)
            .map(([name, fonts]) => [name, fonts.map(f => f.provider.getFontName?.(f) ?? `"${f.name}"`)]),
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
}
