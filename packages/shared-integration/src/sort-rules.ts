import type { UnoGenerator } from '@unocss/core'
import { notNull } from '@unocss/core'

export async function sortRules(rules: string[], uno: UnoGenerator) {
  const unknown: string[] = []

  // enable details for variant handlers
  uno.config.details = true

  const result = await Promise.all(rules
    .map(async (i) => {
      const token = await uno.parseToken(i)
      if (token == null) {
        unknown.push(i)
        return undefined
      }
      const variantRank = (token[0][5]?.variantHandlers?.length || 0) * 1000
      const order = token[0][0] + variantRank
      return [order, i] as const
    }))

  const sorted = result
    .filter(notNull)
    .sort((a, b) => {
      let result = a[0] - b[0]
      if (result === 0)
        result = a[1].localeCompare(b[1])
      return result
    })
    .map(i => i[1])

  return {
    sorted,
    unknown,
  }
}
