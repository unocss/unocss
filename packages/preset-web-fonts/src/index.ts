import type { Preset } from '@unocss/core'
import { toArray } from '@unocss/core'
import { BunnyFontsProvider } from './providers/bunny'
import { GoogleFontsProvider } from './providers/google'
import { FontshareProvider } from './providers/fontshare'
import { NoneProvider } from './providers/none'
import type { Provider, ResolvedWebFontMeta, WebFontMeta, WebFontsOptions, WebFontsProviders } from './types'

export * from './types'

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
    return meta as ResolvedWebFontMeta
  }

  const [name, weights = ''] = meta.split(':')

  return {
    name,
    weights: weights.split(/[,;]\s*/).filter(Boolean),
    provider: resolveProvider(defaultProvider),
  }
}

function preset(options: WebFontsOptions = {}): Preset<any> {
  const {
    provider: defaultProvider = 'google',
    extendTheme = true,
    inlineImports = true,
    themeKey = 'fontFamily',
    customFetch,
  } = options

  const fontObject = Object.fromEntries(
    Object.entries(options.fonts || {})
      .map(([name, meta]) => [name, toArray(meta).map(m => normalizedFontMeta(m, defaultProvider))]),
  )
  const fonts = Object.values(fontObject).flatMap(i => i)

  const importCache: Record<string, Promise<string>> = {}

  async function importUrl(url: string) {
    if (inlineImports) {
      if (!importCache[url]) {
        const userAgentWoff2 = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        const promise = customFetch
          ? customFetch(url)
          : (await import('ofetch')).$fetch(url, { headers: { 'User-Agent': userAgentWoff2 }, retry: 3 })
        importCache[url] = promise.catch((e) => {
          console.error('Failed to fetch web fonts')
          console.error(e)
          if (typeof process !== 'undefined' && process.env.CI)
            throw e
        })
      }
      return await importCache[url]
    }
    else {
      return `@import url('${url}')`
    }
  }

  const enabledProviders = new Set(fonts.map(i => i.provider))

  const preset: Preset<any> = {
    name: '@unocss/preset-web-fonts',
    preflights: [
      {
        async getCSS() {
          const preflights: (string | undefined)[] = []

          for (const provider of enabledProviders) {
            const fontsForProvider = fonts.filter(i => i.provider === provider)

            if (provider.getImportUrl) {
              const url = provider.getImportUrl(fontsForProvider)
              if (url)
                preflights.push(await importUrl(url))
            }

            preflights.push(provider.getPreflight?.(fontsForProvider))
          }

          return preflights.filter(Boolean).join('\n')
        },
      },
    ],
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

export default preset
