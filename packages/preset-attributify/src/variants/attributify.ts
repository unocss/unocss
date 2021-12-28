import type { VariantFunction } from '@unocss/core'
import { isAttributifySelector } from '@unocss/core'

const variantsRE = /^(.+\:\!?)?(.*?)$/

export const variantAttributify: VariantFunction = (input, { options: { prefix, prefixedOnly } }) => {
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
  if (body === '~' || !body)
    return `${variants}${name}`
  else
    return `${variants}${name}-${body}`
}
