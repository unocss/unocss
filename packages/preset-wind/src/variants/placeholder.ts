import type { VariantFunction } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { handler as h, parseColor } from '@unocss/preset-mini/utils'

export const variantPseudoPlaceholder: VariantFunction = (input: string, { theme }) => {
  const match = input.match(/^placeholder-(.+?)$/)
  if (match) {
    if (hasColorValue(match[1], theme) || hasOpacityValue(match[1])) {
      return {
        matcher: input.replace(/-/, '-$-placeholder-'),
      }
    }
  }
}

function hasColorValue(body: string, theme: Theme) {
  return !!parseColor(body, theme)?.color
}

function hasOpacityValue(body: string) {
  const match = body.match(/^op(?:acity)?-?(.+)$/)
  if (match[1] != null)
    return h.bracket.percent.cssvar(match[1]) != null
  return false
}
