import type { ResolvedWebFontMeta, WebFontsOptions } from './types'

type UseRemoteFontOptions = Required<Pick<WebFontsOptions, 'inlineImports' | 'customFetch'>>

export async function getRemoteFontsCSS(fontObject: { [k: string]: ResolvedWebFontMeta[] }, { inlineImports, customFetch }: UseRemoteFontOptions) {
  const fonts = Object.values(fontObject).flatMap(i => i)

  const importCache: Record<string, Promise<string>> = {}

  async function importUrl(url: string) {
    if (inlineImports) {
      if (!importCache[url]) {
        importCache[url] = customFetch(url).catch((e) => {
          console.error('Failed to fetch web fonts')
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

  const preflights: (string | undefined)[] = []
  const enabledProviders = new Set(fonts.map(i => i.provider))

  for (const provider of enabledProviders) {
    const fontsForProvider = fonts.filter(i => i.provider.name === provider.name)

    if (provider.getImportUrl) {
      const url = provider.getImportUrl(fontsForProvider)
      if (url)
        preflights.push(await importUrl(url))
    }

    preflights.push(provider.getPreflight?.(fontsForProvider))
  }

  return preflights.filter(Boolean).join('\n')
}
