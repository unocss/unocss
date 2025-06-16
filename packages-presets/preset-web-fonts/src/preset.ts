import type { Preset } from '@unocss/core'
import type { Provider, ResolvedWebFontMeta, WebFontMeta, WebFontsOptions, WebFontsProviders } from './types'
import { LAYER_IMPORTS, toArray } from '@unocss/core'
import { BunnyFontsProvider } from './providers/bunny'
import { CoolLabsFontsProvider } from './providers/coollabs'
import { FontshareProvider } from './providers/fontshare'
import { FontSourceProvider } from './providers/fontsource'
import { GoogleFontsProvider } from './providers/google'
import { NoneProvider } from './providers/none'

const builtinProviders = {
  google: GoogleFontsProvider,
  bunny: BunnyFontsProvider,
  fontshare: FontshareProvider,
  fontsource: FontSourceProvider,
  coollabs: CoolLabsFontsProvider,
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
      customFetch = fetcher,
      timeouts = {},
    } = options
    const fontLayer = 'fonts'
    const layerName = inlineImports ? fontLayer : LAYER_IMPORTS
    const processors = toArray(options.processors || [])

    const fontObject = Object.fromEntries(
      Object.entries(options.fonts || {})
        .map(([name, meta]) => [name, toArray(meta).map(m => normalizedFontMeta(m, defaultProvider))]),
    )
    const fonts = Object.values(fontObject).flatMap(i => i)

    const importCache: Record<string, Promise<string>> = {}

    async function fetchWithTimeout(url: string) {
      if (timeouts === false)
        return customFetch(url)
      const {
        warning = 1000,
        failure = 2000,
      } = timeouts

      let warned = false

      const timer = setTimeout(() => {
        console.warn(`[unocss] Fetching web fonts: ${url}`)
        warned = true
      }, warning)

      return await Promise.race([
        customFetch(url),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`[unocss] Fetch web fonts timeout.`)), failure)
        }),
      ])
        .then((res) => {
          if (warned)
            // eslint-disable-next-line no-console
            console.info(`[unocss] Web fonts fetched.`)
          return res
        })
        .finally(() => clearTimeout(timer))
    }

    async function importUrl(url: string) {
      if (inlineImports) {
        if (!importCache[url]) {
          importCache[url] = fetchWithTimeout(url)
            .catch((e) => {
              console.error(`[unocss] Failed to fetch web fonts: ${url}`)
              console.error(e)
              // eslint-disable-next-line node/prefer-global/process
              if (typeof process !== 'undefined' && process.env.CI)
                throw e
            })
        }
        return await importCache[url]
      }
      else {
        return `@import url('${url}');`
      }
    }

    const enabledProviders = Array.from(new Set(fonts.map(i => i.provider)))

    async function getCSSDefault(
      fonts: ResolvedWebFontMeta[],
      providers: Provider[] | Set<Provider>,
    ) {
      const preflights: (string | undefined)[] = []

      for (const provider of providers) {
        const fontsForProvider = fonts.filter(i => i.provider.name === provider.name)

        if (provider.getImportUrl) {
          const url = provider.getImportUrl(fontsForProvider)
          if (url)
            preflights.push(await importUrl(url))
        }

        preflights.push(await provider.getPreflight?.(fontsForProvider))
      }

      const css = preflights.filter(Boolean).join('\n')

      return css
    }

    const preset: Preset<any> = {
      name: '@unocss/preset-web-fonts',
      preflights: [
        {
          async getCSS() {
            let css: string | undefined

            for (const processor of processors) {
              const result = await processor.getCSS?.(fonts, enabledProviders, getCSSDefault)
              if (result) {
                css = result
                break
              }
            }

            if (!css) {
              css = await getCSSDefault(
                fonts,
                enabledProviders,
              )
            }
            for (const processor of processors)
              css = await processor.transformCSS?.(css) || css

            return css
          },
          layer: layerName,
        },
      ],
      layers: {
        [fontLayer]: -200,
      },
    }

    if (extendTheme) {
      preset.extendTheme = (theme, config) => {
        const hasWind4 = config.presets.some(p => p.name === '@unocss/preset-wind4')
        const themeKey = options.themeKey ?? (hasWind4 ? 'font' : 'fontFamily')

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
