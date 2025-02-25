import type { CSSColorValue } from '@unocss/rule-utils'
import { alphaPlaceholders, alphaPlaceholdersRE, cssColorFunctions } from '@unocss/rule-utils'

export function colorOpacityToString(color: CSSColorValue) {
  const alpha = color.alpha ?? 1
  return (typeof alpha === 'string' && alphaPlaceholders.includes(alpha))
    ? 1
    : alpha
}

export function colorToString(color: CSSColorValue | string, alphaOverride?: string | number) {
  if (typeof color === 'string')
    return color.replace(alphaPlaceholdersRE, `${alphaOverride ?? 1}`)

  const { components } = color
  let { alpha, type } = color
  alpha = alphaOverride ?? alpha
  type = type.toLowerCase()

  if (['hsla', 'rgba'].includes(type))
    return `${type}(${components.join(', ')}${alpha == null ? '' : `, ${alpha}`})`

  alpha = alpha == null ? '' : ` / ${alpha}`
  if (cssColorFunctions.includes(type))
    return `${type}(${components.join(' ')}${alpha})`
  return `color(${type} ${components.join(' ')}${alpha})`
}
