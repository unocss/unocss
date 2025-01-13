import type { Provider } from '../types'

export const NoneProvider: Provider = {
  name: 'none',
  getPreflight() {
    return ''
  },
  getFontName(font) {
    return font.name
  },
}
