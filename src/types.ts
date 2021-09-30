export type NanowindCssObject = Record<string, string | undefined>
export type NanowindCssRule = [string, NanowindCssObject]
export type NanowindRule = [RegExp, (match: string[]) => string | NanowindCssRule | undefined]

export interface NanowindConfig {
  rules: NanowindRule[]
}
