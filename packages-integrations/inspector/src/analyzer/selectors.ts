import type { MatchedSelector } from '../../types'
import type { getIconPresets } from './icons'
import type { TokenInfo } from './tokens'
import { getSelectorCategory } from '../utils'
import { parseMatchedIcon } from './icons'

function toOtherSelector(rawSelector: string, { data, count, modules }: TokenInfo): MatchedSelector {
  return {
    name: rawSelector,
    rawSelector,
    category: 'other',
    count,
    modules,
    body: data.map(rule => rule[2]).join('\n---\n'),
  }
}

export async function toMatchedSelector(rawSelector: string, { data, count, modules }: TokenInfo, iconPresets: ReturnType<typeof getIconPresets>): Promise<MatchedSelector> {
  const lastRule = data[data.length - 1]
  const ruleContext = lastRule[5]
  const ruleMeta = lastRule[4]
  const layer = ruleMeta?.layer || 'default'
  const currentSelector = ruleContext?.currentSelector
  const icon = await parseMatchedIcon(rawSelector, ruleMeta, iconPresets)
  const baseSelector = currentSelector || icon?.selector

  const category = icon ? 'icons' : layer !== 'default' ? layer : baseSelector && getSelectorCategory(baseSelector)
  if (!baseSelector || !category)
    return toOtherSelector(rawSelector, { data, count, modules })

  return {
    name: rawSelector,
    rawSelector,
    baseSelector,
    collection: icon?.collection,
    category,
    variants: ruleContext?.variants?.map(variant => variant.name).filter(Boolean) as string[],
    count,
    ruleMeta,
    modules,
    body: baseSelector
      .replace(/^ring-offset|outline-solid|outline-dotted/, 'head')
      .replace(/^\w+-/, ''),
  }
}
