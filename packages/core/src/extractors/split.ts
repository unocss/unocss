import type { Extractor } from '../types'
import { isValidSelector } from '../utils'

const defaultSplitRE = /\\?[\s'"`;{}]+/g
export const cssPropertyRE = /[\s'"`](\[(\\\W|[\w-])+:['"]?\S*?['"]?\])/g

export const splitCode = (code: string) => {
  const result = new Set<string>()

  for (const match of code.matchAll(cssPropertyRE))
    result.add(match[1])

  code.split(defaultSplitRE).forEach((match) => {
    isValidSelector(match) && result.add(match)
  })

  return [...result]
}

export const extractorSplit: Extractor = {
  name: 'split',
  order: 0,
  extract({ code }) {
    return splitCode(code)
  },
}
