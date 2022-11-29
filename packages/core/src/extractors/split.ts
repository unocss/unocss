import type { Extractor } from '../types'
import { isValidSelector } from '../utils'

const defaultSplitRE = /\\?[\s'"`;{}]+/g
export const arbitraryPropertyRE = /\[(\\\W|[\w-])+:['"]?\S+?['"]?\]/g
const arbitraryPropertyCandidateRE = new RegExp(`^${arbitraryPropertyRE.source}$`)

export const splitCode = (code: string) => {
  const result = new Set<string>()

  for (const match of code.matchAll(arbitraryPropertyRE)) {
    if (!code[match.index! - 1]?.match(/^[\s'"`]/))
      continue

    result.add(match[0])
  }

  code.split(defaultSplitRE).forEach((match) => {
    isValidSelector(match) && !arbitraryPropertyCandidateRE.test(match) && result.add(match)
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
