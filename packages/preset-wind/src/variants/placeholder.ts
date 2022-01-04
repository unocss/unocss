import type { VariantFunction } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { handler as h, parseColor } from '@unocss/preset-mini/utils'

export const placeholderModifier: VariantFunction = (input: string, { theme }) => {
  const m = input.match(/^(.*)\b(placeholder-)(.+?)$/)
  if (m) {
    const [, pre = '', p, body] = m
    if (hasColorValue(body, theme) || hasOpacityValue(body)) {
      return {
        matcher: `${pre}${p}$-placeholder-${body}`,
      }
    }
  }
}

function hasColorValue(body: string, theme: Theme) {
  return !!parseColor(body, theme)?.color
}

function hasOpacityValue(body: string) {
  const match = body.match(/^op(?:acity)?-?(.+)$/)
  if (match && match[1] != null)
    return h.bracket.percent.cssvar(match[1]) != null
  return false
}
