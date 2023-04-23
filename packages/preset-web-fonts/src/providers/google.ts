import type { Provider, WebFontsProviders } from '../types'

export function createGoogleCompatibleProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const strings = fonts
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
  }
}

export const GoogleFontsProvider: Provider = createGoogleCompatibleProvider('google', 'https://fonts.googleapis.com')
