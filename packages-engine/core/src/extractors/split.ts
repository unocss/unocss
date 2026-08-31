import type { Extractor } from '../types'

export const defaultSplitRE = /[\\:]?[\s'"`;{}]+/g
export const splitWithVariantGroupRE = /([\\:]?[\s"'`;<>]|:\(|\)"|\)\s)/g
const htmlClassAttributeRE = /<[a-z](?:[^"'<>]|"[^"]*"|'[^']*')*\sclass\s*=\s*([^\s"'`=<>{}]+)/gi

export function splitCode(code: string): string[] {
  return code.split(defaultSplitRE)
}

function extractUnquotedClasses(code: string) {
  return [...code.matchAll(htmlClassAttributeRE)]
    .map(([, value]) => value.endsWith('/') ? value.slice(0, -1) : value)
}

export const extractorSplit: Extractor = {
  name: '@unocss/core/extractor-split',
  order: 0,
  extract({ code }) {
    const classes = extractUnquotedClasses(code)
    return [
      ...splitCode(code).filter(token => !classes.some(value => token === `class=${value}` || token === `class=${value}>` || token === `class=${value}/>`)),
      ...classes,
    ]
  },
}

export { extractorSplit as extractorDefault }
