import type { UnoGenerator } from '@unocss/core'
import type { GetMatchedPositionsOptions } from '#integration/match-positions'
import { defaultIdeMatchExclude, defaultIdeMatchInclude } from '#integration/defaults-ide'
import { getMatchedPositionsFromCode } from '#integration/match-positions'

const cache = new Map<string, { uno: UnoGenerator, strict: boolean, positions: ReturnType<typeof getMatchedPositionsFromCode> }>()

export function clearDocumentCache(uri: string) {
  cache.delete(uri)
}

export function clearAllCache() {
  cache.clear()
}

export function getMatchedPositionsFromDoc(
  uno: UnoGenerator,
  code: string,
  id: string,
  strictAnnotationMatch = false,
  force = false,
) {
  const cached = cache.get(id)
  if (!force && cached?.uno === uno && cached.strict === strictAnnotationMatch)
    return cached.positions

  const options: GetMatchedPositionsOptions | undefined = strictAnnotationMatch
    ? {
        includeRegex: defaultIdeMatchInclude,
        excludeRegex: defaultIdeMatchExclude,
      }
    : undefined

  const result = getMatchedPositionsFromCode(
    uno,
    code,
    id,
    options,
  )

  cache.set(id, { uno, strict: strictAnnotationMatch, positions: result })
  return result
}
