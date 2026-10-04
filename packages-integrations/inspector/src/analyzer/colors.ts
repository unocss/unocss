import type { MatchedColor, MatchedSelector } from '../../types'
import { parseColor } from '../../../../packages-presets/preset-mini/src/utils'

const ignoredColors = new Set([
  'transparent',
  'current',
  'currentColor',
  'inherit',
  'initial',
  'unset',
  'none',
])

export function addColor(selector: MatchedSelector, theme: Parameters<typeof parseColor>[1], colors: Map<string, MatchedColor>) {
  if (!selector.baseSelector || selector.category === 'icons')
    return

  const parsed = parseColor(selector.body, theme, 'colors')
  if (!parsed?.color || ignoredColors.has(parsed.color))
    return

  const key = JSON.stringify([parsed.name, parsed.no])
  const existing = colors.get(key)
  if (existing) {
    existing.count += selector.count
    existing.modules = [...new Set([...existing.modules, ...selector.modules])]
  }
  else {
    colors.set(key, {
      name: parsed.name,
      no: parsed.no,
      color: parsed.color,
      count: selector.count,
      modules: selector.modules,
      rawSelector: selector.rawSelector,
      category: selector.category,
      variants: selector.variants,
      body: selector.body,
    })
  }
}
