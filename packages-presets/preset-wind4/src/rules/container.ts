import type { CSSObject, Rule, Shortcut, VariantHandlerContext } from '@unocss/core'
import type { Theme } from '../theme'
import { isString } from '@unocss/core'
import { resolveBreakpoints } from '../utils'

export const containerParent: Rule<Theme>[] = [
  [/^@container(?:\/(\w+))?(?:-(normal))?$/, ([, l, v]) => {
    return {
      'container-type': v ?? 'inline-size',
      'container-name': l,
    }
  }],
]

const queryMatcher = /@media \(min-width: (.+)\)/

export const container: Rule<Theme>[] = [
  [
    /^__container$/,
    (_, context) => {
      const { theme, variantHandlers } = context

      const themePadding = theme.containers?.padding
      let padding: string | undefined

      if (isString(themePadding))
        padding = themePadding
      else
        padding = themePadding?.DEFAULT

      const themeMaxWidth = theme.containers?.maxWidth
      let maxWidth: string | undefined

      for (const v of variantHandlers) {
        const query = v.handle?.({} as VariantHandlerContext, x => x)?.parent
        if (isString(query)) {
          const match = query.match(queryMatcher)?.[1]
          if (match) {
            const bp = resolveBreakpoints(context) ?? []
            const matchBp = bp.find(i => i.size === match)?.point

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

      if (theme.containers?.center) {
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
    let points = (resolveBreakpoints(context) ?? []).map(i => i.point)
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
