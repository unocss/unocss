import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h, isSize } from '../utils'

/**
 * @example op10 op-30 opacity-100
 */
export const opacity: Rule<Theme>[] = [
  [/^op(?:acity)?-?(.+)$/, ([, d], ctx) => ({ opacity: h.bracket.percent.cssvar(d, ctx) })],
]

const bgUrlRE = /^\[url\(.+\)\]$/
const bgLengthRE = /^\[(?:length|size):.+\]$/
const bgPositionRE = /^\[position:.+\]$/
const bgGradientRE = /^\[(?:linear|conic|radial)-gradient\(.+\)\]$/
const bgImageRE = /^\[image:.+\]$/

export const bgColors: Rule<Theme>[] = [
  [/^bg-(.+)$/, (match, ctx) => {
    const d = match[1]

    if (bgUrlRE.test(d))
      return { '--un-url': h.bracket(d, ctx), 'background-image': 'var(--un-url)' }
    const bracketLength = h.bracketOfLength(d, ctx)
    if (bgLengthRE.test(d) && bracketLength != null)
      return { 'background-size': bracketLength.split(' ').map(e => h.fraction.auto.px.cssvar(e) ?? e).join(' ') }
    const bracketPosition = h.bracketOfPosition(d, ctx)
    if ((isSize(d) || bgPositionRE.test(d)) && bracketPosition != null)
      return { 'background-position': bracketPosition.split(' ').map(e => h.position.fraction.auto.px.cssvar(e) ?? e).join(' ') }
    if (bgGradientRE.test(d) || bgImageRE.test(d)) {
      const s = h.bracket(d, ctx)
      if (s) {
        const url = s.startsWith('http') ? `url(${s})` : h.cssvar(s)
        return { 'background-image': url ?? s }
      }
    }
    return colorResolver('background-color', 'bg')(match, ctx)
  }, { autocomplete: 'bg-$colors' }],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity], ctx) => ({ '--un-bg-opacity': h.bracket.percent.cssvar(opacity, ctx) }), { autocomplete: 'bg-(op|opacity)-<percent>' }],
]

export const colorScheme: Rule<Theme>[] = [
  [/^(?:color-)?scheme-(.+)$/, ([, v]) => ({ 'color-scheme': v.split('-').join(' ') })],
]
