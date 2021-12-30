import type { Rule } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, handler as h } from '../utils'

const weightMap: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  // int[0, 900] -> int
}

export const fonts: Rule<Theme>[] = [
  // family
  [/^font-(\w+)$/, ([, d], { theme }) => ({ 'font-family': theme.fontFamily?.[d] })],

  // size
  [/^text-(.+)$/, ([, s = 'base'], { theme }) => {
    const size = h.bracket.auto.rem(s)
    if (size)
      return { 'font-size': size }

    const themed = toArray(theme.fontSize?.[s])
    if (themed?.[0]) {
      const [size, height] = themed
      return {
        'font-size': size,
        'line-height': height,
      }
    }
  }],
  [/^text-size-(.+)$/, ([, s]) => ({ 'font-size': h.bracket.auto.rem(s) })],

  // weights
  [/^(?:font|fw)-?([^-]+)$/, ([, s]) => ({ 'font-weight': weightMap[s] || h.number(s) })],

  // leadings
  [/^(?:leading|lh)-([^-]+)$/, ([, s], { theme }) => ({ 'line-height': theme.lineHeight?.[s] || h.bracket.auto.rem(s) })],

  // tracking
  [/^tracking-([^-]+)$/, ([, s], { theme }) => ({ 'letter-spacing': theme.letterSpacing?.[s] || h.bracket.auto.rem(s) })],

  // word-spacing
  [/^word-spacing-([^-]+)$/, ([, s], { theme }) => ({ 'word-spacing': theme.wordSpacing?.[s] || h.bracket.auto.rem(s) })],
]

export const tabSizes: Rule<Theme>[] = [
  [/^tab-?([^-]*)$/, ([, s]) => {
    const v = h.bracket.global.number(s || '4')
    if (v != null) {
      return {
        '-moz-tab-size': v,
        '-o-tab-size': v,
        'tab-size': v,
      }
    }
  }],
]

export const textIndents: Rule<Theme>[] = [
  [/^indent(?:-(.+))?$/, ([, s], { theme }) => ({ 'text-indent': theme.textIndent?.[s || 'DEFAULT'] || h.bracket.cssvar.fraction.auto.rem(s) })],
]

export const textStrokes: Rule<Theme>[] = [
  // widths
  [/^text-stroke(?:-(.+))?$/, ([, s], { theme }) => ({ '-webkit-text-stroke-width': theme.textStrokeWidth?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s) })],

  // colors
  [/^text-stroke-(.+)$/, colorResolver('-webkit-text-stroke-color', 'text-stroke')],
  [/^text-stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-stroke-opacity': h.bracket.percent(opacity) })],
]

export const textShadows: Rule<Theme>[] = [
  [/^text-shadow(?:-(.+))?$/, ([, s], { theme }) => ({ 'text-shadow': theme.textShadow?.[s || 'DEFAULT'] || h.bracket.cssvar(s) })],
]
