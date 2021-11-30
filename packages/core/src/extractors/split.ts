import { Extractor } from '../types'
import { isValidSelector } from '../utils'

const extractorSplitRe = /[\s'"`;>=]+/g
export const extractorSplit: Extractor = {
  name: 'split',
  order: 0,
  extract({ code }) {
    return new Set(code.split(extractorSplitRe).filter(isValidSelector))
  },
}
