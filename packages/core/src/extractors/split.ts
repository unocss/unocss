import type { Extractor } from '../types'

export const defaultSplitRE = /[\\:]?[\s'"`{}]|;(?!base64)+/g
export const splitWithVariantGroupRE = /([\\:]?[\s"'`;<>*]|:\(|\)"|\)\s)/g

export function splitCode(code: string) {
  return [...new Set(code.split(defaultSplitRE))]
}

export const extractorSplit: Extractor = {
  name: '@unocss/core/extractor-split',
  order: 0,
  extract({ code }) {
    return splitCode(code)
  },
}

export { extractorSplit as extractorDefault }
