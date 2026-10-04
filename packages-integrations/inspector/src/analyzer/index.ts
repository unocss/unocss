import type { BetterMap, UnocssPluginContext } from '@unocss/core'
import type { MatchedColor, MatchedSelector } from '../../types'
import { addColor } from './colors'
import { addIcon, getIconPresets } from './icons'
import { toMatchedSelector } from './selectors'
import { collectTokens } from './tokens'

export async function analyzer(modules: BetterMap<string, string>, ctx: UnocssPluginContext) {
  const tokens = await collectTokens(modules, ctx)
  const iconPresets = getIconPresets(ctx)
  const matched: MatchedSelector[] = []
  const icons = new Map<string, MatchedSelector>()
  const colors = new Map<string, MatchedColor>()

  for (const [rawSelector, token] of tokens) {
    const selector = await toMatchedSelector(rawSelector, token, iconPresets)
    if (selector.category === 'icons') {
      addIcon(selector, icons)
    }
    else {
      addColor(selector, ctx.uno.config.theme, colors)
      matched.push(selector)
    }
  }

  return {
    matched,
    colors: [...colors.values()],
    icons: [...icons.values()],
  }
}
