import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/rule-utils'

export const variantInert: Variant = variantMatcher('inert', input => ({
  parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
  selector: '&:is([inert],[inert] *)',
}))
