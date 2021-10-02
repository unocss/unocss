import { MiniwindVariant, MiniwindCssObject, MiniwindCssEntries, MiniwindRule, MiniwindStaticRule, MiniwindUserConfig } from '../types'
import { resolveConfig } from '../options'
import { cssEscape, entriesToCss } from '../utils'

const reScopePlaceholder = / \$\$ /

const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

function isStaticRule(rule: MiniwindRule): rule is MiniwindStaticRule {
  return typeof rule[0] === 'string'
}

function toSelector(raw: string) {
  if (raw.startsWith('['))
    return raw.replace(/"(.*)"/, (_, i) => `"${cssEscape(i)}"`)
  else
    return `.${cssEscape(raw)}`
}

type Cache = readonly [number, string, string | undefined]

export function createGenerator(userConfig: MiniwindUserConfig = {}) {
  const config = resolveConfig(userConfig)
  const { rules, theme } = config

  const rulesLength = rules.length

  const cache = new Map<string, Cache | null>()
  const extractors = config.extractors

  return async(input: string | Set<string>[], id?: string, scope?: string) => {
    const tokensArray = Array.isArray(input)
      ? input
      : await Promise.all(extractors.map(i => i(input, id)))

    const sheet: Record<string, Cache[]> = {}

    function updateSheet(data: Cache) {
      const query = data[2] || ''
      if (!(query in sheet))
        sheet[query] = []
      sheet[query].push(data)
    }

    tokensArray.forEach((tokens) => {
      tokens.forEach((raw) => {
        // use caches if possible
        if (cache.has(raw)) {
          const r = cache.get(raw)
          if (r)
            updateSheet(r)
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

        // match tokens
        for (let i = 0; i < rulesLength; i++) {
          const rule = rules[i]

          let obj: MiniwindCssObject | MiniwindCssEntries | undefined

          // static rule
          if (isStaticRule(rule)) {
            if (rule[0] !== processed)
              continue
            obj = rule[1]
          }
          // dynamic rule
          else {
            const [matcher, handler] = rule
            const match = processed.match(matcher)
            if (!match)
              continue
            obj = handler(match, theme)
          }

          if (!obj)
            continue

          if (!Array.isArray(obj))
            obj = Object.entries(obj)

          obj = variants.reduce((p, v) => v.rewrite?.(p, theme) || p, obj)

          const body = entriesToCss(obj)
          if (!body)
            continue

          const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, toSelector(raw))
          const mediaQuery = variants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

          const css = `${selector}{${body}}`
          const payload = [i, css, mediaQuery] as const
          updateSheet(payload)
          cache.set(raw, payload)
          return
        }

        // set null cache for unmatched result
        cache.set(raw, null)
      })
    })

    return Object.entries(sheet)
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
  }
}
