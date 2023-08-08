import type { BetterMap, UnocssPluginContext } from '@unocss/core'
import { sortRules } from '../../shared-integration/src/sort-rules'
import type { SuggestedShortcut } from '../types'
import { getIntersections } from './utils'

export async function extractGroups(modules: BetterMap<string, string>, ctx: UnocssPluginContext) {
  const allSelectors: { selectors: string[]; id: string }[] = []

  await Promise.all(modules.map(async (code, id) => {
    const extracted = await extractSelectors(code, ctx)

    extracted.forEach(selectors => allSelectors.push({ selectors, id }))
  }))

  const intersected = getIntersections(allSelectors.map(item => item.selectors)) // Object.values(itemGroups)
  const itemGroups: Record<string, SuggestedShortcut> = {}

  for (let i = 0; i < allSelectors.length; i++) {
    for (let j = 0; j < intersected.length; j++) {
      const key = intersected[j].join(' ')
      if (!itemGroups[key])
        itemGroups[key] = { name: key, selectors: intersected[j], count: 0, modules: new Set() }

      if (itemGroups[key].selectors.every(s => allSelectors[i].selectors.includes(s))) {
        itemGroups[key].count++
        itemGroups[key].modules.add(allSelectors[i].id)
      }
    }
  }

  return Object.values(itemGroups)
    .map(item => ({ ...item, name: item.selectors.join(' ') }))
    .filter(item => item.count > 3 && item.selectors.length > 2)
    .sort((a, b) => b.count - a.count)
}

async function extractSelectors(code: string, ctx: UnocssPluginContext) {
  const selectors: string[][] = []
  const matchedTags = code.match(/<[a-zA-Z][^<>]*>/g)

  if (!matchedTags)
    return []

  for (const tag of matchedTags) {
    const _tokens = await ctx.uno.applyExtractors(tag)
    const _selectors = new Set<string>()

    for (const raw of _tokens) {
      const parsed = await ctx.uno.parseToken(raw)

      if (!parsed)
        continue

      const { variants, variantMatch, variantHandlers } = parsed[parsed.length - 1][5] || {}
      let selector: string | undefined

      if (variants?.some(({ name }) => name === 'attributify' || name === 'tagify'))
        selector = variantHandlers?.[variantHandlers?.length - 1]?.matcher
      else
        selector = variantMatch?.[0]

      if (selector)
        _selectors.add(selector)
    }

    if (_selectors.size > 1)
      selectors.push((await sortRules([..._selectors].join(' '), ctx.uno)).split(' '))
  }

  return selectors
}
