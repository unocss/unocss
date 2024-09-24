import type { Provider } from '../types'

export const NoneProvider: Provider = {
  name: 'none',
  async getPreflight() {
    return ''
  },
  getFontName(font) {
    return font.name
  },
}
