import type { Rule, Shortcut, VariantHandlerContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { resolveBreakpoints } from '@unocss/preset-mini/utils'

const queryMatcher = /@media \(min-width: (.+)\)/

export const container: Rule<Theme>[] = [
  [
    /^__container$/,
    (m, { theme, variantHandlers }) => {
      let width = '100%'
      for (const v of variantHandlers) {
        const query = v.handle?.({} as VariantHandlerContext, x => x)?.parent
        if (typeof query === 'string') {
          const match = query.match(queryMatcher)?.[1]
          if (match)
            width = match
        }
      }
      if (theme.container?.center) {
        return {
          'max-width': width,
          'margin-left': 'auto',
          'margin-right': 'auto',
        }
      }
      return { 'max-width': width }
    },
    { internal: true },
  ],
]

export const containerShortcuts: Shortcut<Theme>[] = [
  [/^(?:(\w+)[:-])?container$/, ([, bp], context) => {
    let points = Object.keys(resolveBreakpoints(context) ?? {})
    if (bp) {
      if (!points.includes(bp))
        return
      points = points.slice(points.indexOf(bp))
    }
    const shortcuts = points.map(p => `${p}:__container`)
    if (!bp)
      shortcuts.unshift('__container')
    return shortcuts
  }],
]
