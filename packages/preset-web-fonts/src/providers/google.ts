import type { Provider, WebFontsProviders } from '../types'

export const GoogleFontsProvider: Provider = createGoogleProvider('google', 'https://fonts.googleapis.com')

export function createGoogleProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const strings = fonts
        .filter(i => i.provider === name)
        .map((i) => {
          let name = i.name.replace(/\s+/g, '+')
          if (i.weights?.length) {
            name += i.italic
              ? `:ital,wght@${i.weights.flatMap(i => [`0,${i}`, `1,${i}`]).sort().join(';')}`
              : `:wght@${i.weights.sort().join(';')}`
          }
          return `family=${name}`
        }).join('&')
      return `${host}/css2?${strings}&display=swap`
    },
    getFontName(font) {
      return `"${font.name}"`
    },
  }
}
