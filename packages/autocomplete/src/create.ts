import type { AutoCompleteFunction, AutoCompleteTemplate, UnoGenerator } from '@unocss/core'
import { toArray, uniq } from '@unocss/core'
import LRU from 'lru-cache'
import { parseAutocomplete } from './parse'
import type { ParsedAutocompleteTemplate } from './types'

export function createAutocomplete(uno: UnoGenerator) {
  const templateCache = new Map<string, ParsedAutocompleteTemplate>()
  const cache = new LRU<string, string[]>({ max: 1000 })

  let staticUtils: string[] = []
  let templates: (AutoCompleteTemplate | AutoCompleteFunction)[] = []

  reset()

  return {
    suggest,
    templates,
    cache,
    reset,
  }

  function getParsed(template: string) {
    if (!templateCache.has(template))
      templateCache.set(template, parseAutocomplete(template, uno.config.theme))
    return templateCache.get(template)!.suggest
  }

  async function suggest(input: string) {
    if (input.length < 2)
      return []
    if (cache.has(input))
      return cache.get(input)!
    const result = processSuggestions(
      await Promise.all([
        suggestSelf(input),
        suggestStatic(input),
        ...suggestFromPreset(input),
      ]),
    )
    cache.set(input, result)
    return result
  }

  async function suggestSelf(input: string) {
    const i = await uno.parseToken(input, '-')
    return i ? [input] : []
  }

  async function suggestStatic(input: string) {
    return staticUtils.filter(i => i.startsWith(input))
  }

  function suggestFromPreset(input: string) {
    return templates.map(fn =>
      typeof fn === 'function'
        ? fn(input)
        : getParsed(fn)(input),
    ) || []
  }

  function reset() {
    templateCache.clear()
    cache.clear()
    staticUtils = Object.keys(uno.config.rulesStaticMap)
    templates = [
      ...uno.config.autocomplete || [],
      ...uno.config.rulesDynamic.flatMap(i => toArray(i?.[2]?.autocomplete || [])),
    ]
  }

  function processSuggestions(suggestions: (string[] | undefined)[]) {
    return uniq(suggestions.flat())
      .filter((i): i is string => !!(i && !i.match(/[:-]$/)))
      .sort((a, b) => {
        const numA = +(a.match(/\d+$/)?.[0] || NaN)
        const numB = +(b.match(/\d+$/)?.[0] || NaN)
        if (!Number.isNaN(numA) && !Number.isNaN(numB))
          return numA - numB
        return a.localeCompare(b)
      })
  }
}
