import { Extractor } from '../types'
import { isValidSelector } from '../utils'

export const svelteExtractor: Extractor = {
  name: 'svelte',
  order: 0,
  extract({ code }) {
    return new Set(code.split(/[\s'"`;>=]+/g).filter(isValidSelector).map((r) => {
      return r.startsWith('class:') ? r.slice(6) : r
    }))
  },
}
