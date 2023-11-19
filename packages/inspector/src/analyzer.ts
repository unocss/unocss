import type { BetterMap, ExtendedTokenInfo, UnocssPluginContext } from '@unocss/core'
import { parseColor } from '../../preset-mini/src/utils'
import type { MatchedColor, MatchedSelector } from '../types'
import { getSelectorCategory } from './utils'

const ignoredColors = [
  'transparent',
  'current',
  'currentColor',
  'inherit',
  'initial',
  'unset',
  'none',
]

function uniq<T>(array: T[]) {
  return [...new Set(array)]
}

export async function analyzer(modules: BetterMap<string, string>, ctx: UnocssPluginContext) {
  const matched: MatchedSelector[] = []
  const colors: MatchedColor[] = []
  const tokensInfo = new Map<string, ExtendedTokenInfo & { modules: string[] }>()

  await Promise.all(modules.map(async (code, id) => {
    const result = await ctx.uno.generate(code, { id, extendedInfo: true, preflights: false })

    for (const [key, value] of result.matched.entries()) {
      const prev = tokensInfo.get(key)

      tokensInfo.set(key, {
        data: value.data,
        count: prev?.modules?.length ? value.count + prev.count : value.count,
        modules: uniq([...(prev?.modules || []), id]),
      })
    }
  }))

  for (const [rawSelector, { data, count, modules: _modules }] of tokensInfo.entries()) {
    const ruleContext = data[data.length - 1][5]
    const ruleMeta = data[data.length - 1][4]
    const baseSelector = ruleContext?.currentSelector
    const variants = ruleContext?.variants?.map(v => v.name).filter(Boolean) as string[]
    const layer = ruleMeta?.layer || 'default'

    if (baseSelector) {
      const category = layer !== 'default' ? layer : getSelectorCategory(baseSelector)
      const body = baseSelector
        .replace(/^ring-offset|outline-solid|outline-dotted/, 'head')
        .replace(/^\w+-/, '')
      const parsedColor = parseColor(body, ctx.uno.config.theme, 'colors')

      if (parsedColor?.color && !ignoredColors.includes(parsedColor?.color)) {
        const existing = colors.find(c => c.name === parsedColor.name && c.no === parsedColor.no)

        if (existing) {
          existing.count += count
          existing.modules = uniq([...existing.modules, ..._modules])
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
          ruleMeta,
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
