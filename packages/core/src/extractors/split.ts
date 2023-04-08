import type { Extractor } from '../types'

export const defaultSplitRE = /[\\:]?[\s'"`;{}]+/g
export const splitWithVariantGroupRE = /([\\:]?[\s"'`;<>*]|:\(|\)"|\)\s)/g

export function splitCode(code: string) {
  return [...new Set(code.split(defaultSplitRE))]
}

export const extractorSplit: Extractor = {
  name: 'split',
  order: 0,
  extract({ code }) {
    return splitCode(code)
  },
}
