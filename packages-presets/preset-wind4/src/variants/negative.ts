import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { toArray } from '@unocss/core'
import { getStringComponent } from '@unocss/rule-utils'
import { CONTROL_NO_NEGATIVE, cssMathFnRE, cssVarFnRE } from '../utils'

const anchoredNumberRE = /^-?[0-9.]+(?:[a-z]+|%)?$/
const numberRE = /-?[0-9.]+(?:[a-z]+|%)?/
const spacingMultiplyRE = /var\(--spacing(?:-[\w-]+)?\)\s*\*\s*(-?[0-9.]+(?:[a-z]+|%)?)/

const ignoreProps = [
  /\b(opacity|color|flex|backdrop-filter|^filter|^scale|transform|mask-image)\b/,
]

function negateMathFunction(value: string) {
  const match = value.match(cssMathFnRE) || value.match(cssVarFnRE)
  if (match) {
    const [fnBody, rest] = getStringComponent(`(${match[2]})${match[3]}`, '(', ')', ' ') ?? []
    if (fnBody) {
      const spacingMultiplyMatch = fnBody.match(spacingMultiplyRE)
      if (spacingMultiplyMatch) {
        const num = spacingMultiplyMatch[1]
        const nextNum = num.startsWith('-') ? num.slice(1) : `-${num}`
        const nextFnBody = fnBody.replace(spacingMultiplyRE, (segment) => {
          return segment.replace(num, nextNum)
        })
        return `${match[1]}${nextFnBody}${rest ? ` ${rest}` : ''}`
      }

      return `calc(${match[1]}${fnBody} * -1)${rest ? ` ${rest}` : ''}`
    }
  }
}

const negateFunctionBodyRE = /\b(hue-rotate)\s*(\(.*)/
function negateFunctionBody(value: string) {
  const match = value.match(negateFunctionBodyRE)
  if (match) {
    const [fnBody, rest] = getStringComponent(match[2], '(', ')', ' ') ?? []
    if (fnBody) {
      const body = anchoredNumberRE.test(fnBody.slice(1, -1))
        ? fnBody.replace(numberRE, i => i.startsWith('-') ? i.slice(1) : `-${i}`)
        : `(calc(${fnBody} * -1))`
      return `${match[1]}${body}${rest ? ` ${rest}` : ''}`
    }
  }
}

export const variantNegative: Variant<Theme> = {
  name: 'negative',
  match(matcher) {
    if (!matcher.startsWith('-'))
      return

    return {
      matcher: matcher.slice(1),
      body: (body) => {
        if (body.find(v => v[0] === CONTROL_NO_NEGATIVE))
          return

        let changed = false
        for (const v of body) {
          const [prop, rawValue, meta] = v

          // skip `symbols.variants` and other non-string values
          if (typeof rawValue === 'object')
            continue

          if (meta && toArray(meta).includes(CONTROL_NO_NEGATIVE))
            continue

          const value = rawValue?.toString()
          if (!value || value === '0' || ignoreProps.some(i => i.test(prop)))
            continue

          const nextValue = negateMathFunction(value)
            ?? negateFunctionBody(value)
            ?? (anchoredNumberRE.test(value)
              ? value.replace(numberRE, i => i.startsWith('-') ? i.slice(1) : `-${i}`)
              : undefined)

          if (!nextValue || nextValue === value)
            continue

          v[1] = nextValue
          changed = true
        }

        if (changed)
          return body
        return []
      },
    }
  },
}
