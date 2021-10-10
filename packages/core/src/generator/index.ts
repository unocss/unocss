import { UserConfig, ParsedUtil, StringifiedUtil, UserConfigDefaults, VariantMatchedResult, Variant, ResolvedConfig, CSSEntries, GenerateResult } from '../types'
import { resolveConfig } from '../config'
import { entriesToCss, isStaticShortcut, TwoKeyMap } from '../utils'
import { applyScope, normalizeEntries, toEscapedSelector } from './utils'

export class UnoGenerator {
  private _cache = new Map<string, StringifiedUtil[] | null>()
  public config: ResolvedConfig
  public excluded = new Set<string>()

  constructor(
    public userConfig: UserConfig = {},
    public defaults: UserConfigDefaults = {},
  ) {
    this.config = resolveConfig(userConfig, defaults)
  }

  setConfig(userConfig: UserConfig) {
    this.userConfig = userConfig
    this.config = resolveConfig(userConfig, this.defaults)
    this.excluded = new Set()
    this._cache = new Map()
  }

  async applyExtractors(code: string, id?: string) {
    return await Promise.all(this.config.extractors.map(i => i(code, id)))
  }

  async generate(
    input: string | (Set<string> | undefined)[],
    id?: string,
    scope?: string,
  ): Promise<GenerateResult> {
    const tokensArray = Array.isArray(input)
      ? input
      : await this.applyExtractors(input, id)

    const matched = new Set<string>()
    const sheet = new Map<string, StringifiedUtil[]>()

    const hit = (raw: string, payload: StringifiedUtil[]) => {
      this._cache.set(raw, payload)
      matched.add(raw)

      for (const item of payload) {
        const query = item[3] || ''
        if (!sheet.has(query))
          sheet.set(query, [])
        sheet.get(query)!.push(item)
      }
    }

    await Promise.all(
      tokensArray.flatMap(tokens => Array.from(tokens || []).map(async(raw) => {
        if (matched.has(raw) || this.excluded.has(raw))
          return

        // use caches if possible
        if (this._cache.has(raw)) {
          const r = this._cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        if (this.isExcluded(raw)) {
          this.excluded.add(raw)
          this._cache.set(raw, null)
          return
        }

        const applied = this.matchVariants(raw)

        if (this.isExcluded(applied[1])) {
          this.excluded.add(raw)
          this._cache.set(raw, null)
          return
        }

        // expand shortcuts
        const expanded = this.expandShortcut(applied[1])
        if (expanded) {
          const utils = await this.stringifyShortcuts(applied, expanded)
          if (utils.length) {
            hit(raw, utils)
            return
          }
        }
        // no shortcut
        else {
          const util = this.stringifyUtil(await this.parseUtil(applied))
          if (util) {
            hit(raw, [util])
            return
          }
        }

        // set null cache for unmatched result
        this._cache.set(raw, null)
      })),
    )

    const css = Array.from(sheet).map(([query, items]) => {
      const size = items.length
      const sorted: [string, string][] = items
        .sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]))
        .map(a => [applyScope(a[1], scope), a[2]])
      const rules = sorted
        .map(([selector, body], idx) => {
          if (this.config.mergeSelectors) {
            // search for rules that has exact same body, and merge them
            // the index is reversed to make sure we always merge to the last one
            for (let i = size - 1; i > idx; i--) {
              const current = sorted[i]
              if (current[1] === body) {
                current[0] = `${selector},${current[0]}`
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
    }
  }

  matchVariants(raw: string): VariantMatchedResult {
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

  applyVariants(parsed: ParsedUtil, variants = parsed[3], raw = parsed[1]) {
    const theme = this.config.theme
    const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toEscapedSelector(raw))
    const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(parsed[1], theme) || p, undefined)
    const entries = variants.reduce((p, v) => v.rewrite?.(p, theme) || p, parsed[2])
    return [
      selector,
      entries,
      mediaQuery,
    ] as const
  }

  async parseUtil(input: string | VariantMatchedResult): Promise<ParsedUtil | undefined> {
    const { theme, rulesStaticMap, rulesDynamic, rulesSize } = this.config

    const [raw, processed, variants] = typeof input === 'string'
      ? this.matchVariants(input)
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

      const obj = await handler(match, theme)
      if (obj)
        return [i, raw, normalizeEntries(obj), variants]
    }
  }

  stringifyUtil(parsed?: ParsedUtil): StringifiedUtil | undefined {
    if (!parsed)
      return

    const [selector, entries, mediaQuery] = this.applyVariants(parsed)
    const body = entriesToCss(entries)

    if (!body)
      return

    return [parsed[0], selector, body, mediaQuery]
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

  async stringifyShortcuts(parent: VariantMatchedResult, expanded: string[]) {
    const selectorMap = new TwoKeyMap<string, string | undefined, [CSSEntries, number]>()

    const parsed = (await Promise.all(expanded
      .map(i => this.parseUtil(i) as Promise<ParsedUtil>)))
      .filter(Boolean)
      .sort((a, b) => a[0] - b[0])

    const [raw, , parentVariants] = parent

    for (const item of parsed) {
      const [selector, entries, mediaQuery] = this.applyVariants(item, [...item[3], ...parentVariants], raw)

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

export function createGenerator(config?: UserConfig, defaults?: UserConfigDefaults) {
  return new UnoGenerator(config, defaults)
}
