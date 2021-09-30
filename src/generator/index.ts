import { MiniwindRule } from '../types'

export function createGenerator(rules: MiniwindRule[]) {
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

    for (const [matcher, handler] of rules) {
      tokens.forEach((token) => {
        const match = token.match(matcher)
        if (match) {
          const result = handler(...Array.from(match))
          if (result) {
            css.push(result)
            cache.set(token, result)
            tokens.delete(token)
          }
        }
      })
    }

    tokens.forEach((token) => {
      cache.set(token, null)
    })

    return css.join('\n')
  }
}
