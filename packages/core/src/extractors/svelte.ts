import type { Extractor } from '../types'
import { isValidSelector } from '../utils'

const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

export const extractorSvelte: Extractor = {
  name: 'svelte',
  order: 0,
  extract({ code, id }) {
    let result = splitCode(code)
    if (id && id.endsWith('.svelte')) {
      result = result.map((r) => {
        return r.startsWith('class:') ? r.slice(6) : r
      })
    }
    return new Set(result)
  },
}
