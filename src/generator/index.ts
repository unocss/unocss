import { cssEscape, NanowindVariant, entriesToCss } from '..'
import { NanowindConfig } from '../types'

export function createGenerator(config: NanowindConfig) {
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

    for (const [matcher, handler] of config.rules) {
      tokens.forEach((raw) => {
        const variants: NanowindVariant[] = []
        let current = raw

        let applied = false
        while (true) {
          applied = false
          for (const v of config.variants) {
            const result = v.match(current)
            if (result) {
              current = result
              variants.push(v)
              applied = true
              break
            }
          }
          if (!applied)
            break
        }

        const match = current.match(matcher)
        if (match) {
          let obj = handler(Array.from(match))
          if (!obj)
            return

          if (!Array.isArray(obj))
            obj = Object.entries(obj)

          obj = variants.reduce((p, v) => v.rewrite?.(p) || p, obj)

          const body = entriesToCss(obj)
          if (!body)
            return

          const selector = variants.reduce((p, v) => v.selector?.(p) || p, `.${cssEscape(raw)}`)
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
