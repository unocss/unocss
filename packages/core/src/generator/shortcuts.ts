import { ApplyVariantResult, CSSEntries, ParsedUtil, ResolvedConfig, StringifiedUtil } from '../types'
import { entriesToCss, isStaticShortcut } from '../utils'
import { toSelector } from './utils'

export function expandShortcut(config: ResolvedConfig, processed: string) {
  let result: string | string[] | undefined

  for (const s of config.shortcuts) {
    if (isStaticShortcut(s)) {
      if (s[0] === processed)
        result = s[1]
    }
    else {
      const match = processed.match(s[0])
      if (match)
        result = s[1](match)
      if (result)
        break
    }
  }

  if (!result)
    return

  if (typeof result === 'string')
    result = result.split(/ /g)

  return result
}

export function stringifyShortcuts(config: ResolvedConfig, parent: ApplyVariantResult, input: ParsedUtil[]): StringifiedUtil[] | undefined {
  const selectorMap: [string, string | undefined, CSSEntries][] = []

  const maxIndex = input.map(i => i[0]).sort((a, b) => b - a)[0]

  const [raw, , parentVariants] = parent

  for (const item of input) {
    const variants = [...item[3], ...parentVariants]
    const selector = variants.reduce((p, v) => v.selector?.(p, config.theme) || p, toSelector(raw))
    const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(item[1], config.theme) || p, undefined)
    const entries = variants.reduce((p, v) => v.rewrite?.(p, config.theme) || p, item[2])

    let mapItem = selectorMap.find(i => i[0] === selector && i[1] === mediaQuery)
    if (!mapItem) {
      mapItem = [selector, mediaQuery, []]
      selectorMap.push(mapItem)
    }
    mapItem[2].push(...entries)
  }

  return selectorMap
    .map(([selector, mediaQuery, entries]): StringifiedUtil | undefined => {
      const body = entriesToCss(entries)
      if (!body)
        return undefined
      return [maxIndex, `${selector}{${body}}`, mediaQuery]
    })
    .filter(Boolean) as StringifiedUtil[]
}
