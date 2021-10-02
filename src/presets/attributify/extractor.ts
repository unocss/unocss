import { MiniwindExtractor } from '../../types'

export const extractorAttributify: MiniwindExtractor = (code) => {
  return new Set(
    Array.from(code.matchAll(/(\w+)=(["'])([^\2]+?)\2/g))
      .flatMap(([, name, _, content = '']) => {
        return content
          .split(/[\s'"`;]/g)
          .map(v => `[${name}~="${v}"]`)
      }),
  )
}
