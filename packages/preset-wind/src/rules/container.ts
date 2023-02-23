import type { CSSObject, Rule, Shortcut, VariantHandlerContext } from '@unocss/core'
import { isString } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { resolveBreakpoints } from '@unocss/preset-mini/utils'

const queryMatcher = /@media \(min-width: (.+)\)/

export const container: Rule<Theme>[] = [
  [
    /^__container$/,
    (m, context) => {
      const { theme, variantHandlers } = context

      const themePadding = theme.container?.padding
      let padding: string | undefined

      if (isString(themePadding))
        padding = themePadding
      else
        padding = themePadding?.DEFAULT

      const themeMaxWidth = theme.container?.maxWidth
      let maxWidth: string | undefined

      for (const v of variantHandlers) {
        const query = v.handle?.({} as VariantHandlerContext, x => x)?.parent
        if (isString(query)) {
          const match = query.match(queryMatcher)?.[1]
          if (match) {
            const bp = resolveBreakpoints(context) ?? {}
            const matchBp = Object.keys(bp).find(key => bp[key] === match)

            if (!themeMaxWidth)
              maxWidth = match
            else if (matchBp)
              maxWidth = themeMaxWidth?.[matchBp]

            if (matchBp && !isString(themePadding))
              padding = themePadding?.[matchBp] ?? padding
          }
        }
      }

      const css: CSSObject = {
        'max-width': maxWidth,
      }

      // only apply width: 100% when no variant handler is present
      if (!variantHandlers.length)
        css.width = '100%'

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
