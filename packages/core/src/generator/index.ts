import { UserConfig, ParsedUtil, StringifiedUtil, UserConfigDefaults, VariantMatchedResult, Variant, ResolvedConfig, CSSEntries, GenerateResult, CSSObject, RawUtil } from '../types'
import { resolveConfig } from '../config'
import { e, entriesToCss, isRawUtil, isStaticShortcut, TwoKeyMap, uniq } from '../utils'
import { GenerateOptions, RuleContext, RuleMeta, VariantHandler } from '..'

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

  setConfig(userConfig?: UserConfig, defaults?: UserConfigDefaults) {
    if (!userConfig)
      return
    if (defaults)
      this.defaults = defaults
    this.userConfig = userConfig
    this.config = resolveConfig(userConfig, this.defaults)
    this.excluded = new Set()
    this._cache = new Map()
  }

  async applyExtractors(code: string, id?: string, set = new Set<string>()) {
    await Promise.all(
      this.config.extractors
        .map(async(i) => {
          const result = await i(code, id)
          result?.forEach(t => set.add(t))
        }),
    )
    return set
  }

  async generate(
    input: string | Set<string>,
    {
      id,
      scope,
      preflights = true,
      layerComments = true,
    }: GenerateOptions = {},
  ): Promise<GenerateResult> {
    const tokens = typeof input === 'string'
      ? await this.applyExtractors(input, id)
      : input

    const layerSet = new Set<string>(['default'])
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
        if (item[4]?.layer)
          layerSet.add(item[4].layer)
      }
    }

    await Promise.all(Array.from(tokens).map(async(raw) => {
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
        const utils = await this.stringifyShortcuts(applied, expanded[0], expanded[1])
        if (utils?.length) {
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
    }))

    if (preflights) {
      this.config.preflights.forEach((i) => {
        if (i.layer)
          layerSet.add(i.layer)
      })
    }

    const layerCache: Record<string, string> = {}
    const layers = this.config.sortLayers(Array
      .from(layerSet)
      .sort((a, b) => ((this.config.layers[a] ?? 0) - (this.config.layers[b] ?? 0)) || a.localeCompare(b)),
    )

    const getLayer = (layer: string) => {
      if (layerCache[layer])
        return layerCache[layer]

      let css = Array.from(sheet).map(([query, items]) => {
        const size = items.length
        const sorted = items
          .filter(i => (i[4]?.layer || 'default') === layer)
          .sort((a, b) => a[0] - b[0] || a[1]?.localeCompare(b[1] || '') || 0)
          .map(a => [a[1] ? applyScope(a[1], scope) : a[1], a[2]])
        if (!sorted.length)
          return undefined
        const rules = sorted
          .map(([selector, body], idx) => {
            if (selector && this.config.mergeSelectors) {
              // search for rules that has exact same body, and merge them
              // the index is reversed to make sure we always merge to the last one
              for (let i = size - 1; i > idx; i--) {
                const current = sorted[i]
                if (current && current[0] && current[1] === body) {
                  current[0] = `${selector},${current[0]}`
                  return null
                }
              }
            }
            return selector
              ? `${selector}{${body}}`
              : body
          })
          .filter(Boolean)
          .join('\n')

        return query
          ? `${query}{\n${rules}\n}`
          : rules
      })
        .filter(Boolean)
        .join('\n')

      if (preflights) {
        css = [
          ...this.config.preflights
            .filter(i => (i.layer || 'default') === layer)
            .map(i => i.getCSS())
            .filter(Boolean),
          css,
        ]
          .join('\n')
      }

      return layerCache[layer] = layerComments
        ? `/* layer: ${layer} */\n${css}`
        : css
    }

    const getLayers = (excludes?: string[]) => {
      return layers
        .filter(i => !excludes?.includes(i))
        .map(i => getLayer(i) || '').join('\n')
    }

    return {
      get css() { return getLayers() },
      layers,
      getLayers,
      getLayer,
      matched,
    }
  }

  matchVariants(raw: string): VariantMatchedResult {
    // process variants
    const usedVariants = new Set<Variant>()
    const handlers: VariantHandler[] = []
    let processed = raw
    let applied = false
    while (true) {
      applied = false
      for (const v of this.config.variants) {
        if (!v.multiPass && usedVariants.has(v))
          continue
        let handler = v.match(processed, raw, this.config.theme)
        if (!handler)
          continue
        if (typeof handler === 'string')
          handler = { matcher: handler }
        if (handler) {
          processed = handler.matcher
          handlers.push(handler)
          usedVariants.add(v)
          applied = true
          break
        }
      }
      if (!applied)
        break

      if (handlers.length > 500)
        throw new Error(`Too many variants applied to "${raw}"`)
    }

    return [raw, processed, handlers]
  }

  applyVariants(parsed: ParsedUtil, variantHandlers = parsed[4], raw = parsed[1]) {
    const selector = variantHandlers.reduce((p, v) => v.selector?.(p) || p, toEscapedSelector(raw))
    const mediaQuery = variantHandlers.reduce((p: string | undefined, v) => v.mediaQuery || p, undefined)
    const entries = variantHandlers.reduce((p, v) => v.body?.(p) || p, parsed[2])
    return [
      selector,
      entries,
      mediaQuery,
    ] as const
  }

  constructCustomCSS(context: Readonly<RuleContext>, body: CSSObject | CSSEntries, overrideSelector?: string) {
    body = normalizeEntries(body)

    const [selector, entries, mediaQuery] = this.applyVariants([0, overrideSelector || context.rawSelector, body, undefined, context.variantHandlers])
    const cssBody = `${selector}{${entriesToCss(entries)}}`
    if (mediaQuery)
      return `${mediaQuery}{${cssBody}}`
    return cssBody
  }

  async parseUtil(input: string | VariantMatchedResult): Promise<ParsedUtil | RawUtil | undefined> {
    const { theme, rulesStaticMap, rulesDynamic, rulesSize } = this.config

    const [raw, processed, variantHandlers] = typeof input === 'string'
      ? this.matchVariants(input)
      : input

    // use map to for static rules
    const staticMatch = rulesStaticMap[processed]
    if (staticMatch?.[1])
      return [staticMatch[0], raw, normalizeEntries(staticMatch[1]), staticMatch[2], variantHandlers]

    const context: RuleContext = {
      rawSelector: raw,
      currentSelector: processed,
      theme,
      generator: this,
      variantHandlers,
      constructCSS: (...args) => this.constructCustomCSS(context, ...args),
    }

    // match rules, from last to first
    for (let i = rulesSize; i >= 0; i--) {
      const rule = rulesDynamic[i]

      // static rules are omitted as undefined
      if (!rule)
        continue

      // dynamic rules
      const [matcher, handler, meta] = rule
      const match = processed.match(matcher)
      if (!match)
        continue

      const result = await handler(match, context)
      if (typeof result === 'string')
        return [i, result, meta]
      if (result)
        return [i, raw, normalizeEntries(result), meta, variantHandlers]
    }
  }

  stringifyUtil(parsed?: ParsedUtil | RawUtil): StringifiedUtil | undefined {
    if (!parsed)
      return

    if (isRawUtil(parsed))
      return [parsed[0], undefined, parsed[1], undefined, parsed[2]]

    const [selector, entries, mediaQuery] = this.applyVariants(parsed)
    const body = entriesToCss(entries)

    if (!body)
      return

    return [parsed[0], selector, body, mediaQuery, parsed[3]]
  }

  expandShortcut(processed: string, depth = 3): [string[], RuleMeta | undefined] | undefined {
    if (depth === 0)
      return

    let meta: RuleMeta | undefined
    let result: string | string[] | undefined
    for (const s of this.config.shortcuts) {
      if (isStaticShortcut(s)) {
        if (s[0] === processed) {
          meta = meta || s[2]
          result = s[1]
          break
        }
      }
      else {
        const match = processed.match(s[0])
        if (match)
          result = s[1](match)
        if (result) {
          meta = meta || s[2]
          break
        }
      }
    }

    if (!result)
      return

    if (typeof result === 'string')
      result = result.split(/ /g)

    return [
      result.flatMap(r => this.expandShortcut(r, depth - 1)?.[0] || [r]),
      meta,
    ]
  }

  async stringifyShortcuts(parent: VariantMatchedResult, expanded: string[], meta: RuleMeta | undefined): Promise<StringifiedUtil[] | undefined> {
    const selectorMap = new TwoKeyMap<string, string | undefined, [CSSEntries, number]>()

    const parsed = (await Promise.all(uniq(expanded)
      .map(i => this.parseUtil(i) as Promise<ParsedUtil>)))
      .filter(Boolean)
      .sort((a, b) => a[0] - b[0])

    const [raw, , parentVariants] = parent

    for (const item of parsed) {
      if (isRawUtil(item))
        continue
      const [selector, entries, mediaQuery] = this.applyVariants(item, [...item[4], ...parentVariants], raw)

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
        if (body)
          return [index, selector, body, mediaQuery, meta]
        return undefined
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

const reScopePlaceholder = / \$\$ /
export const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

function toEscapedSelector(raw: string) {
  if (raw.startsWith('['))
    return raw.replace(/^\[(.+?)(~?=)"(.*)"\]$/, (_, n, s, i) => `[${e(n)}${s}"${e(i)}"]`)
  else
    return `.${e(raw)}`
}

function normalizeEntries(obj: CSSObject | CSSEntries) {
  return !Array.isArray(obj) ? Object.entries(obj) : obj
}
