export type NanowindCssObject = Record<string, string | undefined>
export type NanowindCssEntries = [string, string | undefined][]

export type NanowindRule = [RegExp, (match: string[]) => (NanowindCssObject | NanowindCssEntries | undefined)]
export type NanowindVariant = {
  match: (input: string) => string | undefined
  selector?: (input: string) => string | undefined
  rewrite?: (input: NanowindCssEntries) => NanowindCssEntries | undefined
}

export interface NanowindConfig {
  rules: NanowindRule[]
  variants: NanowindVariant[]
}
