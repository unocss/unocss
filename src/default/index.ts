import { NanowindConfig } from '../types'
import { defaultTheme } from './theme'
import { defaultRules } from './rules'
import { defaultVariants } from './variants'

export * from './rules'
export * from './variants'
export * from './theme'

export const defaultConfig: NanowindConfig = {
  rules: defaultRules,
  variants: defaultVariants,
  theme: defaultTheme,
}
