import { ResolvedConfig, ParsedUtil, StringifiedUtil, ApplyVariantResult } from '../types'
import { entriesToCss } from '../utils'
import { applyVariants } from './variant'
import { normalizeEntries, toEscapedSelector } from './utils'

export function parseUtil(config: ResolvedConfig, input: string | ApplyVariantResult): ParsedUtil | undefined {
  const { theme, rulesStaticMap, rulesDynamic, rulesSize } = config

  const [raw, processed, variants] = typeof input === 'string'
    ? applyVariants(config, input)
    : input

  // use map to for static rules
  const staticMatch = rulesStaticMap[processed]
  if (staticMatch?.[1])
    return [staticMatch[0], raw, normalizeEntries(staticMatch[1]), variants]

  // match rules, from last to first
  for (let i = rulesSize; i >= 0; i--) {
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

  const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toEscapedSelector(raw))
  const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

  return [index, selector, body, mediaQuery]
}

export function isExcluded(config: ResolvedConfig, raw: string) {
  return config.excluded.some(e => typeof e === 'string' ? e === raw : e.test(raw))
}
