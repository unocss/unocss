import { UserConfig, ParsedUtil, StringifiedUtil, UserConfigDefaults } from '../types'
import { resolveConfig } from '../config'
import { expandShortcut, stringifyShortcuts } from './shortcuts'
import { parseUtil, stringifyUtil } from './parse'
import { applyVariants } from './variant'
import { applyScope } from './utils'

export function createGenerator(defaults: UserConfigDefaults, userConfig: UserConfig = {}) {
  const config = resolveConfig(defaults, userConfig)
  const _cache = new Map<string, StringifiedUtil | StringifiedUtil[] | null>()
  const extractors = config.extractors

  return async(input: string | (Set<string> | undefined)[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const sheet: Record<string, StringifiedUtil[]> = {}

    function hit(raw: string, payload: StringifiedUtil | StringifiedUtil[]) {
      matched.add(raw)
      _cache.set(raw, payload)

      if (typeof payload[0] === 'number')
        payload = [payload as StringifiedUtil]

      for (const item of payload as StringifiedUtil[]) {
        const query = item[2] || ''
        if (!(query in sheet))
          sheet[query] = []
        sheet[query].push(item)
      }
    }

    tokensArray.forEach((tokens) => {
      tokens?.forEach((raw) => {
        if (matched.has(raw))
          return

        // use caches if possible
        if (_cache.has(raw)) {
          const r = _cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        const applied = applyVariants(config, raw)

        // expand shortcuts
        const expanded = expandShortcut(config, applied[1])
        if (expanded) {
          const parsed = (expanded.map(i => parseUtil(config, i)).filter(Boolean) || []) as ParsedUtil[]
          const r = stringifyShortcuts(config, applied, parsed)
          if (r?.length) {
            hit(raw, r)
            return
          }
        }
        // no shortcut
        else {
          const util = parseUtil(config, applied)
          const r = stringifyUtil(config, util)
          if (r) {
            hit(raw, r)
            return
          }
        }

        // set null cache for unmatched result
        _cache.set(raw, null)
      })
    })

    const css = Object.entries(sheet)
      .map(([query, items]) => {
        const rules = items
          .sort((a, b) => a[0] - b[0])
          .map(i => applyScope(i[1], scope))
          .join('\n')
        if (query)
          return `${query}{\n${rules}\n}`
        return rules
      })
      .join('\n')

    return {
      css,
      matched,
    }
  }
}
