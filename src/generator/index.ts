import { cssEscape, NanowindVariant, entriesToCss } from '..'
import { NanowindConfig } from '../types'

const cheatFilter = /[a-z]/

export function createGenerator(config: NanowindConfig) {
  const { rules, theme, variants } = config

  const cache = new Map<string, [number, string] | null>()

  return (code: string) => {
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
            const result = v.match(current)
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

        const match = matcher === current
          ? [current]
          : current.match(matcher)

        if (match) {
          let obj = typeof handler === 'function'
            ? handler(match, theme)
            : handler

          if (!obj)
            return

          if (!Array.isArray(obj))
            obj = Object.entries(obj)

          obj = appliedVariants.reduce((p, v) => v.rewrite?.(p) || p, obj)

          const body = entriesToCss(obj)
          if (!body)
            return

          const selector = appliedVariants.reduce((p, v) => v.selector?.(p) || p, `.${cssEscape(raw)}`)
          const css = `${selector}{${body}}`
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

    return sheet.sort((a, b) => a[0] - b[0]).map(i => i[1]).join('\n')
  }
}
