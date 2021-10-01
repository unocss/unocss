import { cssEscape, NanowindVariant, entriesToCss, NanowindCssObject, NanowindCssEntries, NanowindRule, NanowindStaticRule } from '..'
import { NanowindConfig } from '../types'

const reValidateFilter = /[a-z]/
const reScopePlaceholder = / \$\$ /

const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

function isStaticRule(rule: NanowindRule): rule is NanowindStaticRule {
  return typeof rule[0] === 'string'
}

export function createGenerator(config: NanowindConfig) {
  const { rules, theme } = config

  const rulesLength = rules.length
  const cache = new Map<string, [number, string] | null>()

  return (code: string, scope?: string) => {
    const tokens = new Set(code.split(/[\s'"`;]/g))
    const sheet: [number, string][] = []

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
      const variants: NanowindVariant[] = []
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

        let obj: NanowindCssObject | NanowindCssEntries | undefined

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

        const selector = variants.reduce((p, v) => v.selector?.(p, theme) || p, `.${cssEscape(raw)}`)
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

    return sheet
      .sort((a, b) => a[0] - b[0])
      .map(i => applyScope(i[1], scope))
      .join('\n')
  }
}
