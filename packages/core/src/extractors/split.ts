import { Extractor } from '../types'
import { isValidSelector } from '../utils'

export const extractorSplit: Extractor = {
  name: 'split',
  order: 0,
  extract({ code }) {
    return new Set(code.split(/[\s'"`;>=]+/g).filter(isValidSelector))
  },
}
