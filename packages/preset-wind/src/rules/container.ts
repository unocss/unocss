import type { CSSObject, Rule, Shortcut, VariantHandlerContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { resolveBreakpoints } from '@unocss/preset-mini/utils'

const queryMatcher = /@media \(min-width: (.+)\)/

export const container: Rule<Theme>[] = [
  [
    /^__container$/,
    (m, context) => {
      const { theme, variantHandlers } = context

      let width = '100%'

      const themePadding = theme.container?.padding
      let padding: string | undefined

      if (typeof themePadding === 'string')
        padding = themePadding
      else
        padding = themePadding?.DEFAULT

      for (const v of variantHandlers) {
        const query = v.handle?.({} as VariantHandlerContext, x => x)?.parent
        if (typeof query === 'string') {
          const match = query.match(queryMatcher)?.[1]
          if (match) {
            width = match

            const bp = resolveBreakpoints(context) ?? {}
            const matchBp = Object.keys(bp).find(key => bp[key] === match)

            if (matchBp && typeof themePadding !== 'string')
              padding = themePadding?.[matchBp] ?? padding
          }
        }
      }

      const css: CSSObject = {
        'max-width': width,
      }

      if (theme.container?.center) {
        css['margin-left'] = 'auto'
        css['margin-right'] = 'auto'
      }

      if (themePadding) {
        css['padding-left'] = padding
        css['padding-right'] = padding
      }

      return css
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
