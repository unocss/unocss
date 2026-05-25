import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h } from '../utils'

export const zooms: Rule<Theme>[] = [
  [/^zoom-(.+)$/, ([, value], { theme }) => {
    const arbitrary = h.bracket.cssvar(value, theme)
    if (arbitrary != null)
      return { zoom: arbitrary }

    const number = h.number(value)
    if (typeof number === 'number' && Number.isInteger(number) && number > 0)
      return { zoom: `${number}%` }
  }, { autocomplete: 'zoom-<num>' }],
]
