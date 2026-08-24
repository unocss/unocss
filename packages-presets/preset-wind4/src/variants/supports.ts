import type { VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { variantGetParameter } from '@unocss/rule-utils'
import { h } from '../utils'

export const variantSupports: VariantObject<Theme> = {
  name: 'supports',
  match(matcher, ctx) {
    const variant = variantGetParameter('supports-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant

      let supports = h.bracket(match, ctx.theme) ?? ''
      if (supports === '')
        supports = ctx.theme.supports?.[match] ?? ''

      if (supports) {
        if (/^[\w-]+$/.test(supports))
          supports = `(${supports}: var(--un))`

        supports = supports
          .replace(/\b(and|or|not)\b/gi, ' $1 ')
          .replace(/\s+/g, ' ')
          .trim()

        if (!(supports.startsWith('(') && supports.endsWith(')')) && !/^not\b/i.test(supports)) {
          supports = `(${supports})`
        }

        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports ${supports}`,
          }),
        }
      }
    }
  },
  multiPass: true,
}
