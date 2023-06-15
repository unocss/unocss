import type { Provider, WebFontsProviders } from '../types'

export function createBunnyFontsProvider(
  name: WebFontsProviders,
  host: string,
): Provider {
  return {
    name,
    getImportUrl(fonts): string {
      const fontFamilies = fonts.map((font) => {
        const { name, weights = [400], italic } = font
        const formattedName = name.toLowerCase().replace(/\s/g, '-')
        const weightString = weights ? weights.join(',') : ''
        const italicSuffix = italic ? 'i' : ''
        return `${formattedName}:${weightString}${italicSuffix}`
      })

      return `${host}/css?family=${fontFamilies.join('|')}`
    },
  }
}

export const BunnyFontsProvider: Provider = createBunnyFontsProvider(
  'bunny',
  'https://fonts.bunny.net',
)
