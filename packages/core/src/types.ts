/* eslint-disable no-use-before-define */
export type CSSObject = Record<string, string | number | undefined>
export type CSSEntries = [string, string | number | undefined][]

export type Awaitable<T> = T | Promise<T>

export type Extractor = (code: string, id?: string) => Awaitable<Set<string> | undefined>

export type DynamicRule = [RegExp, ((match: string[], theme: Theme) => (CSSObject | CSSEntries | undefined))]
export type StaticRule = [string, CSSObject | CSSEntries]
export type Rule = DynamicRule | StaticRule

export type DynamicShortcut = [RegExp, ((match: string[]) => (string | string [] | undefined))]
export type StaticShortcut = [string, string | string[]]
export type Shortcut = StaticShortcut | DynamicShortcut

export type Variant = {
  match: (input: string, theme: Theme) => string | undefined
  selector?: (input: string, theme: Theme) => string | undefined
  rewrite?: (input: CSSEntries, theme: Theme) => CSSEntries | undefined
  mediaQuery?: (selector: string, theme: Theme) => string | undefined
}

export interface Theme {
  borderRadius: Record<string, string>
  breakpoints: Record<string, string>
  colors: Record<string, string | Record<string, string>>
  fontFamily: Record<string, string>
  fontSize: Record<string, [string, string]>
  lineHeight: Record<string, string>
  letterSpacing: Record<string, string>
}

export interface UserConfig extends Preset {
  theme?: Theme
  presets?: Preset[]
}

export interface UserConfigDefaults extends Preset {
  theme: Theme
  presets: Preset[]
}

export interface ResolvedConfig extends Omit<Required<UserConfig>, 'presets' | 'rules'> {
  rulesSize: number
  rulesDynamic: (DynamicRule|undefined)[]
  rulesStaticMap: Record<string, [number, CSSObject | CSSEntries] | undefined>
}

export interface Preset {
  rules?: Rule[]
  variants?: Variant[]
  shortcuts?: Shortcut[]
  extractors?: Extractor[]
}

export type ApplyVariantResult = [
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
  string /* css */,
  string | undefined /* media query */,
]
