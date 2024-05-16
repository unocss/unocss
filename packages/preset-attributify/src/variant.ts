import type { VariantObject } from '@unocss/core'
import { isAttributifySelector } from '@unocss/core'
import type { AttributifyOptions } from './types'

// eslint-disable-next-line regexp/no-super-linear-backtracking
export const variantsRE = /^(?!.*\[[^:]+:.+\]$)((?:.+:)?!?)(.*)$/

export function variantAttributify(options: AttributifyOptions = {}): VariantObject {
  const prefix = options.prefix ?? 'un-'
  const prefixedOnly = options.prefixedOnly ?? false
  const trueToNonValued = options.trueToNonValued ?? false
  let variantsValueRE: RegExp | false | undefined

  return {
    name: 'attributify',
    match(input, { generator }) {
      const match = isAttributifySelector(input)

      if (!match)
        return

      let name = match[1]
      if (name.startsWith(prefix))
        name = name.slice(prefix.length)
      else if (prefixedOnly)
        return

      const content = match[2]

      const [, variants = '', body = content] = content.match(variantsRE) || []
      if (body === '~' || (trueToNonValued && body === 'true') || !body)
        return `${variants}${name}`

      if (variantsValueRE == null) {
        const separators = generator?.config?.separators?.join('|')
        if (separators)
          variantsValueRE = new RegExp(`^(.*\\](?:${separators}))(\\[[^\\]]+?\\])$`)
        else
          variantsValueRE = false
      }

      if (variantsValueRE) {
        const [, bodyVariant, bracketValue] = content.match(variantsValueRE) || []
        if (bracketValue)
          return `${bodyVariant}${variants}${name}-${bracketValue}`
      }

      return `${variants}${name}-${body}`
    },
  }
}
