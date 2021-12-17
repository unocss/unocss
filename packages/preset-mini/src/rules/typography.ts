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
  [/^font-(\w+)$/, ([, d], { theme }) => {
    const font = theme.fontFamily?.[d]
    if (font) {
      return {
        'font-family': font,
      }
    }
  }],

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
  [/^text-size-(.+)$/, ([, s]) => {
    const raw = h.bracket.auto.rem(s)
    if (raw)
      return { 'font-size': raw }
  }],

  // weights
  [/^(?:font|fw)-?([^-]+)$/, ([, s]) => {
    const v = weightMap[s] || h.number(s)
    if (v)
      return { 'font-weight': v }
  }],

  // leadings
  [/^(?:leading|lh)-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.lineHeight?.[s] || h.bracket.auto.rem(s)
    if (v !== null)
      return { 'line-height': v }
  }],

  // tracking
  [/^tracking-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.letterSpacing?.[s] || h.bracket.auto.rem(s)
    if (v !== null)
      return { 'letter-spacing': v }
  }],

  // word-spacing
  [/^word-spacing-([^-]+)$/, ([, s], { theme }) => {
    const v = theme.wordSpacing?.[s] || h.bracket.auto.rem(s)
    if (v !== null)
      return { 'word-spacing': v }
  }],
]

export const tabSizes: Rule<Theme>[] = [
  [/^tab-?([^-]*)$/, ([, s]) => {
    s = s || '4'
    const v = h.bracket.global.number(s)
    if (v !== null) {
      return {
        '-moz-tab-size': v,
        '-o-tab-size': v,
        'tab-size': v,
      }
    }
  }],
]

export const textIndents: Rule<Theme>[] = [
  [/^indent(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textIndent?.[s || 'DEFAULT'] || h.bracket.cssvar.fraction.auto.rem(s)
    if (v != null)
      return { 'text-indent': v }
  }],
]

export const textStrokes: Rule<Theme>[] = [
  // widths
  [/^text-stroke(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textStrokeWidth?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s)
    if (v != null)
      return { '-webkit-text-stroke-width': v }
  }],

  // colors
  [/^text-stroke-(.+)$/, colorResolver('-webkit-text-stroke-color', 'text-stroke')],
  [/^text-stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-stroke-opacity': h.bracket.percent(opacity) })],
]

export const textShadows: Rule<Theme>[] = [
  [/^text-shadow(?:-(.+))?$/, ([, s], { theme }) => {
    const v = theme.textShadow?.[s || 'DEFAULT'] || h.bracket.cssvar(s)
    if (v != null)
      return { 'text-shadow': v }
  }],
]
