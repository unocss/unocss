import { MiniwindVariant } from '../../types'

const attributifyRE = /^\[(\w+)~="(.+)"\]$/
const variantPrefixRE = /^(.*:)?(.*?)$/

export const variantAttributify: MiniwindVariant = {
  match(input) {
    const match = input.match(attributifyRE)
    if (!match)
      return
    const [, prefix = '', body = match[2]] = match[2].match(variantPrefixRE) || []
    return `${prefix}${match[1]}-${body}`
  },
}
