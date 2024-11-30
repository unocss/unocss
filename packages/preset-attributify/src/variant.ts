import type { VariantObject } from '@unocss/core'
import type { AttributifyOptions } from './types'
import { isAttributifySelector } from '@unocss/core'

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

      // Expend attributify self-referencing `~`
      if (body === '~' || (trueToNonValued && body === 'true') || !body) {
        return `${variants}${name}`
      }

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

      // For special case like `<div border="red:10">` and `<div border="hover:10">`
      // It's ambiguous to resolve to `border-red:10`/`border-hover:10` or `red:border-10`/`hover:border-10`
      // So we branch out for both possibilities to be processed
      if (variants && body.match(/^[\d.]+$/)) {
        const variantParts = variants.split(/([^:]*:)/g).filter(Boolean)
        const _body = variantParts.pop() + body
        const _variants = variantParts.join('')
        return [
          { matcher: `${variants}${name}-${body}` },
          { matcher: `${_variants}${name}-${_body}` },
        ]
      }

      return `${variants}${name}-${body}`
    },
  }
}
