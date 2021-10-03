/* eslint-disable no-use-before-define */
export type MiniwindCssObject = Record<string, string | number | undefined>
export type MiniwindCssEntries = [string, string | number | undefined][]

export type MiniwindExtractor = (code: string, id?: string) => Set<string> | Promise<Set<string>>

export type MiniwindDynamicRule = [RegExp, ((match: string[], theme: MiniwindTheme) => (MiniwindCssObject | MiniwindCssEntries | undefined))]
export type MiniwindStaticRule = [string, MiniwindCssObject | MiniwindCssEntries]
export type MiniwindRule = MiniwindDynamicRule | MiniwindStaticRule

export type MiniwindVariant = {
  match: (input: string, theme: MiniwindTheme) => string | undefined
  selector?: (input: string, theme: MiniwindTheme) => string | undefined
  rewrite?: (input: MiniwindCssEntries, theme: MiniwindTheme) => MiniwindCssEntries | undefined
  mediaQuery?: (selector: string, theme: MiniwindTheme) => string | undefined
}

export interface MiniwindTheme {
  borderRadius: Record<string, string>
  breakpoints: Record<string, string>
  colors: Record<string, string | Record<string, string>>
  fontFamily: Record<string, string>
  fontSize: Record<string, [string, string]>
  lineHeight: Record<string, string>
  letterSpacing: Record<string, string>
}

export interface MiniwindUserConfig extends MiniwindPreset {
  theme?: MiniwindTheme
  presets?: MiniwindPreset[]
}

export interface MiniwindConfig extends Omit<Required<MiniwindUserConfig>, 'presets' | 'rules'> {
  rulesSize: number
  rulesDynamic: (MiniwindDynamicRule|undefined)[]
  rulesStaticMap: Record<string, [number, MiniwindCssObject | MiniwindCssEntries] | undefined>
}

export interface MiniwindPreset {
  rules?: MiniwindRule[]
  variants?: MiniwindVariant[]
  extractors?: MiniwindExtractor[]
}
