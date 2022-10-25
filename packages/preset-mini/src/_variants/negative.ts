import type { Variant } from '@unocss/core'
import { CONTROL_MINI_NO_NEGATIVE, getComponent } from '../utils'

const numberRE = /[0-9.]+(?:[a-z]+|%)?/

const ignoreProps = [
  /opacity|color|flex/,
]

const negateFunctions = (value: string) => {
  const match = value.match(/^(calc|clamp|max|min)\s*(\(.*)/)
  if (match) {
    const [fnBody, rest] = getComponent(match[2], '(', ')', ' ') ?? []
    if (fnBody)
      return `calc(${match[1]}${fnBody} * -1)${rest ? ` ${rest}` : ''}`
  }
}

export const variantNegative: Variant = {
  name: 'negative',
  match(matcher) {
    if (!matcher.startsWith('-'))
      return

    return {
      matcher: matcher.slice(1),
      body: (body) => {
        if (body.find(v => v[0] === CONTROL_MINI_NO_NEGATIVE))
          return
        let changed = false
        body.forEach((v) => {
          const value = v[1]?.toString()
          if (!value || value === '0')
            return
          if (ignoreProps.some(i => v[0].match(i)))
            return
          const negated = negateFunctions(value)
          if (negated) {
            v[1] = negated
            changed = true
          }
          else if (numberRE.test(value)) {
            v[1] = value.replace(numberRE, i => `-${i}`)
            changed = true
          }
        })
        if (changed)
          return body
        return []
      },
    }
  },
}
