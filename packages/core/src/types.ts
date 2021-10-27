/* eslint-disable no-use-before-define */
export type Awaitable<T> = T | Promise<T>
export type ArgumentType<T> = T extends ((...args: infer A) => any) ? A : never
export type Shift<T> = T extends [_: any, ...args: infer A] ? A : never
export type RestArgs<T> = Shift<ArgumentType<T>>
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

export type CSSObject = Record<string, string | number | undefined>
export type CSSEntries = [string, string | number | undefined][]

export type Extractor = (code: string, id?: string) => Awaitable<Set<string> | undefined>

export type DynamicRule<Theme extends {} = {}> = [RegExp, ((match: string[], theme: Theme) => Awaitable<CSSObject | CSSEntries | undefined>)]
export type StaticRule = [string, CSSObject | CSSEntries]
export type Rule<Theme extends {} = {}> = DynamicRule<Theme> | StaticRule

export type DynamicShortcut = [RegExp, ((match: string[]) => (string | string [] | undefined))]
export type StaticShortcut = [string, string | string[]]
export type StaticShortcutMap = Record<string, string | string[]>
export type UserShortcuts = StaticShortcutMap | (StaticShortcut | DynamicShortcut | StaticShortcutMap)[]
export type Shortcut = StaticShortcut | DynamicShortcut

export type ExcludeRule = string | RegExp

export interface VariantHandler {
  /**
   * The result rewritten selector for the next round of matching
   */
  matcher: string
  /**
   * Rewrite the output selector. Often be used to append pesudo classes or parents.
   */
  selector?: (input: string) => string | undefined
  /**
   * Rewrite the output css body. The input come in [key,value][] pairs.
   */
  body?: (body: CSSEntries) => CSSEntries | undefined
  /**
   * Provide media query to the output css.
   */
  mediaQuery?: string | undefined
}

export type VariantFunction<Theme extends {} = {}> = (matcher: string, raw: string, theme: Theme) => string | VariantHandler | undefined

export type VariantObject<Theme extends {} = {}> = {
  /**
   * The entry function to match and rewrite the selector for futher processing.
   */
  match: VariantFunction<Theme>

  /**
   * Allows this variant to be used more than once in matching a single rule
   *
   * @default false
   */
  multiPass?: boolean
}

export type Variant<Theme extends {} = {}> = VariantFunction<Theme> | VariantObject<Theme>

export interface ConfigBase<Theme extends {} = {}> {
  /**
   * Rules to generate CSS utilities
   */
  rules?: Rule[]

  /**
   * Variants that preprocess the selectors,
   * having the ability to rewrite the CSS object.
   */
  variants?: Variant[]

  /**
   * Similar to Windi CSS's shortcuts,
   * allows you have create new utilities by combining existing ones.
   */
  shortcuts?: UserShortcuts

  /**
   * Rules to exclude the selectors for your design system (to narrow down the possibilities).
   * Combining `warnExcluded` options it can also helps you identify wrong usages.
   */
  excluded?: ExcludeRule[]

  /**
   * Extractors to handle the source file and outputs possible classes/selectors
   * Can be language-aware.
   */
  extractors?: Extractor[]

  /**
   * Theme object for shared configuration between rules
   */
  theme?: Theme
}

export interface Preset extends ConfigBase {
  enforce?: 'pre' | 'post'
}

export interface GeneratorOptions {
  /**
   * Merge utilities with the exact same body to save the file size
   *
   * @default true
   */
  mergeSelectors?: boolean

  /**
   * Emit warning when excluded selectors are found
   *
   * @default true
   */
  warnExcluded?: boolean
}

export interface UserConfig<Theme extends {} = {}> extends ConfigBase<Theme>, GeneratorOptions {
  theme?: Theme
  presets?: Preset[]
}

export interface UserConfigDefaults<Theme extends {} = {}> extends ConfigBase<Theme> {
  theme?: Theme
  presets?: Preset[]
}

export interface ResolvedConfig extends Omit<Required<UserConfig>, 'presets' | 'rules' | 'shortcuts'> {
  shortcuts: Shortcut[]
  variants: VariantObject[]
  rulesSize: number
  rulesDynamic: (DynamicRule|undefined)[]
  rulesStaticMap: Record<string, [number, CSSObject | CSSEntries] | undefined>
}

export interface GenerateResult {
  css: string
  matched: Set<string>
}

export type VariantMatchedResult = readonly [
  string /* raw */,
  string /* processed */,
  VariantHandler[]
]

export type ParsedUtil = readonly [
  number /* index */,
  string /* raw */,
  CSSEntries,
  VariantHandler[]
]

export type StringifiedUtil = readonly [
  number /* index */,
  string /* selector */,
  string /* body */,
  string | undefined /* media query */,
]

export function defineConfig(config: UserConfig) {
  return config
}
