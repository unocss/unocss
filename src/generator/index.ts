import { cssEscape, NanowindVariant, entriesToCss } from '..'
import { NanowindConfig } from '../types'

const cheatFilter = /[a-z]/
const scopePlaceholder = / \$\$ /

function applyScope(css: string, scope?: string) {
  const hasPlaceholder = css.match(scopePlaceholder)
  if (hasPlaceholder)
    return css.replace(scopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

export function createGenerator(config: NanowindConfig) {
  const { rules, theme, variants } = config

  const cache = new Map<string, [number, string] | null>()

  return (code: string, scope?: string) => {
    const tokens = new Set(code.split(/[\s'"`;]/g))
    const sheet: [number, string][] = []

    tokens.forEach((token) => {
      if (!token.match(cheatFilter)) {
        tokens.delete(token)
      }
      else if (cache.has(token)) {
        const r = cache.get(token)
        if (r)
          sheet.push(r)
        tokens.delete(token)
      }
    })

    rules.forEach(([matcher, handler], ruleIndex) => {
      tokens.forEach((raw) => {
        const appliedVariants: NanowindVariant[] = []
        let current = raw

        let applied = false
        while (true) {
          applied = false
          for (const v of variants) {
            const result = v.match(current, theme)
            if (result) {
              current = result
              appliedVariants.push(v)
              applied = true
              break
            }
          }
          if (!applied)
            break
        }

        const match = typeof matcher === 'string'
          ? matcher === current
            ? [current]
            : null
          : current.match(matcher)

        if (match) {
          let obj = typeof handler === 'function'
            ? handler(match, theme)
            : handler

          if (!obj)
            return

          if (!Array.isArray(obj))
            obj = Object.entries(obj)

          obj = appliedVariants.reduce((p, v) => v.rewrite?.(p, theme) || p, obj)

          const body = entriesToCss(obj)
          if (!body)
            return

          const selector = appliedVariants.reduce((p, v) => v.selector?.(p, theme) || p, `.${cssEscape(raw)}`)
          const mediaQuery = appliedVariants.reduce((p: string | undefined, v) => v.mediaQuery?.(raw, theme) || p, undefined)

          let css = `${selector}{${body}}`
          if (mediaQuery)
            css = `${mediaQuery}{${css}}`

          const payload: [number, string] = [ruleIndex, css]
          sheet.push(payload)
          cache.set(raw, payload)
          tokens.delete(raw)
        }
      })
    })

    tokens.forEach((token) => {
      cache.set(token, null)
    })

    return sheet
      .sort((a, b) => a[0] - b[0])
      .map(i => applyScope(i[1], scope))
      .join('\n')
  }
}
