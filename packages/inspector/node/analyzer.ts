import type { BetterMap, TokenInfo, UnocssPluginContext } from '@unocss/core'
import { parseColor } from '../../preset-mini/src/utils'
import type { MatchedColor, MatchedSelector } from '../types'
import { getSelectorCategory } from './utils'

export async function analyzer(modules: BetterMap<string, string>, ctx: UnocssPluginContext) {
  const matched: MatchedSelector[] = []
  const colors: MatchedColor[] = []
  const tokensInfo = new Map<string, TokenInfo & { modules: Set<string> }>()

  await Promise.all(modules.map(async (code, id) => {
    const result = await ctx.uno.generate(code, { id, extendedMatch: true, preflights: false })

    for (const [key, value] of result.matched.entries()) {
      const prev = tokensInfo.get(key)

      tokensInfo.set(key, {
        payload: value.payload,
        count: prev?.modules?.size ? value.count + prev.count : value.count,
        modules: new Set([...(prev?.modules || []), id]),
      })
    }
  }))

  for (const [rawSelector, { payload, count, modules: _modules }] of tokensInfo.entries()) {
    const ruleContext = payload[payload.length - 1][5]
    const baseSelector = ruleContext?.currentSelector
    const variants = ruleContext?.variants?.map(v => v.name).filter(Boolean) as string[]

    if (baseSelector) {
      const category = getSelectorCategory(baseSelector)
      const body = baseSelector
        .replace(/^ring-offset|outline-solid|outline-dotted/, 'head')
        .replace(/^\w+-/, '')
      const parsedColor = parseColor(body, ctx.uno.config.theme)

      if (parsedColor?.color && parsedColor?.color !== 'transparent') {
        const existing = colors.find(c => c.name === parsedColor.name && c.no === parsedColor.no)

        if (existing) {
          existing.count += count
          existing.modules = new Set([...existing.modules, ..._modules])
        }
        else {
          colors.push({
            name: parsedColor.name,
            no: parsedColor.no,
            color: parsedColor.color,
            count,
            modules: _modules,
          })
        }
      }

      if (category) {
        matched.push({
          name: rawSelector,
          rawSelector,
          baseSelector,
          category,
          variants,
          count,
          modules: _modules,
        })
        continue
      }
    }

    matched.push({
      name: rawSelector,
      rawSelector,
      category: 'other',
      count,
      modules: _modules,
    })
  }

  return {
    matched,
    colors,
  }
}
