import type { Preset } from '@unocss/core'
import { toArray } from '@unocss/core'
import { BunnyFontsProvider } from './providers/bunny'
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

function convertToLocalFontFace(css: string) {
  return css.replace(/@font-face\s*{[^}]*}/g, (match) => {
    const fontFamily = match.match(/font-family:\s*['"]([^'"]+)['"]/)?.[1]
    if (!fontFamily)
      return match
    return match.replace(/src:\s*url\(([^)]+)\)/, `src: local('${fontFamily}'), url($1)`)
  })
}

const providers = {
  google: GoogleFontsProvider,
  bunny: BunnyFontsProvider,
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

  const importCache: Record<string, Promise<string>> = {}

  async function importUrl(url: string) {
    if (inlineImports) {
      if (!importCache[url]) {
        const { $fetch } = await import('ohmyfetch')
        importCache[url] = $fetch(url, { headers: {}, retry: 3 })
          // .then(css => convertToLocalFontFace(css))
          .catch((e) => {
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

  const preset: Preset<any> = {
    name: '@unocss/preset-web-fonts',
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
                preflights.push(convertToLocalFontFace((await importUrl(url))))
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
