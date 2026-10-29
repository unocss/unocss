import type { Extractor } from '@unocss/core'
import { defaultSplitRE, isValidSelector } from '@unocss/core'
import { arbitraryPropertyRE, quotedArbitraryValuesRE } from '#integration/constants'
import { restoreSkipCode, transformSkipCode } from '#integration/utils'

import { removeSourceMap } from './source-map'

export { arbitraryPropertyRE, quotedArbitraryValuesRE }

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
  code = transformSkipCode(code, skipMap, /-\[(?!&.+?;)[^\]]*\]/g, skipFlag)

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

export function extractorArbitraryVariants(): Extractor {
  return {
    name: '@unocss/extractor-arbitrary-variants',
    order: 0,
    extract({ code }) {
      return splitCodeWithArbitraryVariants(removeSourceMap(code))
    },
  }
}
