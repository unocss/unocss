import type { GenerateResult, TokenInfo, UnocssPluginContext } from '@unocss/core'
import { parseColor } from '@unocss/preset-mini/utils'
import type { MatchedColor, MatchedSelector } from '../types'
import { getSelectorCategory } from './utils'

export async function analyzer(result: GenerateResult<Map<string, TokenInfo<{}>>>, ctx: UnocssPluginContext) {
  const matched: MatchedSelector[] = []
  const colors: MatchedColor[] = []

  for (const [rawSelector, { payload, count }] of result.matched.entries()) {
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
          existing.count++
        }
        else {
          colors.push({
            name: parsedColor.name,
            no: parsedColor.no,
            color: parsedColor.color,
            count: 1,
          })
        }
      }

      if (category) {
        matched.push({
          rawSelector,
          baseSelector,
          category,
          variants,
          count,
        })
        continue
      }
    }

    matched.push({
      rawSelector,
      category: 'other',
      count,
    })
  }

  return {
    matched,
    colors,
  }
}
