import type { DynamicRule, UserConfig } from '@unocss/core'

const matchedToken = (index: number) => `matched-${index}`

function createTokens(size: number) {
  const matchedCount = Math.max(1, Math.floor(size * 0.1))
  return Array.from(
    { length: size },
    (_, index) => index < matchedCount ? matchedToken(index) : `candidate-${index}`,
  )
}

const dynamicRule: DynamicRule = [/^matched-(\d+)$/, ([, index]) => ({ '--matched': index })]

export const workloads = {
  typical: createTokens(2_000),
  large: createTokens(25_000),
}

export const extractionSource = workloads.typical.join(' ')

export const defaultProfile: UserConfig = {
  rules: [
    ['static-token', { color: 'red' }],
    dynamicRule,
  ],
  preflights: [
    {
      getCSS: () => '*,::before{box-sizing:border-box}',
    },
  ],
}

export const variantProfile: UserConfig = {
  ...defaultProfile,
  variants: [
    {
      match: (matcher) => {
        if (!matcher.startsWith('hover:'))
          return
        return {
          matcher: matcher.slice('hover:'.length),
          selector: selector => `${selector}:hover`,
        }
      },
    },
  ],
}

export const customRuleProfile: UserConfig = {
  ...defaultProfile,
  rules: [
    dynamicRule,
    [/^value-(\d+)$/, ([, index]: RegExpMatchArray) => ({ '--value': index })],
  ],
}

export const variantToken = 'hover:matched-1'
export const customRuleToken = 'value-1'
