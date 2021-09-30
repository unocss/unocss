export type NanowindCssObject = Record<string, string | undefined>
export type NanowindRule = [RegExp, (match: string[]) => (NanowindCssObject | undefined)]
export type NanowindVariant = {
  match: (input: string) => string | undefined
  selector?: (input: string) => string | undefined
  rewrite?: (input: NanowindCssObject) => NanowindCssObject | undefined
}

export interface NanowindConfig {
  rules: NanowindRule[]
  variants: NanowindVariant[]
}
