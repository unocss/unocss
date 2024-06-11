import type { LoadConfigResult } from 'unconfig'
import type MagicString from 'magic-string'
import type { UnoGenerator } from './generator'
import type { BetterMap, CountableSet } from './utils'

export type Awaitable<T> = T | Promise<T>
export type Arrayable<T> = T | T[]
export type ToArray<T> = T extends (infer U)[] ? U[] : T[]
export type ArgumentType<T> = T extends ((...args: infer A) => any) ? A : never
export type Shift<T> = T extends [_: any, ...args: infer A] ? A : never
export type RestArgs<T> = Shift<ArgumentType<T>>
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
export type FlatObjectTuple<T> = { [K in keyof T]: T[K] }
export type PartialByKeys<T, K extends keyof T = keyof T> = FlatObjectTuple<Partial<Pick<T, Extract<keyof T, K>>> & Omit<T, K>>
export type RequiredByKey<T, K extends keyof T = keyof T> = FlatObjectTuple<Required<Pick<T, Extract<keyof T, K>>> & Omit<T, K>>

export type CSSObject = Record<string, string | number | undefined>
export type CSSEntry = [string, string | number | undefined]
export type CSSEntries = CSSEntry[]

export type CSSObjectInput = CSSObject | Partial<ControlSymbolsValue>
export type CSSEntriesInput = (CSSEntry | ControlSymbolsEntry)[]
export type CSSValueInput = CSSObjectInput | CSSEntriesInput | CSSValue

export type PresetOptions = Record<string, any>

export interface RuleContext<Theme extends object = object> {
  /**
   * Unprocessed selector from user input.
   * Useful for generating CSS rule.
   */
  rawSelector: string
  /**
   * Current selector for rule matching
   */
  currentSelector: string
  /**
   * UnoCSS generator instance
   */
  generator: UnoGenerator<Theme>
  /**
   * Symbols for special handling
   */
  symbols: ControlSymbols
  /**
   * The theme object
   */
  theme: Theme
  /**
   * Matched variants handlers for this rule.
   */
  variantHandlers: VariantHandler[]
  /**
   * The result of variant matching.
   */
  variantMatch: VariantMatchedResult<Theme>
  /**
   * Construct a custom CSS rule.
   * Variants and selector escaping will be handled automatically.
   */
  constructCSS: (body: CSSEntries | CSSObject, overrideSelector?: string) => string
  /**
   * Available only when `details` option is enabled.
   */
  rules?: Rule<Theme>[]
  /**
   * Available only when `details` option is enabled.
   */
  shortcuts?: Shortcut<Theme>[]
  /**
   * Available only when `details` option is enabled.
   */
  variants?: Variant<Theme>[]
}

declare const SymbolShortcutsNoMerge: unique symbol
declare const SymbolVariants: unique symbol
declare const SymbolParent: unique symbol
declare const SymbolSelector: unique symbol

export interface ControlSymbols {
  /**
   * Prevent merging in shortcuts
   */
  shortcutsNoMerge: typeof SymbolShortcutsNoMerge
  /**
   * Additional variants applied to this rule
   */
  variants: typeof SymbolVariants
  /**
   * Parent selector (`@media`, `@supports`, etc.)
   */
  parent: typeof SymbolParent
  /**
   * Selector modifier
   */
  selector: typeof SymbolSelector
}

export interface ControlSymbolsValue {
  [SymbolShortcutsNoMerge]: true
  [SymbolVariants]: VariantHandler[]
  [SymbolParent]: string
  [SymbolSelector]: (selector: string) => string
}

export type ObjectToEntry<T> = { [K in keyof T]: [K, T[K]] }[keyof T]

export type ControlSymbolsEntry = ObjectToEntry<ControlSymbolsValue>

export interface VariantContext<Theme extends object = object> {
  /**
   * Unprocessed selector from user input.
   */
  rawSelector: string
  /**
   * UnoCSS generator instance
   */
  generator: UnoGenerator<Theme>
  /**
   * The theme object
   */
  theme: Theme
}

export interface ExtractorContext {
  readonly original: string
  code: string
  id?: string
  extracted: Set<string> | CountableSet<string>
  envMode?: 'dev' | 'build'
}

export interface PreflightContext<Theme extends object = object> {
  /**
   * UnoCSS generator instance
   */
  generator: UnoGenerator<Theme>
  /**
   * The theme object
   */
  theme: Theme
}

export interface SafeListContext<Theme extends object = object> extends PreflightContext<Theme> { }

export interface Extractor {
  name: string
  order?: number
  /**
   * Extract the code and return a list of selectors.
   *
   * Return `undefined` to skip this extractor.
   */
  extract?: (ctx: ExtractorContext) => Awaitable<Set<string> | CountableSet<string> | string[] | undefined | void>
}

export interface RuleMeta {
  /**
   * The layer name of this rule.
   * @default 'default'
   */
  layer?: string

  /**
   * Option to not merge this selector even if the body are the same.
   * @default false
   */
  noMerge?: boolean

  /**
   * Fine tune sort
   */
  sort?: number

  /**
   * Templates to provide autocomplete suggestions
   */
  autocomplete?: Arrayable<AutoCompleteTemplate>

  /**
   * Matching prefix before this util
   */
  prefix?: string | string[]

  /**
   * Internal rules will only be matched for shortcuts but not the user code.
   * @default false
   */
  internal?: boolean

  /**
   * Store the hash of the rule boy
   *
   * @internal
   * @private
   */
  __hash?: string
}

export type CSSValue = CSSObject | CSSEntries
export type CSSValues = CSSValue | CSSValue[]

export type DynamicMatcher<Theme extends object = object> =
  (
    match: RegExpMatchArray,
    context: Readonly<RuleContext<Theme>>
  ) =>
  | Awaitable<CSSValueInput | string | (CSSValueInput | string)[] | undefined>
  | Generator<CSSValueInput | string | undefined>
  | AsyncGenerator<CSSValueInput | string | undefined>

export type DynamicRule<Theme extends object = object> = [RegExp, DynamicMatcher<Theme>] | [RegExp, DynamicMatcher<Theme>, RuleMeta]
export type StaticRule = [string, CSSObject | CSSEntries] | [string, CSSObject | CSSEntries, RuleMeta]
export type Rule<Theme extends object = object> = DynamicRule<Theme> | StaticRule

export type DynamicShortcutMatcher<Theme extends object = object> = ((match: RegExpMatchArray, context: Readonly<RuleContext<Theme>>) => (string | ShortcutValue[] | undefined))

export type StaticShortcut = [string, string | ShortcutValue[]] | [string, string | ShortcutValue[], RuleMeta]
export type StaticShortcutMap = Record<string, string | ShortcutValue[]>
export type DynamicShortcut<Theme extends object = object> = [RegExp, DynamicShortcutMatcher<Theme>] | [RegExp, DynamicShortcutMatcher<Theme>, RuleMeta]
export type UserShortcuts<Theme extends object = object> = StaticShortcutMap | (StaticShortcut | DynamicShortcut<Theme> | StaticShortcutMap)[]
export type Shortcut<Theme extends object = object> = StaticShortcut | DynamicShortcut<Theme>
export type ShortcutValue = string | CSSValue

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface Preflight<Theme extends object = object> {
  getCSS: (context: PreflightContext<Theme>) => Promise<string | undefined> | string | undefined
  layer?: string
}

export interface BlocklistMeta {
  /**
   * Custom message to show why this selector is blocked.
   */
  message?: string | ((selector: string) => string)
}
export type BlocklistValue = string | RegExp | ((selector: string) => boolean | null | undefined)
export type BlocklistRule = BlocklistValue | [BlocklistValue, BlocklistMeta]

export interface VariantHandlerContext {
  /**
   * Rewrite the output selector. Often be used to append parents.
   */
  prefix: string
  /**
   * Rewrite the output selector. Often be used to append pseudo classes.
   */
  selector: string
  /**
   * Rewrite the output selector. Often be used to append pseudo elements.
   */
  pseudo: string
  /**
   * Rewrite the output css body. The input come in [key,value][] pairs.
   */
  entries: CSSEntries
  /**
   * Provide a parent selector(e.g. media query) to the output css.
   */
  parent?: string
  /**
   * Provide order to the `parent` parent selector within layer.
   */
  parentOrder?: number
  /**
   * Override layer to the output css.
   */
  layer?: string
  /**
   * Order in which the variant is sorted within single rule.
   */
  sort?: number
  /**
   * Option to not merge the resulting entries even if the body are the same.
   * @default false
   */
  noMerge?: boolean
}

export interface VariantHandler {
  /**
   * Callback to process the handler.
   */
  handle?: (input: VariantHandlerContext, next: (input: VariantHandlerContext) => VariantHandlerContext) => VariantHandlerContext
  /**
   * The result rewritten selector for the next round of matching
   */
  matcher?: string
  /**
   * Order in which the variant is applied to selector.
   */
  order?: number
  /**
   * Rewrite the output selector. Often be used to append pseudo classes or parents.
   */
  selector?: (input: string, body: CSSEntries) => string | undefined
  /**
   * Rewrite the output css body. The input come in [key,value][] pairs.
   */
  body?: (body: CSSEntries) => CSSEntries | undefined
  /**
   * Provide a parent selector(e.g. media query) to the output css.
   */
  parent?: string | [string, number] | undefined
  /**
   * Order in which the variant is sorted within single rule.
   */
  sort?: number
  /**
   * Override layer to the output css.
   */
  layer?: string | undefined
}

export type VariantFunction<Theme extends object = object> = (matcher: string, context: Readonly<VariantContext<Theme>>) => Awaitable<string | VariantHandler | undefined>

export interface VariantObject<Theme extends object = object> {
  /**
   * The name of the variant.
   */
  name?: string
  /**
   * The entry function to match and rewrite the selector for further processing.
   */
  match: VariantFunction<Theme>
  /**
   * Sort for when the match is applied.
   */
  order?: number

  /**
   * Allows this variant to be used more than once in matching a single rule
   *
   * @default false
   */
  multiPass?: boolean

  /**
   * Custom function for auto complete
   */
  autocomplete?: Arrayable<AutoCompleteFunction | AutoCompleteTemplate>
}

export type Variant<Theme extends object = object> = VariantFunction<Theme> | VariantObject<Theme>

export type Preprocessor = (matcher: string) => string | undefined
export type Postprocessor = (util: UtilObject) => void
export type ThemeExtender<T> = (theme: T) => T | void

export interface ConfigBase<Theme extends object = object> {
  /**
   * Rules to generate CSS utilities.
   *
   * Later entries have higher priority.
   */
  rules?: Rule<Theme>[]

  /**
   * Variant separator
   *
   * @default [':', '-']
   */
  separators?: Arrayable<string>

  /**
   * Variants that preprocess the selectors,
   * having the ability to rewrite the CSS object.
   */
  variants?: Variant<Theme>[]

  /**
   * Similar to Windi CSS's shortcuts,
   * allows you have create new utilities by combining existing ones.
   *
   * Later entries have higher priority.
   */
  shortcuts?: UserShortcuts<Theme>

  /**
   * Rules to exclude the selectors for your design system (to narrow down the possibilities).
   * Combining `warnExcluded` options it can also help you identify wrong usages.
   */
  blocklist?: BlocklistRule[]

  /**
   * Utilities that always been included
   */
  safelist?: (string | ((context: SafeListContext<Theme>) => Arrayable<string>))[]

  /**
   * Extractors to handle the source file and outputs possible classes/selectors
   * Can be language-aware.
   */
  extractors?: Extractor[]

  /**
   * Default extractor that are always applied.
   * By default it split the source code by whitespace and quotes.
   *
   * It maybe be replaced by preset or user config,
   * only one default extractor can be presented,
   * later one will override the previous one.
   *
   * Pass `null` or `false` to disable the default extractor.
   *
   * @see https://github.com/unocss/unocss/blob/main/packages/core/src/extractors/split.ts
   * @default import('@unocss/core').defaultExtractor
   */
  extractorDefault?: Extractor | null | false

  /**
   * Raw CSS injections.
   */
  preflights?: Preflight<Theme>[]

  /**
   * Theme object for shared configuration between rules
   */
  theme?: Theme

  /**
   * Layer orders. Default to 0.
   */
  layers?: Record<string, number>

  /**
   * Output the internal layers as CSS Cascade Layers.
   */
  outputToCssLayers?: boolean | OutputCssLayersOptions

  /**
   * Custom function to sort layers.
   */
  sortLayers?: (layers: string[]) => string[]

  /**
   * Preprocess the incoming utilities, return falsy value to exclude
   */
  preprocess?: Arrayable<Preprocessor>

  /**
   * Postprocess the generate utils object
   */
  postprocess?: Arrayable<Postprocessor>

  /**
   * Custom functions mutate the theme object.
   *
   * It's also possible to return a new theme object to completely replace the original one.
   */
  extendTheme?: Arrayable<ThemeExtender<Theme>>

  /**
   * Presets
   */
  presets?: (PresetOrFactory<Theme> | PresetOrFactory<Theme>[])[]

  /**
   * Additional options for auto complete
   */
  autocomplete?: {
    /**
     * Custom functions / templates to provide autocomplete suggestions
     */
    templates?: Arrayable<AutoCompleteFunction | AutoCompleteTemplate>
    /**
     * Custom extractors to pickup possible classes and
     * transform class-name style suggestions to the correct format
     */
    extractors?: Arrayable<AutoCompleteExtractor>

    /**
     * Custom shorthands to provide autocomplete suggestions.
     * if values is an array, it will be joined with `|` and wrapped with `()`
     */
    shorthands?: Record<string, string | string[]>
  }

  /**
   * Hook to modify the resolved config.
   *
   * First presets runs first and the user config
   */
  configResolved?: (config: ResolvedConfig) => void

  /**
   * Expose internal details for debugging / inspecting
   *
   * Added `rules`, `shortcuts`, `variants` to the context and expose the context object in `StringifiedUtil`
   *
   * You don't usually need to set this.
   *
   * @default `true` when `envMode` is `dev`, otherwise `false`
   */
  details?: boolean
}

export interface OutputCssLayersOptions {

  /**
   * Specify the css layer that the internal layer should be output to.
   *
   * Return `null` to specify that the layer should not be output to any css layer.
   */
  cssLayerName?: (internalLayer: string) => string | undefined | null
}

export type AutoCompleteTemplate = string
export type AutoCompleteFunction = (input: string) => Awaitable<string[]>

export interface AutoCompleteExtractorContext {
  content: string
  cursor: number
}

export interface Replacement {
  /**
   * The range of the original text
   */
  start: number
  end: number
  /**
   * The text used to replace
   */
  replacement: string
}

export interface SuggestResult {
  /**
   * The generated suggestions
   *
   * `[original, formatted]`
   */
  suggestions: [string, string][]
  /**
   * The function to convert the selected suggestion back.
   * Needs to pass in the original one.
   */
  resolveReplacement: (suggestion: string) => Replacement
}

export interface AutoCompleteExtractorResult {
  /**
   * The extracted string
   */
  extracted: string
  /**
   * The function to convert the selected suggestion back
   */
  resolveReplacement: (suggestion: string) => Replacement
  /**
   * The function to format suggestions
   */
  transformSuggestions?: (suggestions: string[]) => string[]
}

export interface AutoCompleteExtractor {
  name: string
  extract: (context: AutoCompleteExtractorContext) => Awaitable<AutoCompleteExtractorResult | null>
  order?: number
}

export interface Preset<Theme extends object = object> extends ConfigBase<Theme> {
  name: string
  /**
   * Enforce the preset to be applied before or after other presets
   */
  enforce?: 'pre' | 'post'
  /**
   * Preset options for other tools like IDE to consume
   */
  options?: PresetOptions
  /**
   * Apply prefix to all utilities and shortcuts
   */
  prefix?: string | string[]
  /**
   * Apply layer to all utilities and shortcuts
   */
  layer?: string
}

export type PresetFactory<Theme extends object = object, PresetOptions extends object | undefined = undefined> = (options?: PresetOptions) => Preset<Theme>

export type PresetOrFactory<Theme extends object = object> = Preset<Theme> | PresetFactory<Theme, any>

export interface GeneratorOptions {
  /**
   * Merge utilities with the exact same body to save the file size
   *
   * @default true
   */
  mergeSelectors?: boolean

  /**
   * Emit warning when matched selectors are presented in blocklist
   *
   * @default true
   */
  warn?: boolean
}

export interface UserOnlyOptions<Theme extends object = object> {
  /**
   * The theme object, will be merged with the theme provides by presets
   */
  theme?: Theme

  /**
   * Layout name of shortcuts
   *
   * @default 'shortcuts'
   */
  shortcutsLayer?: string

  /**
   * Environment mode
   *
   * @default 'build'
   */
  envMode?: 'dev' | 'build'
  /**
   * legacy.renderModernChunks need to be consistent with @vitejs/plugin-legacy
   */
  legacy?: {
    renderModernChunks: boolean
  }
}

/**
 * For unocss-cli config
 */
export interface CliOptions {
  cli?: {
    entry?: Arrayable<CliEntryItem>
  }
}

export interface UnocssPluginContext<Config extends UserConfig = UserConfig> {
  ready: Promise<LoadConfigResult<Config>>
  uno: UnoGenerator
  /** All tokens scanned */
  tokens: Set<string>
  /** Map for all module's raw content */
  modules: BetterMap<string, string>
  /** Module IDs that been affected by UnoCSS */
  affectedModules: Set<string>

  /** Pending promises */
  tasks: Promise<any>[]
  /**
   * Await all pending tasks
   */
  flushTasks: () => Promise<any>

  filter: (code: string, id: string) => boolean
  extract: (code: string, id?: string) => Promise<void>

  reloadConfig: () => Promise<LoadConfigResult<Config>>
  getConfig: () => Promise<Config>
  onReload: (fn: () => void) => void

  invalidate: () => void
  onInvalidate: (fn: () => void) => void

  root: string
  updateRoot: (root: string) => Promise<LoadConfigResult<Config>>
  getConfigFileList: () => string[]
}

export interface SourceMap {
  file?: string
  mappings?: string
  names?: string[]
  sources?: string[]
  sourcesContent?: string[]
  version?: number
}

export interface HighlightAnnotation {
  offset: number
  length: number
  className: string
}

export type SourceCodeTransformerEnforce = 'pre' | 'post' | 'default'

export interface SourceCodeTransformer {
  name: string
  /**
   * The order of transformer
   */
  enforce?: SourceCodeTransformerEnforce
  /**
   * Custom id filter, if not provided, the extraction filter will be applied
   */
  idFilter?: (id: string) => boolean
  /**
   * The transform function
   */
  transform: (
    code: MagicString,
    id: string,
    ctx: UnocssPluginContext
  ) => Awaitable<{ highlightAnnotations?: HighlightAnnotation[] } | void>
}

export interface ContentOptions {
  /**
   * Glob patterns to extract from the file system, in addition to other content sources.
   *
   * In dev mode, the files will be watched and trigger HMR.
   *
   * @default []
   */
  filesystem?: string[]

  /**
   * Inline text to be extracted
   */
  inline?: (string | { code: string, id?: string } | (() => Awaitable<string | { code: string, id?: string }>))[]

  /**
   * Filters to determine whether to extract certain modules from the build tools' transformation pipeline.
   *
   * Currently only works for Vite and Webpack integration.
   *
   * Set `false` to disable.
   */
  pipeline?: false | {
    /**
     * Patterns that filter the files being extracted.
     * Supports regular expressions and `picomatch` glob patterns.
     *
     * By default, `.ts` and `.js` files are NOT extracted.
     *
     * @see https://www.npmjs.com/package/picomatch
     * @default [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]
     */
    include?: FilterPattern

    /**
     * Patterns that filter the files NOT being extracted.
     * Supports regular expressions and `picomatch` glob patterns.
     *
     * By default, `node_modules` and `dist` are also extracted.
     *
     * @see https://www.npmjs.com/package/picomatch
     * @default [/\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/]
     */
    exclude?: FilterPattern
  }

  /**
   * @deprecated Renamed to `inline`
   */
  plain?: (string | { code: string, id?: string })[]
}

/**
 * For other modules to aggregate the options
 */
export interface PluginOptions {
  /**
   * Load from configs files
   *
   * set `false` to disable
   */
  configFile?: string | false

  /**
   * List of files that will also trigger config reloads
   */
  configDeps?: string[]

  /**
   * Custom transformers to the source code
   */
  transformers?: SourceCodeTransformer[]

  /**
   * Options for sources to be extracted as utilities usages
   *
   * Supported sources:
   * - `filesystem` - extract from file system
   * - `inline` - extract from plain inline text
   * - `pipeline` - extract from build tools' transformation pipeline, such as Vite and Webpack
   *
   * The usage extracted from each source will be **merged** together.
   */
  content?: ContentOptions

  /** ========== DEPRECATED OPTIONS ========== */

  /**
   * @deprecated Renamed to `content`
   */
  extraContent?: ContentOptions

  /**
   * Patterns that filter the files being extracted.
   * @deprecated moved to `content.pipeline.include`
   */
  include?: FilterPattern

  /**
   * Patterns that filter the files NOT being extracted.
   * @deprecated moved to `content.pipeline.exclude`
   */
  exclude?: FilterPattern
}

export interface UserConfig<Theme extends object = object> extends ConfigBase<Theme>, UserOnlyOptions<Theme>, GeneratorOptions, PluginOptions, CliOptions { }
export interface UserConfigDefaults<Theme extends object = object> extends ConfigBase<Theme>, UserOnlyOptions<Theme> { }

export interface ResolvedConfig<Theme extends object = object> extends Omit<
  RequiredByKey<UserConfig<Theme>, 'mergeSelectors' | 'theme' | 'rules' | 'variants' | 'layers' | 'extractors' | 'blocklist' | 'safelist' | 'preflights' | 'sortLayers'>,
  'rules' | 'shortcuts' | 'autocomplete'
> {
  presets: Preset<Theme>[]
  shortcuts: Shortcut<Theme>[]
  variants: VariantObject<Theme>[]
  preprocess: Preprocessor[]
  postprocess: Postprocessor[]
  rulesSize: number
  rulesDynamic: [number, ...DynamicRule<Theme>][]
  rulesStaticMap: Record<string, [number, CSSObject | CSSEntries, RuleMeta | undefined, Rule<Theme>] | undefined>
  autocomplete: {
    templates: (AutoCompleteFunction | AutoCompleteTemplate)[]
    extractors: AutoCompleteExtractor[]
    shorthands: Record<string, string>
  }
  separators: string[]
}

export interface GenerateResult<T = Set<string>> {
  css: string
  layers: string[]
  getLayer: (name?: string) => string | undefined
  getLayers: (includes?: string[], excludes?: string[]) => string
  matched: T
}

export type VariantMatchedResult<Theme extends object = object> = readonly [
  raw: string,
  current: string,
  variantHandlers: VariantHandler[],
  variants: Set<Variant<Theme>>,
]

export type ParsedUtil = readonly [
  index: number,
  raw: string,
  entries: CSSEntries,
  meta: RuleMeta | undefined,
  variantHandlers: VariantHandler[],
]

export type RawUtil = readonly [
  index: number,
  rawCSS: string,
  meta: RuleMeta | undefined,
]

export type StringifiedUtil<Theme extends object = object> = readonly [
  index: number,
  selector: string | undefined,
  body: string,
  parent: string | undefined,
  meta: RuleMeta | undefined,
  context: RuleContext<Theme> | undefined,
  noMerge: boolean | undefined,
]

export type PreparedRule = readonly [
  selector: [string, number][],
  body: string,
  noMerge: boolean,
]

export interface CliEntryItem {
  patterns: string[]
  outFile: string
}

export interface UtilObject {
  selector: string
  entries: CSSEntries
  parent: string | undefined
  layer: string | undefined
  sort: number | undefined
  noMerge: boolean | undefined
}

/**
 * Returned from `uno.generate()` when `extendedInfo` option is enabled.
 */
export interface ExtendedTokenInfo<Theme extends object = object> {
  /**
   * Stringified util data
   */
  data: StringifiedUtil<Theme>[]
  /**
   * Return -1 if the data structure is not countable
   */
  count: number
}

export interface GenerateOptions<T extends boolean> {
  /**
   * Filepath of the file being processed.
   */
  id?: string

  /**
   * Generate preflights (if defined)
   *
   * @default true
   */
  preflights?: boolean

  /**
   * Includes safelist
   */
  safelist?: boolean

  /**
   * Generate minified CSS
   * @default false
   */
  minify?: boolean

  /**
   * @experimental
   */
  scope?: string

  /**
   * If return extended "matched" with payload and count
   */
  extendedInfo?: T
}
