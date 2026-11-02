import type { UnocssPluginContext } from '@unocss/core'
import type { IconsAPI, IconsOptions } from '@unocss/preset-icons'
import type { MatchedSelector } from '../../types'
import type { TokenInfo } from './tokens'

export function getIconPresets(ctx: UnocssPluginContext) {
  return ctx.uno.config.presets.flatMap((preset) => {
    const api = preset.api as IconsAPI | undefined
    if (preset.name !== '@unocss/preset-icons' || !api?.parseIcon)
      return []

    const prefixes = [((preset.options as IconsOptions | undefined)?.prefix ?? 'i-')].flat()
    return prefixes.map(prefix => ({ api, prefix }))
  })
}

export async function parseMatchedIcon(rawSelector: string, ruleMeta: TokenInfo['data'][number][4], iconPresets: ReturnType<typeof getIconPresets>) {
  const rulePrefixes = [ruleMeta?.prefix].flat()
  for (const { api, prefix } of iconPresets) {
    if (!rulePrefixes.includes(prefix))
      continue

    const index = rawSelector.indexOf(prefix)
    if (index < 0 || (index > 0 && rawSelector[index - 1] !== ':'))
      continue

    const selector = rawSelector.slice(index)
    const body = selector.slice(prefix.length).replace(/\?(?:mask|bg|auto)$/, '')
    const parsed = await api.parseIcon(body)
    if (parsed)
      return { selector, collection: parsed.collection }
  }
}

export function addIcon(selector: MatchedSelector, icons: Map<string, MatchedSelector>) {
  const key = selector.baseSelector!
  const existing = icons.get(key)
  if (existing) {
    existing.count += selector.count
    existing.modules = [...new Set([...existing.modules, ...selector.modules])]
  }
  else {
    icons.set(key, selector)
  }
}
