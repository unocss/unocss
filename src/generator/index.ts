import { MiniwindVariant, MiniwindCssObject, MiniwindCssEntries, MiniwindRule, MiniwindStaticRule, MiniwindUserConfig } from '../types'
import { resolveConfig } from '../options'
import { cssEscape, entriesToCss, toArray } from '../utils'

const reValidateFilter = /[a-z]/
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

export function createGenerator(userConfig: MiniwindUserConfig = {}) {
  const config = resolveConfig(userConfig)
  const { rules, theme } = config

  const rulesLength = rules.length
  const cache = new Map<string, [number, string] | null>()
  const extractors = toArray(config.extractors)

  return async(code: string, id?: string, scope?: string) => {
    const results = await Promise.all(extractors.map(i => i(code, id)))
    const sheet: [number, string][] = []

    results.forEach((tokens) => {
      tokens.forEach((raw) => {
        // filter out invalid tokens
        if (!raw.match(reValidateFilter))
          return

        // use caches if possible
        if (cache.has(raw)) {
          const r = cache.get(raw)
          if (r)
            sheet.push(r)
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

          let css = `${selector}{${body}}`
          if (mediaQuery) {
            css = hasScopePlaceholder(css)
              ? `${mediaQuery}{${css}}`
              : `${mediaQuery}{ $$ ${css}}`
          }

          const payload: [number, string] = [i, css]
          sheet.push(payload)
          cache.set(raw, payload)
          return
        }

        // set null cache for unmatched result
        cache.set(raw, null)
      })
    })

    return sheet
      .sort((a, b) => a[0] - b[0])
      .map(i => applyScope(i[1], scope))
      .join('\n')
  }
}
