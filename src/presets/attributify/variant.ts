import { MiniwindVariant } from '../../types'

const attributifyRE = /^\[([\w-]+)~="(.+)"\]$/
const variantPrefixRE = /^(.*:)?(.*?)$/

export const variantAttributify: MiniwindVariant = {
  match(input) {
    const match = input.match(attributifyRE)
    if (!match)
      return
    const [, prefix, content] = match
    const [, variants = '', body = content] = content.match(variantPrefixRE) || []
    if (body === '~')
      return `${variants}${prefix}`
    else
      return `${variants}${prefix}-${body}`
  },
}
