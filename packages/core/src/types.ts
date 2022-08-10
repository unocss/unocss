import type { LoadConfigResult } from 'unconfig'
import type MagicString from 'magic-string'
import type { UnoGenerator } from './generator'
import type { BetterMap } from './utils'

export type Awaitable<T> = T | Promise<T>
export type Arrayable<T> = T | T[]
export type ArgumentType<T> = T extends ((...args: infer A) => any) ? A : never
export type Shift<T> = T extends [_: any, ...args: infer A] ? A : never
export type RestArgs<T> = Shift<ArgumentType<T>>
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
export type FlatObjectTuple<T> = { [K in keyof T]: T[K] }
export type PartialByKeys<T, K extends keyof T = keyof T> = FlatObjectTuple<Partial<Pick<T, Extract<keyof T, K>>> & Omit<T, K>>
export type RequiredByKey<T, K extends keyof T = keyof T> = FlatObjectTuple<Required<Pick<T, Extract<keyof T, K>>> & Omit<T, K>>

export type CSSObject = Record<string, string | number | undefined>
export type CSSEntries = [string, string | number | undefined][]
export interface CSSColorValue {
  type: string
  components: (string | number)[]
  alpha: string | number | undefined
}

export type RGBAColorValue = [number, number, number, number] | [number, number, number]
export interface ParsedColorValue {
  /**
   * Parsed color value.
   */
  color?: string
  /**
   * Parsed opacity value.
   */
  opacity: string
  /**
   * Color name.
   */
  name: string
  /**
   * Color scale, preferrably 000 - 999.
   */
  no: string
  /**
   * {@link CSSColorValue}
   */
  cssColor: CSSColorValue | undefined
  /**
   * Parsed alpha value from opacity
   */
  alpha: string | number | undefined
}

export type PresetOptions = Record<string, any>

export interface RuleContext<T> {
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
  generator: UnoGenerator<T>
  /**
   * The theme object
   */
  theme: T
  /**
   * Matched variants handlers for this rule.
   */
  variantHandlers: VariantHandler[]
  /**
   * The result of variant matching.
   */
  variantMatch: VariantMatchedResult<T>
  /**
   * Constrcut a custom CSS rule.
   * Variants and selector escaping will be handled automatically.
   */
  constructCSS: (body: CSSEntries | CSSObject, overrideSelector?: string) => string
  /**
   * Available only when `details` option is enabled.
   */
  rules?: Rule<T>[]
  /**
   * Available only when `details` option is enabled.
   */
  shortcuts?: Shortcut<T>[]
  /**
   * Available only when `details` option is enabled.
   */
  variants?: Variant<T>[]
}

export interface VariantContext<T> {
  /**
   * Unprocessed selector from user input.
   */
  rawSelector: string
  /**
   * UnoCSS generator instance
   */
  generator: UnoGenerator<T>
  /**
   * The theme object
   */
  theme: T
}

export interface ExtractorContext {
  readonly original: string
  code: string
  id?: string
}

export interface PreflightContext<T> {
  /**
   * UnoCSS generator instance
   */
  generator: UnoGenerator<T>
  /**
   * The theme object
   */
  theme: T
}

export interface Extractor {
  name: string
  extract(ctx: ExtractorContext): Awaitable<Set<string> | undefined>
  order?: number
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
  prefix?: string

  /**
   * Internal rules will only be matched for shortcuts but not the user code.
   * @default false
   */
  internal?: boolean
}

export type CSSValue = CSSObject | CSSEntries
export type CSSValues = CSSValue | CSSValue[]

export type DynamicMatcher<T> = ((match: RegExpMatchArray, context: Readonly<RuleContext<T>>) => Awaitable<CSSValue | string | (CSSValue | string)[] | undefined>)
export type DynamicRule<T> = [RegExp, DynamicMatcher<T>] | [RegExp, DynamicMatcher<T>, RuleMeta]
export type StaticRule = [string, CSSObject | CSSEntries] | [string, CSSObject | CSSEntries, RuleMeta]
export type Rule<T> = DynamicRule<T> | StaticRule

export type DynamicShortcutMatcher<T> = ((match: RegExpMatchArray, context: Readonly<RuleContext<T>>) => (string | ShortcutValue[] | undefined))

export type StaticShortcut = [string, string | ShortcutValue[]] | [string, string | ShortcutValue[], RuleMeta]
export type StaticShortcutMap = Record<string, string | ShortcutValue[]>
export type DynamicShortcut<T> = [RegExp, DynamicShortcutMatcher<T>] | [RegExp, DynamicShortcutMatcher<T>, RuleMeta]
export type UserShortcuts<T> = StaticShortcutMap | (StaticShortcut | DynamicShortcut<T> | StaticShortcutMap)[]
export type Shortcut<T> = StaticShortcut | DynamicShortcut<T>
export type ShortcutValue = string | CSSValue

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface Preflight<T> {
  getCSS: (context: PreflightContext<T>) => Promise<string | undefined> | string | undefined
  layer?: string
}

export type BlocklistRule = string | RegExp

export interface VariantHandlerContext {
  /**
   * Rewrite the output selector. Often be used to append parents.
   */
  prefix: string
  /**
   * Rewrite the output selector. Often be used to append pesudo classes.
   */
  selector: string
  /**
   * Rewrite the output selector. Often be used to append pesudo elements.
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
}

export interface VariantHandler {
  /**
   * Callback to process the handler.
   */
  handle?: (input: VariantHandlerContext, next: (input: VariantHandlerContext) => VariantHandlerContext) => VariantHandlerContext
  /**
   * The result rewritten selector for the next round of matching
   */
  matcher: string
  /**
   * Order in which the variant is applied to selector.
   */
  order?: number
  /**
   * Rewrite the output selector. Often be used to append pesudo classes or parents.
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

export type VariantFunction<T> = (matcher: string, context: Readonly<VariantContext<T>>) => string | VariantHandler | undefined

export interface VariantObject<T> {
  /**
   * The name of the variant.
   */
  name?: string
  /**
   * The entry function to match and rewrite the selector for futher processing.
   */
  match: VariantFunction<T>

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

export type Variant<T> = VariantFunction<T> | VariantObject<T>

export type Preprocessor = (matcher: string) => string | undefined
export type Postprocessor = (util: UtilObject) => void
export type ThemeExtender<T> = (theme: T) => void

export interface ConfigBase<T> {
  /**
   * Rules to generate CSS utilities
   */
  rules?: Rule<T>[]

  /**
   * Variants that preprocess the selectors,
   * having the ability to rewrite the CSS object.
   */
  variants?: Variant<T>[]

  /**
   * Similar to Windi CSS's shortcuts,
   * allows you have create new utilities by combining existing ones.
   */
  shortcuts?: UserShortcuts<T>

  /**
   * Rules to exclude the selectors for your design system (to narrow down the possibilities).
   * Combining `warnExcluded` options it can also helps you identify wrong usages.
   */
  blocklist?: BlocklistRule[]

  /**
   * Utilities that always been included
   */
  safelist?: string[]

  /**
   * Extractors to handle the source file and outputs possible classes/selectors
   * Can be language-aware.
   */
  extractors?: Extractor[]

  /**
   * Raw CSS injections.
   */
  preflights?: Preflight<T>[]

  /**
   * Theme object for shared configuration between rules
   */
  theme?: T

  /**
   * Layer orders. Default to 0.
   */
  layers?: Record<string, number>

  /**
   * Custom function to sort layers.
   */
  sortLayers?: (layers: string[]) => string[]

  /**
   * Preprocess the incoming utilities, return falsy value to exclude
   */
  preprocess?: Arrayable<Preprocessor>

  /**
   * Process the generate utils object
   */
  postprocess?: Arrayable<Postprocessor>

  /**
   * Custom functions to extend the theme object
   */
  extendTheme?: Arrayable<ThemeExtender<T>>

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
  }

  /**
   * Expose internal details for debugging / inspecting
   *
   * Added `rules`, `shortcuts`, `variants` to the context and expose the context object in `StringifiedUtil`
   *
   * You don't usually need to set this.
   *
   * @default false
   */
  details?: boolean
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

export interface Preset<T> extends ConfigBase<T> {
  name: string
  enforce?: 'pre' | 'post'
  /**
   * Preset options for other tools like IDE to consume
   */
  options?: PresetOptions
  /**
   * Apply prefix to all utilities and shortcuts
   */
  prefix?: string
  /**
   * Apply layer to all utilities and shortcuts
   */
  layer?: string
}

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

export interface UserOnlyOptions<T> {
  /**
   * The theme object, will be merged with the theme provides by presets
   */
  theme?: T

  /**
   * Layout name of shortcuts
   *
   * @default 'shortcuts'
   */
  shortcutsLayer?: string

  /**
   * Presets
   */
  presets?: (Preset<T> | Preset<T>[])[]

  /**
   * Environment mode
   *
   * @default 'build'
   */
  envMode?: 'dev' | 'build'
}

export interface UnocssPluginContext<T, Config extends UserConfig<T> = UserConfig<T>> {
  ready: Promise<LoadConfigResult<Config>>
  uno: UnoGenerator<T>
  /** All tokens scanned */
  tokens: Set<string>
  /** Map for all module's raw content */
  modules: BetterMap<string, string>
  /** Module IDs that been affected by UnoCSS */
  affectedModules: Set<string>

  filter: (code: string, id: string) => boolean
  extract: (code: string, id?: string) => Promise<void>

  reloadConfig: () => Promise<LoadConfigResult<Config>>
  getConfig: () => Promise<Config>
  onReload: (fn: () => void) => void

  invalidate: () => void
  onInvalidate: (fn: () => void) => void

  root: string
  updateRoot: (root: string) => Promise<LoadConfigResult<Config>>
}

export interface SourceMap {
  file?: string
  mappings?: string
  names?: string[]
  sources?: string[]
  sourcesContent?: string[]
  version?: number
}

export interface TransformResult {
  code: string
  map?: SourceMap | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}

export type SourceCodeTransformerEnforce = 'pre' | 'post' | 'default'

export interface SourceCodeTransformer<T> {
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
  transform: (code: MagicString, id: string, ctx: UnocssPluginContext<T>) => Awaitable<void>
}

/**
 * For other modules to aggregate the options
 */
export interface PluginOptions<T> {
  /**
   * Load from configs files
   *
   * set `false` to disable
   */
  configFile?: string | false

  /**
   * List of files that will also triggers config reloads
   */
  configDeps?: string[]

  /**
   * Patterns that filter the files being extracted.
   */
  include?: FilterPattern

  /**
   * Patterns that filter the files NOT being extracted.
   */
  exclude?: FilterPattern

  /**
   * Custom transformers to the source code
   */
  transformers?: SourceCodeTransformer<T>[]
}

export interface UserConfig<T> extends ConfigBase<T>, UserOnlyOptions<T>, GeneratorOptions, PluginOptions<T> {}
export interface UserConfigDefaults<T> extends ConfigBase<T>, UserOnlyOptions<T> {}

export interface ResolvedConfig<T> extends Omit<
RequiredByKey<UserConfig<T>, 'mergeSelectors' | 'theme' | 'rules' | 'variants' | 'layers' | 'extractors' | 'blocklist' | 'safelist' | 'preflights' | 'sortLayers'>,
'rules' | 'shortcuts' | 'autocomplete'
> {
  presets: Preset<T>[]
  shortcuts: Shortcut<T>[]
  variants: VariantObject<T>[]
  preprocess: Preprocessor[]
  postprocess: Postprocessor[]
  rulesSize: number
  rulesDynamic: (DynamicRule<T> | undefined)[]
  rulesStaticMap: Record<string, [number, CSSObject | CSSEntries, RuleMeta | undefined, Rule<T>] | undefined>
  autocomplete: {
    templates: (AutoCompleteFunction | AutoCompleteTemplate)[]
    extractors: AutoCompleteExtractor[]
  }
}

export interface GenerateResult {
  css: string
  layers: string[]
  getLayer(name?: string): string | undefined
  getLayers(includes?: string[], excludes?: string[]): string
  matched: Set<string>
}

export type VariantMatchedResult<T> = readonly [
  raw: string,
  current: string,
  variantHandlers: VariantHandler[],
  variants: Set<Variant<T>>,
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

export type StringifiedUtil<T> = readonly [
  index: number,
  selector: string | undefined,
  body: string,
  parent: string | undefined,
  meta: RuleMeta | undefined,
  context: RuleContext<T> | undefined,
]

export type PreparedRule = readonly [
  selector: [string, number][],
  body: string,
  noMerge: boolean,
]

export interface UtilObject {
  selector: string
  entries: CSSEntries
  parent: string | undefined
  layer: string | undefined
  sort: number | undefined
}

export interface GenerateOptions {
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
   * Genreate minified CSS
   * @default false
   */
  minify?: boolean

  /**
   * @expiremental
   */
  scope?: string
}
