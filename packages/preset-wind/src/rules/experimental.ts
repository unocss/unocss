import type { Rule } from '@unocss/core'
import { handler as h } from '@unocss/preset-mini/utils'
import { warnOnce } from '@unocss/core'

export const zooms: Rule[] = [
  [/^zoom-(.+)$/, ([, d]) => {
    warnOnce('The zoom-* rules are non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.')
    return { zoom: h.bracket.cssvar.fraction.global.percent(d) }
  }, { autocomplete: 'zoom-<percent/100>' }],
  ['zoom-normal', { zoom: 'normal' }],
  ['zoom-reset', { zoom: 'reset' }],
]

