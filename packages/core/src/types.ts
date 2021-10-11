/* eslint-disable no-use-before-define */
export type Awaitable<T> = T | Promise<T>
export type ArgumentType<T> = T extends ((...args: infer A) => any) ? A : never
export type Shift<T> = T extends [_: any, ...args: infer A] ? A : never
export type RestArgs<T> = Shift<ArgumentType<T>>
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

export type CSSObject = Record<string, string | number | undefined>
export type CSSEntries = [string, string | number | undefined][]

export type Extractor = (code: string, id?: string) => Awaitable<Set<string> | undefined>

export type DynamicRule = [RegExp, ((match: string[], theme: Theme) => Awaitable<CSSObject | CSSEntries | undefined>)]
export type StaticRule = [string, CSSObject | CSSEntries]
export type Rule = DynamicRule | StaticRule

export type DynamicShortcut = [RegExp, ((match: string[]) => (string | string [] | undefined))]
export type StaticShortcut = [string, string | string[]]
export type StaticShortcutMap = Record<string, string | string[]>
export type UserShortcuts = StaticShortcutMap | (StaticShortcut | DynamicShortcut | StaticShortcutMap)[]
export type Shortcut = StaticShortcut | DynamicShortcut

export type ExcludeRule = string | RegExp

export type Variant = {
  match: (input: string, theme: Theme) => string | undefined
  selector?: (input: string, theme: Theme) => string | undefined
  rewrite?: (input: CSSEntries, theme: Theme) => CSSEntries | undefined
  mediaQuery?: (selector: string, theme: Theme) => string | undefined
}

export interface Theme {
  borderRadius?: Record<string, string>
  breakpoints?: Record<string, string>
  colors?: Record<string, string | Record<string, string>>
  fontFamily?: Record<string, string>
  fontSize?: Record<string, [string, string]>
  lineHeight?: Record<string, string>
  letterSpacing?: Record<string, string>
}

export interface ConfigBase {
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

export interface UserConfig extends ConfigBase, GeneratorOptions {
  theme?: Theme
  presets?: Preset[]
}

export interface UserConfigDefaults extends ConfigBase {
  theme?: Theme
  presets?: Preset[]
}

export interface ResolvedConfig extends Omit<Required<UserConfig>, 'presets' | 'rules' | 'shortcuts'> {
  shortcuts: Shortcut[]
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
  Variant[]
]

export type ParsedUtil = readonly [
  number /* index */,
  string /* raw */,
  CSSEntries,
  Variant[]
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
