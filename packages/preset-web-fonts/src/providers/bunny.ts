import type { Provider } from '../types'

export const BunnyFontsProvider: Provider = {
  name: 'bunny',
  getImportUrl(fonts) {
    const strings = fonts
      .filter(i => i.provider === 'bunny')
      .map((i) => {
        let name = i.name.replace(/\s+/g, '+')
        if (i.weights?.length) {
          name += i.italic
            ? `:ital,wght@${i.weights.flatMap(i => [`0,${i}`, `1,${i}`]).sort().join(';')}`
            : `:wght@${i.weights.sort().join(';')}`
        }
        return `family=${name}`
      }).join('&')
    return `https://fonts.bunny.net/css2?${strings}&display=swap`
  },
  getFontName(font) {
    return `"${font.name}"`
  },
}
