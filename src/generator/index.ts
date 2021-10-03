import { MiniwindVariant, MiniwindCssObject, MiniwindCssEntries, MiniwindUserConfig } from '../types'
import { resolveConfig } from '../options'
import { escapeSelector, entriesToCss } from '../utils'

const reScopePlaceholder = / \$\$ /

const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

function toSelector(raw: string) {
  if (raw.startsWith('['))
    return raw.replace(/"(.*)"/, (_, i) => `"${escapeSelector(i)}"`)
  else
    return `.${escapeSelector(raw)}`
}

type Cache = readonly [number, string, string | undefined]

export function createGenerator(userConfig: MiniwindUserConfig = {}) {
  const config = resolveConfig(userConfig)
  const { dynamicRules, theme, staticRulesMap } = config

  const rulesLength = dynamicRules.length

  const _cache = new Map<string, Cache | null>()
  const extractors = config.extractors

  return async(input: string | Set<string>[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const matched = new Set<string>()
    const sheet: Record<string, Cache[]> = {}

    function hit(raw: string, payload: Cache) {
      matched.add(raw)
      _cache.set(raw, payload)

      const query = payload[2] || ''
      if (!(query in sheet))
        sheet[query] = []
      sheet[query].push(payload)
    }

    tokensArray.forEach((tokens) => {
      tokens.forEach((raw) => {
        if (matched.has(raw))
          return

        // use caches if possible
        if (_cache.get(raw)) {
          const r = _cache.get(raw)
          if (r)
            hit(raw, r)
          return
        }

        // process variants
        const variants: MiniwindVariant[] = []
        let processed = raw

        let applied = false
        while (true) {
          applied = false
          for (const v of config.variants) {
            const result = v.match(processed, theme)
            if (result && result !== processed) {
              processed = result
              variants.push(v)
              applied = true
              break
            }
          }
          if (!applied)
            break
        }

        function handleObj(index: number, obj: MiniwindCssObject | MiniwindCssEntries | undefined) {
          if (!obj)
            return

          if (!Array.isArray(obj))
            obj = Object.entries(obj)

          obj = variants.reduce((p, v) => v.rewrite?.(p, theme) || p, obj)

          const body = entriesToCss(obj)
          if (!body)
            return

          const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toSelector(raw))
          const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

          const css = `${selector}{${body}}`
          const payload = [index, css, mediaQuery] as const
          hit(raw, payload)
          return payload
        }

        // use map to for static rules
        const staticMatch = staticRulesMap[processed]
        if (staticMatch && handleObj(...staticMatch))
          return

        // match rules
        for (let i = 0; i < rulesLength; i++) {
          const rule = dynamicRules[i]

          // static rules are omitted as undefined
          if (!rule)
            continue

          // dynamic rules
          const [matcher, handler] = rule
          const match = processed.match(matcher)
          if (!match)
            continue

          const obj = handler(match, theme)
          if (handleObj(i, obj))
            return
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
