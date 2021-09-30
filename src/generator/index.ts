import { objToCss } from '..'
import { MiniwindConfig } from '../types'

export function createGenerator(config: MiniwindConfig) {
  const cache = new Map<string, string | null>()

  return (code: string) => {
    const tokens = new Set(code.split(/[\s'"`;]/g))
    const css: string[] = []

    tokens.forEach((token) => {
      if (cache.has(token)) {
        const r = cache.get(token)
        if (r)
          css.push(r)
        tokens.delete(token)
      }
    })

    for (const [matcher, handler] of config.rules) {
      tokens.forEach((token) => {
        const match = token.match(matcher)
        if (match) {
          let result = handler(Array.from(match))
          if (!result)
            return

          if (Array.isArray(result))
            result = result[0] + objToCss(result[1])

          css.push(result)
          cache.set(token, result)
          tokens.delete(token)
        }
      })
    }

    tokens.forEach((token) => {
      cache.set(token, null)
    })

    return css.join('\n')
  }
}
