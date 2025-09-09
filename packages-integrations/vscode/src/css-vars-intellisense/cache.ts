import type { UnoGenerator } from '@unocss/core'
import type { ResolvedValues } from './types'

const resolverCache = new WeakMap<UnoGenerator, Map<string, ResolvedValues>>()

export function getCache(uno: UnoGenerator): Map<string, ResolvedValues> {
  if (!resolverCache.has(uno))
    resolverCache.set(uno, new Map())
  return resolverCache.get(uno)!
}

export function clearIntelliSenseCache(uno: UnoGenerator) {
  resolverCache.get(uno)?.clear()
}
