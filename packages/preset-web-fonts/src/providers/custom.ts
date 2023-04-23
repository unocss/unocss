import type { Provider, WebFontsProviders } from '../types'

export const CustomProvider: Provider = createCustomProvider('custom')

export function createCustomProvider(name: WebFontsProviders): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const urls = fonts
        .filter(i => i.provider === name)
        .map(i => i.url)

      const uniqueUrls = urls
        .filter((element, index) => urls.indexOf(element) === index)

      if (uniqueUrls.length > 1)
        throw new Error('Only one custom font provider can be used at a time')
      return uniqueUrls[0]
    },
    getFontName(font) {
      return `"${font.name}"`
    },
  }
}
