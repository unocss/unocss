import type { AutoCompleteExtractorResult, AutoCompleteFunction, AutoCompleteTemplate, SuggestResult, UnoGenerator } from '@unocss/core'
import type { AutocompleteParseError } from './parse'
import type { AutocompleteOptions, ParsedAutocompleteTemplate, UnocssAutocomplete } from './types'
import { escapeRegExp, toArray, uniq } from '@unocss/core'
import { byLengthAsc, byStartAsc, Fzf } from 'fzf'
import { LRUCache } from 'lru-cache'
import { parseAutocomplete } from './parse'
import { searchAttrKey, searchUsageBoundary } from './utils'

export function createAutocomplete(uno: UnoGenerator, options: AutocompleteOptions = {}): UnocssAutocomplete {
  const templateCache = new Map<string, ParsedAutocompleteTemplate>()
  const cache = new LRUCache<string, string[]>({ max: 5000 })
  const errorCache = new Map<string, AutocompleteParseError[]>()

  let staticUtils: string[] = []

  const templates: (AutoCompleteTemplate | AutoCompleteFunction)[] = []

  const {
    matchType = 'prefix',
    throwErrors = true,
  } = options

  reset()

  return {
    suggest,
    suggestInFile,
    templates,
    cache,
    errorCache,
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
    const matched = await uno.matchVariants(_input)

    let result = (await Promise.all(matched.map(async ([, processed]) => {
      let idx = processed ? input.search(escapeRegExp(processed)) : input.length
      // This input contains variants that modifies the processed part,
      // autocomplete will need to reverse it which is not possible
      if (idx === -1)
        idx = 0
      const variantPrefix = input.slice(0, idx)
      const variantSuffix = input.slice(idx + input.length)

      const result = processSuggestions(
        await Promise.all([
          suggestSelf(processed),
          suggestStatic(processed),
          suggestUnoCache(processed),
          suggestFromTemplates(processed),
        ]),
        variantPrefix,
        variantSuffix,
      )
      return result
    }))).flat()

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
    const keys = Array.from(uno.cache.entries())
    return keys.filter(i => i[1] && i[0].startsWith(input)).map(i => i[0])
  }

  async function suggestFromTemplates(input: string) {
    const ps = await Promise.allSettled([
      Array.from(templateCache.values()).flatMap(({ suggest }) => suggest(input, matchType) ?? []),
      ...templates.filter(fn => typeof fn === 'function').map(fn => fn(input)),
    ])
    return ps.flatMap(i => i.status === 'fulfilled' ? i.value : [])
  }

  function reset() {
    templateCache.clear()
    cache.clear()
    errorCache.clear()

    staticUtils = [
      ...Object.keys(uno.config.rulesStaticMap),
      ...uno.config.shortcuts.filter(i => typeof i[0] === 'string').map(i => i[0] as string),
    ]
    templates.length = 0
    templates.push(
      ...uno.config.autocomplete.templates || [],
      ...uno.config.rulesDynamic.flatMap(i => toArray(i?.[2]?.autocomplete || [])),
      ...uno.config.shortcuts.flatMap(i => toArray(i?.[2]?.autocomplete || [])),
      ...uno.config.variants.flatMap(v => toArray(v.autocomplete || [])),
    )

    for (const template of templates) {
      if (typeof template !== 'function') {
        if (templateCache.has(template) || errorCache.has(template)) {
          continue
        }
        const parsed = parseAutocomplete(template, uno.config.theme, uno.config.autocomplete.shorthands)
        if (parsed.errors.length) {
          errorCache.set(template, parsed.errors)
        }
        templateCache.set(template, parsed)
      }
    }

    if (errorCache.size && throwErrors) {
      const message = Array.from(errorCache.values())
        .flat()
        .map(error => error.toString())
        .join('\n')
      throw new Error(message)
    }
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
