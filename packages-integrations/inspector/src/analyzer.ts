import type { BetterMap, ExtendedTokenInfo, UnocssPluginContext } from '@unocss/core'
import type { MatchedColor, MatchedSelector } from '../types'
import { parseColor } from '../../../packages-presets/preset-mini/src/utils'
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
  const icons: MatchedSelector[] = []
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
    const body = data.map(d => d[2]).join('\n---\n')
    const baseSelector = ruleContext?.currentSelector
    const variants = ruleContext?.variants?.map(v => v.name).filter(Boolean) as string[]
    const layer = ruleMeta?.layer || 'default'

    if (baseSelector) {
      const category = layer !== 'default' ? layer : getSelectorCategory(baseSelector)
      const body = baseSelector
        .replace(/^ring-offset|outline-solid|outline-dotted/, 'head')
        .replace(/^\w+-/, '')

      if (category === 'icons') {
        const existing = icons.find(i => i.baseSelector === baseSelector)
        if (existing) {
          existing.count += count
          existing.modules = uniq([...existing.modules, ..._modules])
        }
        else {
          icons.push({
            name: rawSelector,
            rawSelector,
            baseSelector,
            category,
            variants,
            count,
            ruleMeta,
            modules: _modules,
            body,
          })
        }
        continue
      }

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
            rawSelector,
            category: category || '',
            variants,
            body,
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
          body,
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
      body,
    })
  }

  return {
    matched,
    colors,
    icons,
  }
}
