import { UserConfig, ParsedUtil, StringifiedUtil, UserConfigDefaults, ApplyVariantResult, Variant, ResolvedConfig, CSSEntries } from '../types'
import { resolveConfig } from '../config'
import { entriesToCss, isStaticShortcut, TwoKeyMap } from '../utils'
import { applyScope, normalizeEntries, toEscapedSelector } from './utils'

export class UnoGenerator {
  private _cache = new Map<string, StringifiedUtil | StringifiedUtil[] | null>()
  public config: ResolvedConfig

  constructor(
    public defaults: UserConfigDefaults,
    public userConfig: UserConfig = {},
  ) {
    this.config = resolveConfig(defaults, userConfig)
  }

  async generate(input: string | (Set<string> | undefined)[], id?: string, scope?: string) {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(this.config.extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const excluded = new Set<string>()
    const sheet: Record<string, StringifiedUtil[]> = {}

    const hit = (raw: string, payload: StringifiedUtil | StringifiedUtil[]) => {
      matched.add(raw)
      this._cache.set(raw, payload)

      if (typeof payload[0] === 'number')
        payload = [payload as StringifiedUtil]

      for (const item of payload as StringifiedUtil[]) {
        const query = item[3] || ''
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
        if (this._cache.has(raw)) {
          const r = this._cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        if (this.isExcluded(raw)) {
          excluded.add(raw)
          this._cache.set(raw, null)
          return
        }

        const applied = this.applyVariants(raw)

        if (this.isExcluded(applied[1])) {
          excluded.add(raw)
          this._cache.set(raw, null)
          return
        }

        // expand shortcuts
        const expanded = this.expandShortcut(applied[1])
        if (expanded) {
          const parsed = (expanded.map(i => this.parseUtil(i)).filter(Boolean) || []) as ParsedUtil[]
          const r = this.stringifyShortcuts(applied, parsed)
          if (r?.length) {
            hit(raw, r)
            return
          }
        }
        // no shortcut
        else {
          const util = this.parseUtil(applied)
          const r = this.stringifyUtil(util)
          if (r) {
            hit(raw, r)
            return
          }
        }

        // set null cache for unmatched result
        this._cache.set(raw, null)
      })
    })

    const css = Object.entries(sheet)
      .map(([query, items]) => {
        const itemsSize = items.length
        const sorted: [string, string][] = items
          .sort((a, b) => a[0] - b[0])
          .map(a => [applyScope(a[1], scope), a[2]])
        const rules = sorted
          .map(([selector, body], idx) => {
            if (this.config.mergeSelectors) {
              // search for rules that has exact same body, and merge them
              // the index is reversed to make sure we always merge to the last one
              for (let i = itemsSize - 1; i > idx; i--) {
                const current = sorted[i]
                if (current[1] === body) {
                  current[0] = `${selector}, ${current[0]}`
                  return null
                }
              }
            }
            return `${selector}{${body}}`
          })
          .filter(Boolean)
          .join('\n')

        return query
          ? `${query}{\n${rules}\n}`
          : rules
      })
      .join('\n')

    return {
      css,
      matched,
      excluded,
    }
  }

  applyVariants(raw: string): ApplyVariantResult {
  // process variants
    const variants: Variant[] = []
    let processed = raw
    let applied = false
    while (true) {
      applied = false
      for (const v of this.config.variants) {
        const result = v.match(processed, this.config.theme)
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

  parseUtil(input: string | ApplyVariantResult): ParsedUtil | undefined {
    const { theme, rulesStaticMap, rulesDynamic, rulesSize } = this.config

    const [raw, processed, variants] = typeof input === 'string'
      ? this.applyVariants(input)
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

  stringifyUtil(input?: string | ParsedUtil): StringifiedUtil | undefined {
    if (typeof input === 'string')
      input = this.parseUtil(input)

    if (!input)
      return

    const theme = this.config.theme
    const [index, raw, entries, variants] = input

    const body = entriesToCss(variants.reduce((p, v) => v.rewrite?.(p, this.config.theme) || p, entries))
    if (!body)
      return

    const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toEscapedSelector(raw))
    const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

    return [index, selector, body, mediaQuery]
  }

  expandShortcut(processed: string) {
    let result: string | string[] | undefined

    for (const s of this.config.shortcuts) {
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

  stringifyShortcuts(parent: ApplyVariantResult, expanded: ParsedUtil[]): StringifiedUtil[] | undefined {
    const theme = this.config.theme
    const selectorMap = new TwoKeyMap<string, string | undefined, [CSSEntries, number]>()

    expanded.sort((a, b) => a[0] - b[0])

    const [raw, , parentVariants] = parent

    for (const item of expanded) {
      const variants = [...item[3], ...parentVariants]
      const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toEscapedSelector(raw))
      const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(item[1], theme) || p, undefined)
      const entries = variants.reduce((p, v) => v.rewrite?.(p, theme) || p, item[2])

      // find existing selector/mediaQuery pair and merge
      const mapItem = selectorMap.getFallback(selector, mediaQuery, [[], item[0]])
      // append entries
      mapItem[0].push(...entries)

      // if there is a rule have higher index, update the index
      if (item[0] > mapItem[1])
        mapItem[1] = item[0]
    }

    return selectorMap
      .map(([entries, index], selector, mediaQuery): StringifiedUtil | undefined => {
        const body = entriesToCss(entries)
        if (!body)
          return undefined
        return [index, selector, body, mediaQuery]
      })
      .filter(Boolean) as StringifiedUtil[]
  }

  isExcluded(raw: string) {
    return this.config.excluded.some(e => typeof e === 'string' ? e === raw : e.test(raw))
  }
}

export function createUnoGenerator(defaults: UserConfigDefaults, config?: UserConfig) {
  return new UnoGenerator(defaults, config)
}
