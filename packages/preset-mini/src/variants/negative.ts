import type { Variant } from '@unocss/core'
import { CONTROL_MINI_NO_NEGATIVE } from '../utils'

const numberRE = /[0-9.]+(?:[a-z]+|%)?/

const ignoreProps = [
  /opacity|color|flex/,
]

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
          if (numberRE.test(value)) {
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
