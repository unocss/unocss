import type { Variant, VariantContext, VariantHandlerContext } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import { toArray } from '@unocss/core'
import { variantMatcher, variantParentMatcher, variantPrefix } from '../utils'

export function variantColorsMediaOrClass(options: PresetMiniOptions = {}): Variant[] {
  if (options?.dark === 'class' || typeof options.dark === 'object') {
    const { dark = '.dark', light = '.light' } = typeof options.dark === 'string'
      ? {}
      : options.dark

    return [
      variantMatcher('dark', toArray(dark).map(dark => (input: VariantHandlerContext, ctx: VariantContext) => ({ prefix: variantPrefix(input, `${dark} $$ `, ctx) }))),
      variantMatcher('light', toArray(light).map(light => (input: VariantHandlerContext, ctx: VariantContext) => ({ prefix: variantPrefix(input, `${light} $$ `, ctx) }))),
    ]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ]
}
