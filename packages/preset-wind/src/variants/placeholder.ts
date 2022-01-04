import type { VariantFunction } from '@unocss/core'
import { handler as h, parseColor } from '@unocss/preset-mini/utils'

export const variantPseudoPlaceholder: VariantFunction = (input: string, { theme }) => {
  const match = input.match(/^placeholder-(.+?)$/)
  if (match) {
    if (!!parseColor(match[1], theme)?.color || (match[1].match(/^op(?:acity)?-?(.+)$/) && h.bracket.percent.cssvar(match[1]) != null)) {
      return {
        matcher: input.replace(/-/, '-$-placeholder-'),
      }
    }
  }
}
