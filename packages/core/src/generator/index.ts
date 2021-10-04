import { UserConfig, ParsedUtil, StringifiedUtil, UserConfigDefaults } from '../types'
import { resolveConfig } from '../config'
import { expandShortcut, stringifyShortcuts } from './shortcuts'
import { isExcluded, parseUtil, stringifyUtil } from './parse'
import { applyVariants } from './variant'
import { applyScope } from './utils'

// TODO: move this to class
export function createGenerator(defaults: UserConfigDefaults, userConfig: UserConfig = {}) {
  const config = resolveConfig(defaults, userConfig)
  const _cache = new Map<string, StringifiedUtil | StringifiedUtil[] | null>()
  const extractors = config.extractors

  return async(input: string | (Set<string> | undefined)[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const excluded = new Set<string>()
    const sheet: Record<string, StringifiedUtil[]> = {}

    function hit(raw: string, payload: StringifiedUtil | StringifiedUtil[]) {
      matched.add(raw)
      _cache.set(raw, payload)

      if (typeof payload[0] === 'number')
        payload = [payload as StringifiedUtil]

      for (const item of payload as StringifiedUtil[]) {
        const query = item[3] || ''
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

        if (isExcluded(config, raw)) {
          excluded.add(raw)
          _cache.set(raw, null)
          return
        }

        const applied = applyVariants(config, raw)

        if (isExcluded(config, applied[1])) {
          excluded.add(raw)
          _cache.set(raw, null)
          return
        }

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
        const itemsSize = items.length
        const sorted: [string, string][] = items
          .sort((a, b) => a[0] - b[0])
          .map(a => [applyScope(a[1], scope), a[2]])
        const rules = sorted
          .map(([selector, body], idx) => {
            if (config.mergeSelectors) {
              // search for rules that has exact same body, and merge them
              // the index is reversed to make sure we always merge to the last one
              for (let i = itemsSize - 1; i > idx; i--) {
                const current = sorted[i]
                if (current[1] === body) {
                  current[0] = `${selector}, ${current[0]}`
                  return null
                }
              }
            }
            return `${selector}{${body}}`
          })
          .filter(Boolean)
          .join('\n')

        return query
          ? `${query}{\n${rules}\n}`
          : rules
      })
      .join('\n')

    return {
      css,
      matched,
      excluded,
    }
  }
}
