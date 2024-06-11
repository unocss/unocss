import type { Extractor } from '@unocss/core'
import { defaultSplitRE, isValidSelector } from '@unocss/core'
import { restoreSkipCode, transformSkipCode } from '../../shared-integration/src/utils'
import { removeSourceMap } from './source-map'

export const quotedArbitraryValuesRE
  = /(?:[\w&:[\]-]|\[\S{1,64}=\S{1,64}\]){1,64}\[\\?['"]?\S{1,64}?['"]\]\]?[\w:-]{0,64}/g

export const arbitraryPropertyRE
  = /\[(\\\W|[\w-]){1,64}:[^\s:]{0,64}?("\S{1,64}?"|'\S{1,64}?'|`\S{1,64}?`|[^\s:]{1,64}?)[^\s:]{0,64}?\)?\]/g

const arbitraryPropertyCandidateRE
  = /^\[(?:\\\W|[\w-]){1,64}:['"]?\S{1,64}?['"]?\]$/

export function splitCodeWithArbitraryVariants(code: string): string[] {
  const result: string[] = []

  for (const match of code.matchAll(arbitraryPropertyRE)) {
    if (match.index !== 0 && !/^[\s'"`]/.test(code[match.index! - 1] ?? ''))
      continue

    result.push(match[0])
  }

  for (const match of code.matchAll(quotedArbitraryValuesRE))
    result.push(match[0])

  // Convert the information in [] in advance to prevent incorrect separation
  const skipMap = new Map<string, string>()
  const skipFlag = '@unocss-skip-arbitrary-brackets'
  code = transformSkipCode(code, skipMap, /-\[[^\]]*\]/g, skipFlag)

  if (!code)
    return result

  code
    .split(defaultSplitRE)
    .forEach((match) => {
      if (match.includes(skipFlag))
        match = restoreSkipCode(match, skipMap)
      if (isValidSelector(match) && !arbitraryPropertyCandidateRE.test(match))
        result.push(match)
    })

  return result
}

export const extractorArbitraryVariants: Extractor = {
  name: '@unocss/extractor-arbitrary-variants',
  order: 0,
  extract({ code }) {
    return splitCodeWithArbitraryVariants(removeSourceMap(code))
  },
}

export default extractorArbitraryVariants
