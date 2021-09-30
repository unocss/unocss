import { cssEscape, NanowindVariant, entriesToCss } from '..'
import { NanowindConfig } from '../types'

export function createGenerator(config: NanowindConfig) {
  const { rules, theme, variants } = config

  const cache = new Map<string, string | null>()

  return (code: string) => {
    const tokens = new Set(code.split(/[\s'"`;]/g))
    const sheet: string[] = []

    tokens.forEach((token) => {
      if (cache.has(token)) {
        const r = cache.get(token)
        if (r)
          sheet.push(r)
        tokens.delete(token)
      }
    })

    for (const [matcher, handler] of rules) {
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
          sheet.push(css)
          cache.set(raw, css)
          tokens.delete(raw)
        }
      })
    }

    tokens.forEach((token) => {
      cache.set(token, null)
    })

    return sheet.join('\n')
  }
}
