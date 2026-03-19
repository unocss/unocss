import type { GetMatchedPositionsOptions } from '#integration/match-positions'
import type { UnoGenerator } from '@unocss/core'
import { defaultIdeMatchExclude, defaultIdeMatchInclude } from '#integration/defaults-ide'
import { getMatchedPositionsFromCode } from '#integration/match-positions'

const cache = new Map<string, ReturnType<typeof getMatchedPositionsFromCode>>()

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
  if (force)
    cache.delete(id)

  if (cache.has(id))
    return cache.get(id)!

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

  cache.set(id, result)
  return result
}
