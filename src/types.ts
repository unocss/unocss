export type MiniwindCssObject = Record<string, string | undefined>
export type MiniwindCssRule = [string, MiniwindCssObject]
export type MiniwindRule = [RegExp, (match: string[]) => string | MiniwindCssRule | undefined]

export interface MiniwindConfig {
  rules: MiniwindRule[]
}
