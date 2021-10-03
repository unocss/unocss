import { Variant, CSSObject, CSSEntries, UserConfig, ResolvedConfig, ParsedUtil, StringifiedUtil, ApplyVariantResult } from '../types'
import { resolveConfig } from '../config'
import { escapeSelector, entriesToCss, isStaticShortcut } from '../utils'

const reScopePlaceholder = / \$\$ /

const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

function toSelector(raw: string) {
  if (raw.startsWith('['))
    return raw.replace(/"(.*)"/, (_, i) => `"${escapeSelector(i)}"`)
  else
    return `.${escapeSelector(raw)}`
}

export function normalizeEntries(obj: CSSObject | CSSEntries) {
  return !Array.isArray(obj) ? Object.entries(obj) : obj
}

export function applyVariant(config: ResolvedConfig, raw: string): ApplyVariantResult {
  // process variants
  const variants: Variant[] = []
  let processed = raw
  let applied = false
  while (true) {
    applied = false
    for (const v of config.variants) {
      const result = v.match(processed, config.theme)
      if (result && result !== processed) {
        processed = result
        variants.push(v)
        applied = true
        break
      }
    }
    if (!applied)
      break
  }

  return [raw, processed, variants]
}

export function parseUtil(config: ResolvedConfig, input: string | ApplyVariantResult): ParsedUtil | undefined {
  const { theme, rulesStaticMap, rulesDynamic, rulesSize } = config

  const [raw, processed, variants] = typeof input === 'string'
    ? applyVariant(config, input)
    : input

  // use map to for static rules
  const staticMatch = rulesStaticMap[processed]
  if (staticMatch?.[1])
    return [staticMatch[0], raw, normalizeEntries(staticMatch[1]), variants]

  // match rules
  for (let i = 0; i < rulesSize; i++) {
    const rule = rulesDynamic[i]

    // static rules are omitted as undefined
    if (!rule)
      continue

    // dynamic rules
    const [matcher, handler] = rule
    const match = processed.match(matcher)
    if (!match)
      continue

    const obj = handler(match, theme)
    if (obj)
      return [i, raw, normalizeEntries(obj), variants]
  }
}

export function stringifyShortcuts(config: ResolvedConfig, parent: ApplyVariantResult, input: ParsedUtil[]): StringifiedUtil[] | undefined {
  const selectorMap: [string, string | undefined, CSSEntries][] = []

  const maxIndex = input.map(i => i[0]).sort((a, b) => b - a)[0]

  const [raw, , parentVariants] = parent

  for (const item of input) {
    const variants = [...item[3], ...parentVariants]
    const selector = variants.reduce((p, v) => v.selector?.(p, config.theme) || p, toSelector(raw))
    const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(item[1], config.theme) || p, undefined)
    const entries = variants.reduce((p, v) => v.rewrite?.(p, config.theme) || p, item[2])

    let mapItem = selectorMap.find(i => i[0] === selector && i[1] === mediaQuery)
    if (!mapItem) {
      mapItem = [selector, mediaQuery, []]
      selectorMap.push(mapItem)
    }
    mapItem[2].push(...entries)
  }

  return selectorMap
    .map(([selector, mediaQuery, entries]): StringifiedUtil | undefined => {
      const body = entriesToCss(entries)
      if (!body)
        return undefined
      return [maxIndex, `${selector}{${body}}`, mediaQuery]
    })
    .filter(Boolean) as StringifiedUtil[]
}

export function stringifyUtil(config: ResolvedConfig, input?: string | ParsedUtil): StringifiedUtil | undefined {
  if (typeof input === 'string')
    input = parseUtil(config, input)

  if (!input)
    return

  const theme = config.theme
  const [index, raw, entries, variants] = input

  const body = entriesToCss(variants.reduce((p, v) => v.rewrite?.(p, config.theme) || p, entries))
  if (!body)
    return

  const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toSelector(raw))
  const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

  const css = `${selector}{${body}}`
  return [index, css, mediaQuery]
}

export function expandShortcut(config: ResolvedConfig, processed: string) {
  let result: string | string[] | undefined

  for (const s of config.shortcuts) {
    if (isStaticShortcut(s)) {
      if (s[0] === processed)
        result = s[1]
    }
    else {
      const match = processed.match(s[0])
      if (match)
        result = s[1](match)
      if (result)
        break
    }
  }

  if (!result)
    return

  if (typeof result === 'string')
    result = result.split(/ /g)

  return result
}

export function createGenerator(userConfig: UserConfig = {}) {
  const config = resolveConfig(userConfig)
  const _cache = new Map<string, StringifiedUtil | StringifiedUtil[] | null>()
  const extractors = config.extractors

  return async(input: string | (Set<string> | undefined)[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const sheet: Record<string, StringifiedUtil[]> = {}

    function hit(raw: string, payload: StringifiedUtil | StringifiedUtil[]) {
      matched.add(raw)
      _cache.set(raw, payload)

      if (!Array.isArray(payload[0]))
        payload = [payload as StringifiedUtil]

      for (const item of payload as StringifiedUtil[]) {
        const query = item[2] || ''
        if (!(query in sheet))
          sheet[query] = []
        sheet[query].push(item)
      }
    }

    tokensArray.forEach((tokens) => {
      tokens?.forEach((raw) => {
        if (matched.has(raw))
          return

        // use caches if possible
        if (_cache.has(raw)) {
          const r = _cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        const applied = applyVariant(config, raw)

        // expand shortcuts
        const expanded = expandShortcut(config, applied[1])
        if (expanded) {
          const parsed = (expanded.map(i => parseUtil(config, i)).filter(Boolean) || []) as ParsedUtil[]
          const r = stringifyShortcuts(config, applied, parsed)
          if (r?.length) {
            hit(raw, r)
            return
          }
        }
        // no shortcut
        else {
          const util = parseUtil(config, applied)
          const r = stringifyUtil(config, util)
          if (r) {
            hit(raw, r)
            return
          }
        }

        // set null cache for unmatched result
        _cache.set(raw, null)
      })
    })

    const css = Object.entries(sheet)
      .map(([query, items]) => {
        const rules = items
          .sort((a, b) => a[0] - b[0])
          .map(i => applyScope(i[1], scope))
          .join('\n')
        if (query)
          return `${query}{\n${rules}\n}`
        return rules
      })
      .join('\n')

    return {
      css,
      matched,
    }
  }
}
