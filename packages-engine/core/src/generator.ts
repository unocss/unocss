import type { BlocklistMeta, BlocklistValue, ControlSymbols, ControlSymbolsEntry, CSSEntries, CSSEntriesInput, CSSObject, CSSValueInput, ExtendedTokenInfo, ExtractorContext, GenerateOptions, GenerateResult, ParsedUtil, PreflightContext, PreparedRule, RawUtil, ResolvedConfig, Rule, RuleContext, RuleMeta, SafeListContext, Shortcut, ShortcutInlineValue, ShortcutValue, StringifiedUtil, UserConfig, UserConfigDefaults, UtilObject, Variant, VariantContext, VariantHandlerContext, VariantMatchedResult } from './types'
import { version } from '../package.json'
import { resolveConfig } from './config'
import { LAYER_DEFAULT, LAYER_PREFLIGHTS } from './constants'
import { BetterMap, CountableSet, e, entriesToCss, expandVariantGroup, isCountableSet, isRawUtil, isStaticShortcut, isString, noop, normalizeCSSEntries, normalizeCSSValues, notNull, toArray, TwoKeyMap, uniq, warnOnce } from './utils'
import { createNanoEvents } from './utils/events'

export const symbols: ControlSymbols = {
  shortcutsNoMerge: '$$symbol-shortcut-no-merge' as unknown as ControlSymbols['shortcutsNoMerge'],
  noMerge: '$$symbol-no-merge' as unknown as ControlSymbols['noMerge'],
  variants: '$$symbol-variants' as unknown as ControlSymbols['variants'],
  parent: '$$symbol-parent' as unknown as ControlSymbols['parent'],
  selector: '$$symbol-selector' as unknown as ControlSymbols['selector'],
  layer: '$$symbol-layer' as unknown as ControlSymbols['layer'],
  sort: '$$symbol-sort' as unknown as ControlSymbols['sort'],
}

class UnoGeneratorInternal<Theme extends object = object> {
  public readonly version = version
  public readonly events = createNanoEvents<{
    config: (config: ResolvedConfig<Theme>) => void
  }>()

  public config: ResolvedConfig<Theme> = undefined!
  public cache = new Map<string, StringifiedUtil<Theme>[] | null>()
  public blocked = new Set<string>()
  public parentOrders = new Map<string, number>()
  public activatedRules = new Set<Rule<Theme>>()

  protected constructor(
    public userConfig: UserConfig<Theme> = {},
    public defaults: UserConfigDefaults<Theme> = {},
  ) {}

  static async create<Theme extends object = object>(
    userConfig: UserConfig<Theme> = {},
    defaults: UserConfigDefaults<Theme> = {},
  ): Promise<UnoGeneratorInternal<Theme>> {
    const uno = new UnoGeneratorInternal(userConfig, defaults)
    uno.config = await resolveConfig(uno.userConfig, uno.defaults)
    uno.events.emit('config', uno.config)
    return uno
  }

  async setConfig(
    userConfig?: UserConfig<Theme>,
    defaults?: UserConfigDefaults<Theme>,
  ): Promise<void> {
    if (!userConfig)
      return
    if (defaults)
      this.defaults = defaults
    this.userConfig = userConfig
    this.blocked.clear()
    this.parentOrders.clear()
    this.activatedRules.clear()
    this.cache.clear()
    this.config = await resolveConfig(userConfig, this.defaults)
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
    if (this.cache.has(cacheKey))
      return this.cache.get(cacheKey)

    const current = this.config.preprocess.reduce((acc, p) => p(acc) ?? acc, raw)

    if (this.isBlocked(current)) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }

    const variantResults = await this.matchVariants(raw, current)

    if (variantResults.every(i => !i || this.isBlocked(i[1]))) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }

    const handleVariantResult = async (matched: VariantMatchedResult<Theme>) => {
      const context = this.makeContext(raw, [alias || matched[0], matched[1], matched[2], matched[3]])

      if (this.config.details)
        context.variants = [...matched[3]]

      // expand shortcuts
      const expanded = await this.expandShortcut(context.currentSelector, context)
      const utils = expanded
        ? await this.stringifyShortcuts(context.variantMatch, context, expanded[0], expanded[1])
        // no shortcuts
        : (await this.parseUtil(context.variantMatch, context))?.map(i => this.stringifyUtil(i, context)).filter(notNull)

      return utils
    }

    const result = (await Promise.all(variantResults.map(i => handleVariantResult(i)))).flat().filter(x => !!x)
    if (result?.length) {
      this.cache.set(cacheKey, result)
      return result
    }

    // set null cache for unmatched result
    this.cache.set(cacheKey, null)
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
          const trimedS = s.trim()
          if (trimedS && !tokens.has(trimedS))
            tokens.add(trimedS)
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
    const outputCssLayers = this.config.outputToCssLayers
    const getLayerAlias = (layer: string) => {
      let alias: string | undefined | null = layer
      if (typeof outputCssLayers === 'object') {
        alias = outputCssLayers.cssLayerName?.(layer)
      }
      return alias === null ? null : alias ?? layer
    }

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
          const ruleLines = sorted
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

          const rules = Array.from(new Set(ruleLines))
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

      let alias
      if (outputCssLayers && css) {
        alias = getLayerAlias(layer)
        if (alias !== null) {
          css = `@layer ${alias}{${nl}${css}${nl}}`
        }
      }

      const layerMark = minify ? '' : `/* layer: ${layer}${alias && alias !== layer ? `, alias: ${alias}` : ''} */${nl}`
      return layerCache[layer] = css ? layerMark + css : ''
    }

    const getLayers = (includes = layers, excludes?: string[]) => {
      const layers = includes.filter(i => !excludes?.includes(i))
      return [
        outputCssLayers && layers.length > 0 ? `@layer ${layers.map(getLayerAlias).filter(notNull).join(', ')};` : undefined,
        ...layers.map(i => getLayer(i) || ''),
      ].filter(Boolean).join(nl)
    }

    const setLayer = async (layer: string, callback: (content: string) => Promise<string>) => {
      const content = await callback(getLayer(layer))
      layerCache[layer] = content
      return content
    }

    return {
      get css() { return getLayers() },
      layers,
      matched,
      getLayers,
      getLayer,
      setLayer,
    }
  }

  async matchVariants(
    raw: string,
    current?: string,
  ): Promise<readonly VariantMatchedResult<Theme>[]> {
    const context: VariantContext<Theme> = {
      rawSelector: raw,
      theme: this.config.theme,
      generator: this,
    }

    const match = async (result: VariantMatchedResult<Theme>): Promise<VariantMatchedResult<Theme>[]> => {
      let applied = true
      const [,, handlers, variants] = result
      while (applied) {
        applied = false
        const processed = result[1]
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

          // If variant return an array of handlers,
          // we clone the matched result and branch the matching items
          if (Array.isArray(handler)) {
            if (!handler.length)
              continue
            if (handler.length === 1) {
              handler = handler[0]
            }
            else {
              if (v.multiPass)
                throw new Error('multiPass can not be used together with array return variants')

              const clones = handler.map((h): VariantMatchedResult<Theme> => {
                const _processed = h.matcher ?? processed
                const _handlers = [h, ...handlers]
                const _variants = new Set(variants)
                _variants.add(v)
                return [result[0], _processed, _handlers, _variants]
              })
              return (await Promise.all(clones.map(c => match(c)))).flat()
            }
          }

          result[1] = handler.matcher ?? processed
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

      return [result]
    }

    return await match([
      raw,
      current || raw,
      [],
      new Set<Variant<Theme>>(),
    ])
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

          const selector = v.selector?.(input.selector, entries)

          return (v.handle ?? defaultVariantHandler)({
            ...input,
            entries,
            selector: selector || input.selector,
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
    const variantResults = isString(input)
      ? await this.matchVariants(input)
      : [input]

    const parse = async (
      [raw, processed, variantHandlers]: VariantMatchedResult<Theme>,
    ): Promise<(ParsedUtil | RawUtil)[] | undefined> => {
      if (this.config.details)
        context.rules = context.rules ?? []

      // Avoid context pollution in loop with await
      const scopeContext = {
        ...context,
        variantHandlers,
      }

      // use map to for static rules
      const staticMatch = this.config.rulesStaticMap[processed]
      if (staticMatch) {
        if (staticMatch[1] && (internal || !staticMatch[2]?.internal)) {
          return this.resolveCSSResult(raw, staticMatch[1], staticMatch, scopeContext)
        }
      }

      // match rules
      for (const rule of this.config.rulesDynamic) {
        const [matcher, handler, meta] = rule
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

        let result = await handler(match, scopeContext)
        if (!result)
          continue

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

        const resolvedResult = this.resolveCSSResult(raw, result, rule, scopeContext)
        if (resolvedResult) {
          return resolvedResult
        }
      }
    }

    const parsed = (await Promise.all(variantResults.map(i => parse(i)))).flat().filter(x => !!x)
    if (!parsed.length)
      return undefined

    return parsed
  }

  private resolveCSSResult = (
    raw: string,
    result: CSSValueInput | string | (CSSValueInput | string)[],
    rule: Rule<Theme>,
    context: RuleContext<Theme>,
  ) => {
    const entries = normalizeCSSValues(result).filter(i => i.length) as (string | CSSEntriesInput)[]
    if (entries.length) {
      if (this.config.details) {
        context.rules!.push(rule)
      }
      context.generator.activatedRules.add(rule)
      const index = context.generator.config.rules.indexOf(rule)
      const meta = rule[2]

      return entries.map((css): ParsedUtil | RawUtil => {
        if (isString(css))
          return [index, css, meta]

        // Extract variants from special symbols
        let variants = context.variantHandlers
        let entryMeta = meta
        for (const entry of css) {
          if (entry[0] === symbols.variants) {
            if (typeof entry[1] === 'function') {
              variants = entry[1](variants) || variants
            }
            else {
              variants = [
                ...toArray(entry[1]),
                ...variants,
              ]
            }
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
          else if (entry[0] === symbols.layer) {
            variants = [
              { layer: entry[1] },
              ...variants,
            ]
          }
          else if (entry[0] === symbols.sort) {
            entryMeta = {
              ...entryMeta,
              sort: entry[1],
            }
          }
          else if (entry[0] === symbols.noMerge) {
            entryMeta = {
              ...entryMeta,
              noMerge: entry[1],
            }
          }
        }

        return [index, raw, css as CSSEntries, entryMeta, variants]
      })
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
  ): Promise<[(string | ShortcutInlineValue)[], RuleMeta | undefined] | undefined> {
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
    let stringResult: string[] | undefined
    let inlineResult: ShortcutInlineValue[] | undefined

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

    if (result) {
      stringResult = uniq(toArray(result).filter(isString).map(s => expandVariantGroup(s.trim()).split(/\s+/g)).flat())
      inlineResult = toArray(result).filter(i => !isString(i)).map(i => ({ handles: [], value: i }))
    }

    // expand nested shortcuts with variants
    if (!result) {
      const matched = isString(input) ? await this.matchVariants(input) : [input]
      for (const match of matched) {
        const [raw, inputWithoutVariant, handles] = match
        if (raw !== inputWithoutVariant) {
          const expanded = await this.expandShortcut(inputWithoutVariant, context, depth - 1)
          if (expanded) {
            stringResult = expanded[0].filter(isString).map(item => raw.replace(inputWithoutVariant, item))
            inlineResult = (expanded[0].filter(i => !isString(i)) as ShortcutInlineValue[]).map((item) => {
              return { handles: [...item.handles, ...handles], value: item.value }
            })
          }
        }
      }
    }

    if (!stringResult?.length && !inlineResult?.length)
      return

    return [
      [
        (await Promise.all(toArray(stringResult).map(async s => ((await this.expandShortcut(s, context, depth - 1))?.[0]) || [s]))),
        inlineResult!,
      ].flat(2).filter(x => !!x),
      meta,
    ]
  }

  async stringifyShortcuts(
    parent: VariantMatchedResult<Theme>,
    context: RuleContext<Theme>,
    expanded: (string | ShortcutInlineValue)[],
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
            : [[Number.POSITIVE_INFINITY, '{inline}', normalizeCSSEntries(i.value), undefined, i.handles] as ParsedUtil]

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

export class UnoGenerator<Theme extends object = object> extends UnoGeneratorInternal<Theme> {
  /**
   * @deprecated `new UnoGenerator` is deprecated, please use `createGenerator()` instead
   */
  constructor(
    userConfig: UserConfig<Theme> = {},
    defaults: UserConfigDefaults<Theme> = {},
  ) {
    super(userConfig, defaults)
    console.warn('`new UnoGenerator()` is deprecated, please use `createGenerator()` instead')
  }
}

export async function createGenerator<Theme extends object = object>(
  config?: UserConfig<Theme>,
  defaults?: UserConfigDefaults<Theme>,
): Promise<UnoGenerator<Theme>> {
  return await UnoGeneratorInternal.create(config, defaults)
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
