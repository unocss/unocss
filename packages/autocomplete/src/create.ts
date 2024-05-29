import type { AutoCompleteExtractorResult, AutoCompleteFunction, AutoCompleteTemplate, SuggestResult, UnoGenerator, Variant } from '@unocss/core'
import { escapeRegExp, toArray, uniq } from '@unocss/core'
import { LRUCache } from 'lru-cache'
import { Fzf, byLengthAsc, byStartAsc } from 'fzf'
import { parseAutocomplete } from './parse'
import type { AutocompleteOptions, ParsedAutocompleteTemplate, UnocssAutocomplete } from './types'
import { searchAttrKey, searchUsageBoundary } from './utils'

export function createAutocomplete(uno: UnoGenerator, options: AutocompleteOptions = {}): UnocssAutocomplete {
  const templateCache = new Map<string, ParsedAutocompleteTemplate>()
  const cache = new LRUCache<string, string[]>({ max: 5000 })

  let staticUtils: string[] = []

  const templates: (AutoCompleteTemplate | AutoCompleteFunction)[] = []

  const matchType = options.matchType ?? 'prefix'

  reset()

  return {
    suggest,
    suggestInFile,
    templates,
    cache,
    reset,
    /**
     * Enumerate possible suggestions from 'aa' - 'zz'
     */
    enumerate,
  }

  async function enumerate() {
    const matched = new Set<string>()
    const a2z = Array.from('abcdefghijklmnopqrstuvwxyz')
    const a2zd = [...a2z, '-']

    const keys = a2z.flatMap(i => [
      i,
      ...a2zd.map(j => `${i}${j}`),
    ])

    await Promise.all(
      keys.map(key => suggest(key)
        .then(i => i.forEach(j => matched.add(j)))),
    )

    await Promise.all(
      [...matched]
        .filter(i => /^\w+$/.test(i) && i.length > 3)
        .map(i => suggest(`${i}-`)
          .then(i => i.forEach(j => matched.add(j)))),
    )

    return matched
  }

  function getParsed(template: string) {
    if (!templateCache.has(template))
      templateCache.set(template, parseAutocomplete(template, uno.config.theme, uno.config.autocomplete.shorthands))
    return templateCache.get(template)!.suggest
  }

  async function suggest(input: string, allowsEmptyInput = false) {
    if (!allowsEmptyInput && input.length < 1)
      return []
    if (cache.has(input))
      return cache.get(input)!

    const attributify = uno.config.presets.find(i => i.name === '@unocss/preset-attributify')
    const attributifyPrefix = attributify?.options?.prefix
    const _input = attributifyPrefix
      ? input.startsWith(attributifyPrefix)
        ? input.slice(attributifyPrefix.length)
        : input.replace(`:${attributifyPrefix}`, ':')
      : input
    // match and ignore existing variants
    const [, processed, , variants] = await uno.matchVariants(_input)

    let idx = processed ? input.search(escapeRegExp(processed)) : input.length
    // This input contains variants that modifies the processed part,
    // autocomplete will need to reverse it which is not possible
    if (idx === -1)
      idx = 0
    const variantPrefix = input.slice(0, idx)
    const variantSuffix = input.slice(idx + input.length)

    let result = processSuggestions(
      await Promise.all([
        suggestSelf(processed),
        suggestStatic(processed),
        suggestUnoCache(processed),
        ...suggestFromPreset(processed),
        ...suggestVariant(processed, variants),
      ]),
      variantPrefix,
      variantSuffix,
    )

    if (matchType === 'fuzzy') {
      const fzf = new Fzf(result, {
        tiebreakers: [byStartAsc, byLengthAsc],
      })
      result = fzf.find(input).map(i => i.item)
    }
    cache.set(input, result)
    return result
  }

  async function suggestInFile(content: string, cursor: number): Promise<SuggestResult | undefined> {
    const isInsideAttrValue = searchAttrKey(content, cursor) !== undefined

    // try resolve by extractors
    const byExtractor = await searchUsageByExtractor(content, cursor)
    if (byExtractor) {
      const suggestions = await suggest(byExtractor.extracted, isInsideAttrValue)
      const formatted = byExtractor.transformSuggestions ? byExtractor.transformSuggestions(suggestions) : suggestions
      return {
        suggestions: suggestions.map((v, i) => [v, formatted[i]] as [string, string]),
        resolveReplacement: byExtractor.resolveReplacement,
      }
    }

    // regular resolve
    const regular = searchUsageBoundary(
      content,
      cursor,
      (uno.config.presets || []).some(i => i.name === '@unocss/preset-attributify'),
    )
    if (!regular)
      return
    const suggestions = await suggest(regular.content, isInsideAttrValue)
    return {
      suggestions: suggestions.map(v => [v, v] as [string, string]),
      resolveReplacement: suggestion => ({
        start: regular.start,
        end: regular.end,
        replacement: suggestion,
      }),
    }
  }

  async function searchUsageByExtractor(content: string, cursor: number): Promise<AutoCompleteExtractorResult | null> {
    if (!uno.config.autocomplete.extractors.length)
      return null
    for (const extractor of uno.config.autocomplete.extractors) {
      const res = await extractor.extract({ content, cursor })
      if (res)
        return res
    }
    return null
  }

  async function suggestSelf(input: string) {
    const i = await uno.parseToken(input, '-')
    return i ? [input] : []
  }

  async function suggestStatic(input: string) {
    if (matchType === 'fuzzy')
      return staticUtils
    return staticUtils.filter(i => i.startsWith(input))
  }

  async function suggestUnoCache(input: string) {
    // @ts-expect-error private
    const keys = Array.from(uno._cache.entries())
    return keys.filter(i => i[1] && i[0].startsWith(input)).map(i => i[0])
  }

  function suggestFromPreset(input: string) {
    return templates.map(fn => typeof fn === 'function'
      ? fn(input)
      : getParsed(fn)(input, matchType)) || []
  }

  function suggestVariant(input: string, used: Set<Variant>) {
    return uno.config.variants
      .filter(v => v.autocomplete && (v.multiPass || !used.has(v)))
      .flatMap(v => toArray(v.autocomplete || []))
      .map(fn => typeof fn === 'function'
        ? fn(input)
        : getParsed(fn)(input, matchType))
  }

  function reset() {
    templateCache.clear()
    cache.clear()
    staticUtils = [
      ...Object.keys(uno.config.rulesStaticMap),
      ...uno.config.shortcuts.filter(i => typeof i[0] === 'string').map(i => i[0] as string),
    ]
    templates.length = 0
    templates.push(
      ...uno.config.autocomplete.templates || [],
      ...uno.config.rulesDynamic.flatMap(i => toArray(i?.[3]?.autocomplete || [])),
      ...uno.config.shortcuts.flatMap(i => toArray(i?.[2]?.autocomplete || [])),
    )
  }

  function processSuggestions(suggestions: (string[] | undefined)[], prefix = '', suffix = '') {
    return uniq(suggestions.flat())
      .filter((i): i is string => !!(i && !i.endsWith('-') && !uno.isBlocked(i)))
      .sort((a, b) => {
        if (/\d/.test(a) && /\D/.test(b))
          return 1

        if (/\D/.test(a) && /\d/.test(b))
          return -1

        const numA = +(a.match(/\d+$/)?.[0] || Number.NaN)
        const numB = +(b.match(/\d+$/)?.[0] || Number.NaN)
        if (!Number.isNaN(numA) && !Number.isNaN(numB))
          return numA - numB

        return a.localeCompare(b)
      })
      .map(i => prefix + i + suffix)
  }
}
