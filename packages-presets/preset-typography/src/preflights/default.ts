import type { PreflightContext } from '@unocss/core'

export function DEFAULT(ctx: PreflightContext) {
  const { theme, generator } = ctx
  const hasWind4 = generator.config.presets.some(p => p.name === '@unocss/preset-wind4')
  const fontKey = hasWind4 ? 'font' : 'fontFamily'

  return 
}

const modifiers = [
  ['headings', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'],
  ['h1'],
  ['h2'],
  ['h3'],
  ['h4'],
  ['h5'],
  ['h6'],
  ['p'],
  ['a'],
  ['blockquote'],
  ['figure'],
  ['figcaption'],
  ['strong'],
  ['em'],
  ['kbd'],
  ['code'],
  ['pre'],
  ['ol'],
  ['ul'],
  ['li'],
  ['table'],
  ['thead'],
  ['tr'],
  ['th'],
  ['td'],
  ['img'],
  ['video'],
  ['hr'],
]

export function getElements(modifier: string) {
  for (const [name, ...selectors] of modifiers) {
    if (name === modifier)
      return selectors.length > 0 ? selectors : [name]
  }
}
