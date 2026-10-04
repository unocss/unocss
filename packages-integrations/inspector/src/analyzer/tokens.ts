import type { BetterMap, ExtendedTokenInfo, UnocssPluginContext } from '@unocss/core'

export type TokenInfo = ExtendedTokenInfo & { modules: string[] }

export async function collectTokens(modules: BetterMap<string, string>, ctx: UnocssPluginContext) {
  const tokens = new Map<string, TokenInfo>()
  const generated = await Promise.all(modules.map(async (code, id) => ({
    id,
    matched: (await ctx.uno.generate(code, { id, extendedInfo: true, preflights: false })).matched,
  })))

  for (const { id, matched } of generated) {
    for (const [rawSelector, value] of matched) {
      const previous = tokens.get(rawSelector)
      tokens.set(rawSelector, {
        data: value.data,
        count: (previous?.count || 0) + value.count,
        modules: [...(previous?.modules || []), id],
      })
    }
  }

  return tokens
}
