import { Variant, CSSObject, CSSEntries, UserConfig, ResolvedConfig, ParsedUtil, StringifiedUtil } from '../types'
import { resolveConfig } from '../options'
import { escapeSelector, entriesToCss } from '../utils'

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

export function parseUtil(config: ResolvedConfig, raw: string): ParsedUtil | undefined {
  const { theme, rulesStaticMap: staticRulesMap, rulesDynamic: dynamicRules, rulesSize: rulesLength } = config

  // process variants
  const variants: Variant[] = []
  let processed = raw
  let applied = false
  while (true) {
    applied = false
    for (const v of config.variants) {
      const result = v.match(processed, theme)
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

  // use map to for static rules
  const staticMatch = staticRulesMap[processed]
  if (staticMatch?.[1])
    return [staticMatch[0], raw, normalizeEntries(staticMatch[1]), variants]

  // match rules
  for (let i = 0; i < rulesLength; i++) {
    const rule = dynamicRules[i]

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

export function stringifyUtil(config: ResolvedConfig, parsed?: ParsedUtil): StringifiedUtil | undefined {
  if (!parsed)
    return

  const theme = config.theme
  const [index, raw, entries, variants] = parsed

  const body = entriesToCss(variants.reduce((p, v) => v.rewrite?.(p, config.theme) || p, entries))
  if (!body)
    return

  const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toSelector(raw))
  const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

  const css = `${selector}{${body}}`
  return [index, css, mediaQuery]
}

export function createGenerator(userConfig: UserConfig = {}) {
  const config = resolveConfig(userConfig)
  const _cache = new Map<string, StringifiedUtil | null>()
  const extractors = config.extractors

  return async(input: string | Set<string>[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const sheet: Record<string, StringifiedUtil[]> = {}

    function hit(raw: string, payload: StringifiedUtil) {
      matched.add(raw)
      _cache.set(raw, payload)

      const query = payload[2] || ''
      if (!(query in sheet))
        sheet[query] = []
      sheet[query].push(payload)
    }

    tokensArray.forEach((tokens) => {
      tokens.forEach((raw) => {
        if (matched.has(raw))
          return

        // use caches if possible
        if (_cache.has(raw)) {
          const r = _cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        const r = stringifyUtil(config, parseUtil(config, raw))
        if (r) {
          hit(raw, r)
          return
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
