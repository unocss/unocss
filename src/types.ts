/* eslint-disable no-use-before-define */

export type NanowindCssObject = Record<string, string | number | undefined>
export type NanowindCssEntries = [string, string | number | undefined][]

export type NanowindRule = [RegExp | string, NanowindCssObject | NanowindCssEntries | ((match: string[], theme: NanowindTheme) => (NanowindCssObject | NanowindCssEntries | undefined))]
export type NanowindVariant = {
  match: (input: string) => string | undefined
  selector?: (input: string) => string | undefined
  rewrite?: (input: NanowindCssEntries) => NanowindCssEntries | undefined
}

export interface NanowindTheme {
  colors: Record<string, string | Record<string, string>>
  breakpoints: Record<string, string>
  fontFamily: {
    sans: string
    mono: string
    serif: string
    [x: string]: string
  }
  fontSize: Record<string, [string, string]>
}

export interface NanowindConfig {
  rules: NanowindRule[]
  variants: NanowindVariant[]
  theme: NanowindTheme
}

export type NanowindUserConfig = Partial<NanowindConfig>
