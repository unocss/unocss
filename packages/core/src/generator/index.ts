import { createNanoEvents } from '../utils/events'
import type { BlocklistMeta, BlocklistValue, CSSEntries, CSSEntriesInput, CSSObject, CSSValueInput, ControlSymbols, ControlSymbolsEntry, DynamicRule, ExtendedTokenInfo, ExtractorContext, GenerateOptions, GenerateResult, ParsedUtil, PreflightContext, PreparedRule, RawUtil, ResolvedConfig, RuleContext, RuleMeta, SafeListContext, Shortcut, ShortcutValue, StringifiedUtil, UserConfig, UserConfigDefaults, UtilObject, Variant, VariantContext, VariantHandler, VariantHandlerContext, VariantMatchedResult } from '../types'
import { resolveConfig } from '../config'
import { BetterMap, CountableSet, TwoKeyMap, e, entriesToCss, expandVariantGroup, isCountableSet, isRawUtil, isStaticShortcut, isString, noop, normalizeCSSEntries, normalizeCSSValues, notNull, toArray, uniq, warnOnce } from '../utils'
import { version } from '../../package.json'
import { LAYER_DEFAULT, LAYER_PREFLIGHTS } from '../constants'

export const symbols: ControlSymbols = {
  shortcutsNoMerge: '$$symbol-shortcut-no-merge' as unknown as ControlSymbols['shortcutsNoMerge'],
  variants: '$$symbol-variants' as unknown as ControlSymbols['variants'],
  parent: '$$symbol-parent' as unknown as ControlSymbols['parent'],
  selector: '$$symbol-selector' as unknown as ControlSymbols['selector'],
}

export class UnoGenerator<Theme extends object = object> {
  public version = version
  private _cache = new Map<string, StringifiedUtil<Theme>[] | null>()
  public config: ResolvedConfig<Theme>
  public blocked = new Set<string>()
  public parentOrders = new Map<string, number>()
  public events = createNanoEvents<{
    config: (config: ResolvedConfig<Theme>) => void
  }>()

  constructor(
    public userConfig: UserConfig<Theme> = {},
    public defaults: UserConfigDefaults<Theme> = {},
  ) {
    this.config = resolveConfig(userConfig, defaults)
    this.events.emit('config', this.config)
  }

  setConfig(
    userConfig?: UserConfig<Theme>,
    defaults?: UserConfigDefaults<Theme>,
  ): void {
    if (!userConfig)
      return
    if (defaults)
      this.defaults = defaults
    this.userConfig = userConfig
    this.blocked.clear()
    this.parentOrders.clear()
    this._cache.clear()
    this.config = resolveConfig(userConfig, this.defaults)
    this.events.emit('config', this.config)
  }

  applyExtractors(
    code: string,
    id?: string,
    extracted?: Set<string>,
  ): Promise<Set<string>>
  applyExtractors(
    code: string,
    id?: string,
    extracted?: CountableSet<string>,
  ): Promise<CountableSet<string>>
  async applyExtractors(
    code: string,
    id?: string,
    extracted: Set<string> | CountableSet<string> = new Set<string>(),
  ): Promise<Set<string> | CountableSet<string>> {
    const context: ExtractorContext = {
      original: code,
      code,
      id,
      extracted,
      envMode: this.config.envMode,
    }

    for (const extractor of this.config.extractors) {
      const result = await extractor.extract?.(context)

      if (!result)
        continue

      if (isCountableSet(result) && isCountableSet(extracted)) {
        for (const token of result)
          extracted.setCount(token, extracted.getCount(token) + result.getCount(token))
      }
      else {
        for (const token of result)
          extracted.add(token)
      }
    }

    return extracted
  }

  makeContext(raw: string, applied: VariantMatchedResult<Theme>): RuleContext<Theme> {
    const context: RuleContext<Theme> = {
      rawSelector: raw,
      currentSelector: applied[1],
      theme: this.config.theme,
      generator: this,
      symbols,
      variantHandlers: applied[2],
      constructCSS: (...args) => this.constructCustomCSS(context, ...args),
      variantMatch: applied,
    }
    return context
  }

  async parseToken(
    raw: string,
    alias?: string,
  ): Promise<StringifiedUtil<Theme>[] | undefined | null> {
    if (this.blocked.has(raw))
      return

    const cacheKey = `${raw}${alias ? ` ${alias}` : ''}`

    // use caches if possible
    if (this._cache.has(cacheKey))
      return this._cache.get(cacheKey)

    let current = raw
    for (const p of this.config.preprocess)
      current = p(raw)!

    if (this.isBlocked(current)) {
      this.blocked.add(raw)
      this._cache.set(cacheKey, null)
      return
    }

    const applied = await this.matchVariants(raw, current)

    if (!applied || this.isBlocked(applied[1])) {
      this.blocked.add(raw)
      this._cache.set(cacheKey, null)
      return
    }

    const context = this.makeContext(raw, [alias || applied[0], applied[1], applied[2], applied[3]])

    if (this.config.details)
      context.variants = [...applied[3]]

    // expand shortcuts
    const expanded = await this.expandShortcut(context.currentSelector, context)
    const utils = expanded
      ? await this.stringifyShortcuts(context.variantMatch, context, expanded[0], expanded[1])
      // no shortcuts
      : (await this.parseUtil(context.variantMatch, context))?.map(i => this.stringifyUtil(i, context)).filter(notNull)

    if (utils?.length) {
      this._cache.set(cacheKey, utils)
      return utils
    }

    // set null cache for unmatched result
    this._cache.set(cacheKey, null)
  }

  generate(
    input: string | Set<string> | CountableSet<string> | string[],
    options?: GenerateOptions<false>
  ): Promise<GenerateResult<Set<string>>>
  generate(
    input: string | Set<string> | CountableSet<string> | string[],
    options?: GenerateOptions<true>
  ): Promise<GenerateResult<Map<string, ExtendedTokenInfo<Theme>>>>
  async generate(
    input: string | Set<string> | CountableSet<string> | string[],
    options: GenerateOptions<boolean> = {},
  ): Promise<GenerateResult<unknown>> {
    const {
      id,
      scope,
      preflights = true,
      safelist = true,
      minify = false,
      extendedInfo = false,
    } = options

    const outputCssLayers = this.config.outputToCssLayers

    const tokens: Readonly<Set<string> | CountableSet<string>> = isString(input)
      ? await this.applyExtractors(
        input,
        id,
        extendedInfo
          ? new CountableSet<string>()
          : new Set<string>(),
      )
      : Array.isArray(input)
        ? new Set<string>(input)
        : input

    if (safelist) {
      const safelistContext: SafeListContext<Theme> = {
        generator: this,
        theme: this.config.theme,
      }

      this.config.safelist
        .flatMap(s => typeof s === 'function' ? s(safelistContext) : s)
        .forEach((s) => {
          // We don't want to increment count if token is already in the set
          if (!tokens.has(s))
            tokens.add(s)
        })
    }

    const nl = minify ? '' : '\n'

    const layerSet = new Set<string>([LAYER_DEFAULT])
    const matched = extendedInfo
      ? new Map<string, ExtendedTokenInfo<Theme>>()
      : new Set<string>()

    const sheet = new Map<string, StringifiedUtil<Theme>[]>()
    let preflightsMap: Record<string, string> = {}

    const tokenPromises = Array.from(tokens).map(async (raw) => {
      if (matched.has(raw))
        return

      const payload = await this.parseToken(raw)
      if (payload == null)
        return

      if (matched instanceof Map) {
        matched.set(raw, {
          data: payload,
          count: isCountableSet(tokens) ? tokens.getCount(raw) : -1,
        })
      }
      else {
        matched.add(raw)
      }

      for (const item of payload) {
        const parent = item[3] || ''
        const layer = item[4]?.layer
        if (!sheet.has(parent))
          sheet.set(parent, [])
        sheet.get(parent)!.push(item)
        if (layer)
          layerSet.add(layer)
      }
    })

    await Promise.all(tokenPromises)
    await (async () => {
      if (!preflights)
        return

      const preflightContext: PreflightContext<Theme> = {
        generator: this,
        theme: this.config.theme,
      }

      const preflightLayerSet = new Set<string>([])
      this.config.preflights.forEach(({ layer = LAYER_PREFLIGHTS }) => {
        layerSet.add(layer)
        preflightLayerSet.add(layer)
      })

      preflightsMap = Object.fromEntries(
        await Promise.all(Array.from(preflightLayerSet).map(
          async (layer) => {
            const preflights = await Promise.all(
              this.config.preflights
                .filter(i => (i.layer || LAYER_PREFLIGHTS) === layer)
                .map(async i => await i.getCSS(preflightContext)),
            )
            const css = preflights
              .filter(Boolean)
              .join(nl)
            return [layer, css]
          },
        )),
      )
    })()

    const layers = this.config.sortLayers(Array
      .from(layerSet)
      .sort((a, b) => ((this.config.layers[a] ?? 0) - (this.config.layers[b] ?? 0)) || a.localeCompare(b)))

    const layerCache: Record<string, string> = {}
    const getLayer = (layer: string = LAYER_DEFAULT) => {
      if (layerCache[layer])
        return layerCache[layer]

      let css = Array.from(sheet)
        .sort((a, b) => ((this.parentOrders.get(a[0]) ?? 0) - (this.parentOrders.get(b[0]) ?? 0)) || a[0]?.localeCompare(b[0] || '') || 0)
        .map(([parent, items]) => {
          const size = items.length
          const sorted: PreparedRule[] = items
            .filter(i => (i[4]?.layer || LAYER_DEFAULT) === layer)
            .sort((a, b) => {
              return a[0] - b[0] // rule index
                || (a[4]?.sort || 0) - (b[4]?.sort || 0) // sort context
                || a[5]?.currentSelector?.localeCompare(b[5]?.currentSelector ?? '') // shortcuts
                || a[1]?.localeCompare(b[1] || '') // selector
                || a[2]?.localeCompare(b[2] || '') // body
                || 0
            })
            .map(([, selector, body, , meta, , variantNoMerge]) => {
              const scopedSelector = selector ? applyScope(selector, scope) : selector
              return [
                [[scopedSelector ?? '', meta?.sort ?? 0]],
                body,
                !!(variantNoMerge ?? meta?.noMerge),
              ]
            })
          if (!sorted.length)
            return undefined
          const rules = sorted
            .reverse()
            .map(([selectorSortPair, body, noMerge], idx) => {
              if (!noMerge && this.config.mergeSelectors) {
                // search for rules that has exact same body, and merge them
                for (let i = idx + 1; i < size; i++) {
                  const current = sorted[i]
                  if (current && !current[2] && ((selectorSortPair && current[0]) || (selectorSortPair == null && current[0] == null)) && current[1] === body) {
                    if (selectorSortPair && current[0])
                      current[0].push(...selectorSortPair)
                    return null
                  }
                }
              }

              const selectors = selectorSortPair
                ? uniq(selectorSortPair
                  .sort((a, b) => a[1] - b[1] || a[0]?.localeCompare(b[0] || '') || 0)
                  .map(pair => pair[0])
                  .filter(Boolean))
                : []

              return selectors.length
                ? `${selectors.join(`,${nl}`)}{${body}}`
                : body
            })
            .filter(Boolean)
            .reverse()
            .join(nl)

          if (!parent)
            return rules

          const parents = parent.split(' $$ ')
          return `${parents.join('{')}{${nl}${rules}${nl}${'}'.repeat(parents.length)}`
        })
        .filter(Boolean)
        .join(nl)

      if (preflights) {
        css = [preflightsMap[layer], css]
          .filter(Boolean)
          .join(nl)
      }

      if (outputCssLayers && css) {
        let cssLayer = typeof outputCssLayers === 'object'
          ? (outputCssLayers.cssLayerName?.(layer))
          : undefined

        if (cssLayer !== null) {
          if (!cssLayer)
            cssLayer = layer

          css = `@layer ${cssLayer}{${nl}${css}${nl}}`
        }
      }

      const layerMark = minify ? '' : `/* layer: ${layer} */${nl}`
      return layerCache[layer] = css ? layerMark + css : ''
    }

    const getLayers = (includes = layers, excludes?: string[]) => {
      return includes
        .filter(i => !excludes?.includes(i))
        .map(i => getLayer(i) || '')
        .filter(Boolean)
        .join(nl)
    }

    return {
      get css() { return getLayers() },
      layers,
      matched,
      getLayers,
      getLayer,
    }
  }

  async matchVariants(
    raw: string,
    current?: string,
  ): Promise<VariantMatchedResult<Theme>> {
    // process variants
    const variants = new Set<Variant<Theme>>()
    const handlers: VariantHandler[] = []
    let processed = current || raw
    let applied = true

    const context: VariantContext<Theme> = {
      rawSelector: raw,
      theme: this.config.theme,
      generator: this,
    }

    while (applied) {
      applied = false
      for (const v of this.config.variants) {
        if (!v.multiPass && variants.has(v))
          continue
        let handler = await v.match(processed, context)
        if (!handler)
          continue
        if (isString(handler)) {
          if (handler === processed)
            continue
          handler = { matcher: handler }
        }
        processed = handler.matcher ?? processed
        handlers.unshift(handler)
        variants.add(v)
        applied = true
        break
      }
      if (!applied)
        break

      if (handlers.length > 500)
        throw new Error(`Too many variants applied to "${raw}"`)
    }

    return [raw, processed, handlers, variants]
  }

  private applyVariants(
    parsed: ParsedUtil,
    variantHandlers = parsed[4],
    raw = parsed[1],
  ): UtilObject {
    const handler = variantHandlers.slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .reduceRight(
        (previous, v) => (input: VariantHandlerContext) => {
          const entries = v.body?.(input.entries) || input.entries
          const parents: [string | undefined, number | undefined] = Array.isArray(v.parent)
            ? v.parent
            : [v.parent, undefined]
          return (v.handle ?? defaultVariantHandler)({
            ...input,
            entries,
            selector: v.selector?.(input.selector, entries) || input.selector,
            parent: parents[0] || input.parent,
            parentOrder: parents[1] || input.parentOrder,
            layer: v.layer || input.layer,
            sort: v.sort || input.sort,
          }, previous)
        },
        (input: VariantHandlerContext) => input,
      )

    const variantContextResult = handler({
      prefix: '',
      selector: toEscapedSelector(raw),
      pseudo: '',
      entries: parsed[2],
    })

    const { parent, parentOrder } = variantContextResult
    if (parent != null && parentOrder != null)
      this.parentOrders.set(parent, parentOrder)

    const obj: UtilObject = {
      selector: [
        variantContextResult.prefix,
        variantContextResult.selector,
        variantContextResult.pseudo,
      ].join(''),
      entries: variantContextResult.entries,
      parent,
      layer: variantContextResult.layer,
      sort: variantContextResult.sort,
      noMerge: variantContextResult.noMerge,
    }

    for (const p of this.config.postprocess)
      p(obj)

    return obj
  }

  constructCustomCSS(
    context: Readonly<RuleContext<Theme>>,
    body: CSSObject | CSSEntries,
    overrideSelector?: string,
  ): string {
    const normalizedBody = normalizeCSSEntries(body)
    if (isString(normalizedBody))
      return normalizedBody

    const { selector, entries, parent } = this.applyVariants([0, overrideSelector || context.rawSelector, normalizedBody, undefined, context.variantHandlers])
    const cssBody = `${selector}{${entriesToCss(entries)}}`
    if (parent)
      return `${parent}{${cssBody}}`
    return cssBody
  }

  async parseUtil(
    input: string | VariantMatchedResult<Theme>,
    context: RuleContext<Theme>,
    internal = false,
    shortcutPrefix?: string | string[] | undefined,
  ): Promise<(ParsedUtil | RawUtil)[] | undefined> {
    const [raw, processed, variantHandlers] = isString(input)
      ? await this.matchVariants(input)
      : input

    if (this.config.details)
      context.rules = context.rules ?? []

    // use map to for static rules
    const staticMatch = this.config.rulesStaticMap[processed]
    if (staticMatch) {
      if (staticMatch[1] && (internal || !staticMatch[2]?.internal)) {
        if (this.config.details)
          context.rules!.push(staticMatch[3])

        const index = staticMatch[0]
        const entry = normalizeCSSEntries(staticMatch[1])
        const meta = staticMatch[2]
        if (isString(entry))
          return [[index, entry, meta]]
        else
          return [[index, raw, entry, meta, variantHandlers]]
      }
    }

    context.variantHandlers = variantHandlers

    const { rulesDynamic } = this.config

    // match rules
    for (const [i, matcher, handler, meta] of rulesDynamic) {
      // ignore internal rules
      if (meta?.internal && !internal)
        continue

      // match prefix
      let unprefixed = processed
      if (meta?.prefix) {
        const prefixes = toArray(meta.prefix)
        if (shortcutPrefix) {
          const shortcutPrefixes = toArray(shortcutPrefix)
          if (!prefixes.some(i => shortcutPrefixes.includes(i)))
            continue
        }
        else {
          const prefix = prefixes.find(i => processed.startsWith(i))
          if (prefix == null)
            continue
          unprefixed = processed.slice(prefix.length)
        }
      }

      // match rule
      const match = unprefixed.match(matcher)
      if (!match)
        continue

      let result = await handler(match, context)
      if (!result)
        continue

      if (this.config.details)
        context.rules!.push([matcher, handler, meta] as DynamicRule<Theme>)

      // Handle generator result
      if (typeof result !== 'string') {
        if (Symbol.asyncIterator in result) {
          const entries: (CSSValueInput | string)[] = []
          for await (const r of result) {
            if (r)
              entries.push(r)
          }
          result = entries
        }
        else if (Symbol.iterator in result && !Array.isArray(result)) {
          result = Array.from(result)
            .filter(notNull)
        }
      }

      const entries = normalizeCSSValues(result).filter(i => i.length) as (string | CSSEntriesInput)[]
      if (entries.length) {
        return entries.map((css): ParsedUtil | RawUtil => {
          if (isString(css)) {
            return [i, css, meta]
          }

          // Extract variants from special symbols
          let variants = variantHandlers
          for (const entry of css) {
            if (entry[0] === symbols.variants) {
              variants = [
                ...toArray(entry[1]),
                ...variants,
              ]
            }
            else if (entry[0] === symbols.parent) {
              variants = [
                { parent: entry[1] },
                ...variants,
              ]
            }
            else if (entry[0] === symbols.selector) {
              variants = [
                { selector: entry[1] },
                ...variants,
              ]
            }
          }

          return [i, raw, css as CSSEntries, meta, variants]
        })
      }
    }
  }

  stringifyUtil(
    parsed?: ParsedUtil | RawUtil,
    context?: RuleContext<Theme>,
  ): StringifiedUtil<Theme> | undefined {
    if (!parsed)
      return
    if (isRawUtil(parsed))
      return [parsed[0], undefined, parsed[1], undefined, parsed[2], this.config.details ? context : undefined, undefined]

    const {
      selector,
      entries,
      parent,
      layer: variantLayer,
      sort: variantSort,
      noMerge,
    } = this.applyVariants(parsed)
    const body = entriesToCss(entries)

    if (!body)
      return

    const { layer: metaLayer, sort: metaSort, ...meta } = parsed[3] ?? {}
    const ruleMeta = {
      ...meta,
      layer: variantLayer ?? metaLayer,
      sort: variantSort ?? metaSort,
    }
    return [parsed[0], selector, body, parent, ruleMeta, this.config.details ? context : undefined, noMerge]
  }

  async expandShortcut(
    input: string,
    context: RuleContext<Theme>,
    depth = 5,
  ): Promise<[ShortcutValue[], RuleMeta | undefined] | undefined> {
    if (depth === 0)
      return

    const recordShortcut = this.config.details
      ? (s: Shortcut<Theme>) => {
          context.shortcuts = context.shortcuts ?? []
          context.shortcuts.push(s)
        }
      : noop

    let meta: RuleMeta | undefined
    let result: string | ShortcutValue[] | undefined
    for (const s of this.config.shortcuts) {
      let unprefixed = input
      if (s[2]?.prefix) {
        const prefixes = toArray(s[2].prefix)
        const prefix = prefixes.find(i => input.startsWith(i))
        if (prefix == null)
          continue
        unprefixed = input.slice(prefix.length)
      }
      if (isStaticShortcut(s)) {
        if (s[0] === unprefixed) {
          meta = meta || s[2]
          result = s[1]
          recordShortcut(s)
          break
        }
      }
      else {
        const match = unprefixed.match(s[0])
        if (match)
          result = s[1](match, context)
        if (result) {
          meta = meta || s[2]
          recordShortcut(s)
          break
        }
      }
    }

    // expand nested shortcuts
    if (isString(result))
      result = expandVariantGroup(result.trim()).split(/\s+/g)

    // expand nested shortcuts with variants
    if (!result) {
      const [raw, inputWithoutVariant] = isString(input) ? await this.matchVariants(input) : input
      if (raw !== inputWithoutVariant) {
        const expanded = await this.expandShortcut(inputWithoutVariant, context, depth - 1)
        if (expanded)
          result = expanded[0].map(item => isString(item) ? raw.replace(inputWithoutVariant, item) : item)
      }
    }

    if (!result)
      return

    return [
      (await Promise.all(result.map(async r => (
        isString(r)
          ? (await this.expandShortcut(r, context, depth - 1))?.[0]
          : undefined
      ) || [r])))
        .flat(1)
        .filter(Boolean),
      meta,
    ]
  }

  async stringifyShortcuts(
    parent: VariantMatchedResult<Theme>,
    context: RuleContext<Theme>,
    expanded: ShortcutValue[],
    meta: RuleMeta = { layer: this.config.shortcutsLayer },
  ): Promise<StringifiedUtil<Theme>[] | undefined> {
    const layerMap = new BetterMap<string | undefined, TwoKeyMap<string, string | undefined, [[CSSEntries, boolean, number][], number]>>()

    const parsed = (
      await Promise.all(uniq(expanded)
        .map(async (i) => {
          const result = isString(i)
            // rule
            ? await this.parseUtil(i, context, true, meta.prefix) as ParsedUtil[]
            // inline CSS value in shortcut
            : [[Number.POSITIVE_INFINITY, '{inline}', normalizeCSSEntries(i), undefined, []] as ParsedUtil]

          if (!result && this.config.warn)
            warnOnce(`unmatched utility "${i}" in shortcut "${parent[1]}"`)
          return result || []
        })))
      .flat(1)
      .filter(Boolean)
      .sort((a, b) => a[0] - b[0])

    const [raw, , parentVariants] = parent
    const rawStringifiedUtil: StringifiedUtil<Theme>[] = []
    for (const item of parsed) {
      if (isRawUtil(item)) {
        rawStringifiedUtil.push([item[0], undefined, item[1], undefined, item[2], context, undefined])
        continue
      }
      const { selector, entries, parent, sort, noMerge, layer } = this.applyVariants(item, [...item[4], ...parentVariants], raw)

      // find existing layer and merge
      const selectorMap = layerMap.getFallback(layer ?? meta.layer, new TwoKeyMap())
      // find existing selector/mediaQuery pair and merge
      const mapItem = selectorMap.getFallback(selector, parent, [[], item[0]])
      // add entries
      mapItem[0].push([entries, !!(noMerge ?? item[3]?.noMerge), sort ?? 0])
    }
    return rawStringifiedUtil.concat(layerMap
      .flatMap((selectorMap, layer) =>
        selectorMap
          .map(([e, index], selector, joinedParents) => {
            const stringify = (flatten: boolean, noMerge: boolean, entrySortPair: [CSSEntries, number][]): (StringifiedUtil<Theme> | undefined)[] => {
              const maxSort = Math.max(...entrySortPair.map(e => e[1]))
              const entriesList = entrySortPair.map(e => e[0])
              return (flatten ? [entriesList.flat(1)] : entriesList).map((entries: CSSEntries): StringifiedUtil<Theme> | undefined => {
                const body = entriesToCss(entries)
                if (body)
                  return [index, selector, body, joinedParents, { ...meta, noMerge, sort: maxSort, layer }, context, undefined]
                return undefined
              })
            }

            const merges = [
              [e.filter(([, noMerge]) => noMerge).map(([entries, , sort]) => [entries, sort]), true],
              [e.filter(([, noMerge]) => !noMerge).map(([entries, , sort]) => [entries, sort]), false],
            ] as [[CSSEntries, number][], boolean][]

            return merges.map(([e, noMerge]) => [
              ...stringify(false, noMerge, e.filter(([entries]) => entries.some(entry => (entry as unknown as ControlSymbolsEntry)[0] === symbols.shortcutsNoMerge))),
              ...stringify(true, noMerge, e.filter(([entries]) => entries.every(entry => (entry as unknown as ControlSymbolsEntry)[0] !== symbols.shortcutsNoMerge))),
            ])
          })
          .flat(2)
          .filter(Boolean) as StringifiedUtil<Theme>[],
      ))
  }

  isBlocked(raw: string): boolean {
    return !raw || this.config.blocklist
      .map(e => Array.isArray(e) ? e[0] : e)
      .some(e => typeof e === 'function' ? e(raw) : isString(e) ? e === raw : e.test(raw))
  }

  getBlocked(raw: string): [BlocklistValue, BlocklistMeta | undefined] | undefined {
    const rule = this.config.blocklist
      .find((e) => {
        const v = Array.isArray(e) ? e[0] : e
        return typeof v === 'function' ? v(raw) : isString(v) ? v === raw : v.test(raw)
      })

    return rule ? (Array.isArray(rule) ? rule : [rule, undefined]) : undefined
  }
}

export function createGenerator<Theme extends object = object>(config?: UserConfig<Theme>, defaults?: UserConfigDefaults<Theme>) {
  return new UnoGenerator<Theme>(config, defaults)
}

export const regexScopePlaceholder = /\s\$\$\s+/g
export function hasScopePlaceholder(css: string) {
  return regexScopePlaceholder.test(css)
}

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(regexScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

const attributifyRe = /^\[(.+?)(~?=)"(.*)"\]$/

export function toEscapedSelector(raw: string) {
  if (attributifyRe.test(raw))
    return raw.replace(attributifyRe, (_, n, s, i) => `[${e(n)}${s}"${e(i)}"]`)
  return `.${e(raw)}`
}

function defaultVariantHandler(input: VariantHandlerContext, next: (input: VariantHandlerContext) => VariantHandlerContext) {
  return next(input)
}
