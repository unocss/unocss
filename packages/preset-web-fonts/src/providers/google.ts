import type { Provider, WebFontsProviders } from '../types'

export function createGoogleCompatibleProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const sort = (weights: string[][]) => {
        const firstW = weights.map(w => w[0])
        const lastW = weights.map(w => w[1])
        return `${firstW.join(';')};${lastW.join(';')}`
      }

      const strings = fonts
        .map((i) => {
          let name = i.name.replace(/\s+/g, '+')
          if (i.weights?.length) {
            name += i.italic
              ? `:ital,wght@${sort(i.weights.map(w => [`0,${w}`, `1,${w}`]))}`
              : `:wght@${i.weights.join(';')}`
          }
          return `family=${name}`
        })
        .join('&')
      return `${host}/css2?${strings}&display=swap`
    },
  }
}

export const GoogleFontsProvider: Provider = createGoogleCompatibleProvider('google', 'https://fonts.googleapis.com')
