import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h, isSize } from '../utils'

/**
 * @example op10 op-30 opacity-100
 */
export const opacity: Rule<Theme>[] = [
  [/^op(?:acity)?-?(.+)$/, ([, d]) => ({ opacity: h.bracket.percent.cssvar(d) })],
]

const bgUrlRE = /^\[url\(.+\)\]$/
const bgLengthRE = /^\[(?:length|size):.+\]$/
const bgPositionRE = /^\[position:.+\]$/
const bgGradientRE = /^\[(?:linear|conic|radial)-gradient\(.+\)\]$/
const bgImageRE = /^\[image:.+\]$/

export const bgColors: Rule<Theme>[] = [
  [/^bg-(.+)$/, (...args) => {
    const d = args[0][1]
    if (bgUrlRE.test(d))
      return { '--un-url': h.bracket(d), 'background-image': 'var(--un-url)' }
    if (bgLengthRE.test(d) && h.bracketOfLength(d) != null)
      return { 'background-size': h.bracketOfLength(d)!.split(' ').map(e => h.fraction.auto.px.cssvar(e) ?? e).join(' ') }
    if ((isSize(d) || bgPositionRE.test(d)) && h.bracketOfPosition(d) != null)
      return { 'background-position': h.bracketOfPosition(d)!.split(' ').map(e => h.position.fraction.auto.px.cssvar(e) ?? e).join(' ') }
    if (bgGradientRE.test(d) || bgImageRE.test(d)) {
      const s = h.bracket(d)
      if (s) {
        const url = s.startsWith('http') ? `url(${s})` : h.cssvar(s)
        return { 'background-image': url ?? s }
      }
    }
    return colorResolver('background-color', 'bg')(...args)
  }, { autocomplete: 'bg-$colors' }],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-bg-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'bg-(op|opacity)-<percent>' }],
]

export const colorScheme: Rule<Theme>[] = [
  [/^color-scheme-(\w+)$/, ([, v]) => ({ 'color-scheme': v })],
]
