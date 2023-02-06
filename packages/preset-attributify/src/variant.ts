import type { VariantObject } from '@unocss/core'
import { isAttributifySelector } from '@unocss/core'
import { handler as h } from '@unocss/preset-mini/utils'
import type { AttributifyOptions } from './types'

export const variantsRE = /^(?!.*\[(?:[^:]+):(?:.+)\]$)((?:.+:)?!?)?(.*)$/

export const variantAttributify = (options: AttributifyOptions = {}): VariantObject => {
  const prefix = options.prefix ?? 'un-'
  const prefixedOnly = options.prefixedOnly ?? false
  const trueToNonValued = options.trueToNonValued ?? false

  return {
    name: 'attributify',
    async match(input, { generator }) {
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

      const maybeValue = (await generator?.matchVariants(content))?.[1]
      if (maybeValue && !body.endsWith(maybeValue))
        return `${variants}${name}-${body}`

      const bracketValue = h.bracket(maybeValue)
      if (bracketValue == null)
        return `${variants}${name}-${body}`

      const maybeTokenValue = await generator?.parseToken(`${name}-${maybeValue}`)
      if (maybeTokenValue == null)
        return `${variants}${name}-${body}`

      const bodyVariant = body.slice(0, body.length - maybeValue.length)
      return `${bodyVariant}${variants}${name}-${maybeValue}`
    },
  }
}
