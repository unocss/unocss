import type { Provider, WebFontsProviders } from '../types'

export function createBunnyFontsProvider(
  name: WebFontsProviders,
  host: string,
): Provider {
  return {
    name,
    getImportUrl(fonts): string {
      const fontFamilies = fonts.map((font) => {
        const { name, weights, italic } = font
        const formattedName = name.toLowerCase().replace(/\s/g, '-')
        if (!weights?.length)
          return `${formattedName}${italic ? ':i' : ''}`

        let weightsAsString = weights.map(weight => weight.toString())
        // 1. if weights have at least one element that has 'i', ignore the `italic` flag.
        // 2. if none of the weights have an 'i' and italic is true, append an 'i'
        const weightsHaveItalic = weightsAsString.some(weight => weight.endsWith('i'))
        if (!weightsHaveItalic && italic)
          weightsAsString = weightsAsString.map(weight => weight += 'i')

        return `${formattedName}:${weightsAsString.join(',')}`
      })
      return `${host}/css?family=${fontFamilies.join('|')}&display=swap`
    },
  }
}

export const BunnyFontsProvider: Provider = createBunnyFontsProvider(
  'bunny',
  'https://fonts.bunny.net',
)
