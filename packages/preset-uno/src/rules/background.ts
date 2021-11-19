import { Rule, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'
import { parseColorUtil } from './color'

const colorResolver = (mode: 'from' | 'to' | 'via') =>
  ([, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColorUtil(body, theme)

    if (!data)
      return

    const { opacity, color, rgba } = data

    if (!color)
      return

    let colorString = color
    if (rgba) {
      const a = opacity
        ? opacity[0] === '['
          ? h.bracket.percent(opacity)!
          : (parseFloat(opacity) / 100)
        : rgba[3]

      if (a != null && !Number.isNaN(a)) {
        // @ts-expect-error
        rgba[3] = typeof a === 'string' && !a.includes('%')
          ? parseFloat(a)
          : a
        colorString = `rgba(${rgba.join(',')})`
      }
      else {
        colorString = `rgba(${rgba.slice(0, 3).join(',')}, var(--un-${mode}-opacity, 1))`
      }
    }

    switch (mode) {
      case 'from':
        return {
          '--un-gradient-from': colorString,
          '--un-gradient-stops': 'var(--un-gradient-from), var(--un-gradient-to, rgba(255, 255, 255, 0))',
        }
      case 'via':
        return {
          '--un-gradient-stops': `var(--un-gradient-from), ${colorString}, var(--un-gradient-to, rgba(255, 255, 255, 0))`,
        }
      case 'to':
        return {
          '--un-gradient-to': colorString,
        }
    }
  }

export const bgAttachments: Rule[] = [
  ['bg-fixed', { 'background-attachment': 'fixed' }],
  ['bg-local', { 'background-attachment': 'local' }],
  ['bg-scroll', { 'background-attachment': 'scroll' }],
]

export const bgBlendModes: Rule[] = [
  ['bg-blend-normal', { 'background-blend-mode': 'normal' }],
  ['bg-blend-multiply', { 'background-blend-mode': 'multiply' }],
  ['bg-blend-screen', { 'background-blend-mode': 'screen' }],
  ['bg-blend-overlay', { 'background-blend-mode': 'overlay' }],
  ['bg-blend-darken', { 'background-blend-mode': 'darken' }],
  ['bg-blend-lighten', { 'background-blend-mode': 'lighten' }],
  ['bg-blend-color-dodge', { 'background-blend-mode': 'color-dodge' }],
  ['bg-blend-color-burn', { 'background-blend-mode': 'color-burn' }],
  ['bg-blend-hard-light', { 'background-blend-mode': 'hard-light' }],
  ['bg-blend-soft-light', { 'background-blend-mode': 'soft-light' }],
  ['bg-blend-difference', { 'background-blend-mode': 'difference' }],
  ['bg-blend-exclusion', { 'background-blend-mode': 'exclusion' }],
  ['bg-blend-hue', { 'background-blend-mode': 'hue' }],
  ['bg-blend-saturation', { 'background-blend-mode': 'saturation' }],
  ['bg-blend-color', { 'background-blend-mode': 'color' }],
  ['bg-blend-luminosity', { 'background-blend-mode': 'luminosity' }],
]

export const bgClips: Rule[] = [
  ['bg-clip-border', { '-webkit-background-clip': 'border-box', 'background-attachment': 'border-box' }],
  ['bg-clip-content', { '-webkit-background-clip': 'content-box', 'background-attachment': 'content-box' }],
  ['bg-clip-padding', { '-webkit-background-clip': 'padding-box', 'background-attachment': 'padding-box' }],
  ['bg-clip-text', { '-webkit-background-clip': 'text', 'background-attachment': 'text' }],
]

export const bgGradients: Rule[] = [
  [/^from-(.+)$/, colorResolver('from')],
  [/^to-(.+)$/, colorResolver('to')],
  [/^via-(.+)$/, colorResolver('via')],
  [/^from-op(?:acity)?-?(.+)$/m, ([, opacity]) => ({ '--un-from-opacity': h.bracket.percent(opacity) })],
  [/^to-op(?:acity)?-?(.+)$/m, ([, opacity]) => ({ '--un-to-opacity': h.bracket.percent(opacity) })],
  [/^via-op(?:acity)?-?(.+)$/m, ([, opacity]) => ({ '--un-via-opacity': h.bracket.percent(opacity) })],
]

export const bgImages: Rule[] = [
  ['bg-none', { 'background-image': 'none' }],
  ['bg-gradient-to-t', {
    'background-image': 'linear-gradient(to top, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-tr', {
    'background-image': 'linear-gradient(to top right, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-r', {
    'background-image': 'linear-gradient(to right, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-br', {
    'background-image': 'linear-gradient(to bottom right, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-b', {
    'background-image': 'linear-gradient(to bottom, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-bl', {
    'background-image': 'linear-gradient(to bottom left, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-l', {
    'background-image': 'linear-gradient(to left, var(--un-gradient-stops))',
  }],
  ['bg-gradient-to-tl', {
    'background-image': 'linear-gradient(to top left, var(--un-gradient-stops))',
  }],
]

export const bgOrigins: Rule[] = [
  ['bg-origin-border', { 'background-origin': 'border-box' }],
  ['bg-origin-padding', { 'background-origin': 'padding-box' }],
  ['bg-origin-content', { 'background-origin': 'content-box' }],
]

export const bgPositions: Rule[] = [
  ['bg-bottom', { 'background-position': 'bottom' }],
  ['bg-center', { 'background-position': 'center' }],
  ['bg-left', { 'background-position': 'left' }],
  ['bg-left-bottom', { 'background-position': 'left bottom' }],
  ['bg-left-top', { 'background-position': 'left top' }],
  ['bg-right', { 'background-position': 'right' }],
  ['bg-right-bottom', { 'background-position': 'right bottom' }],
  ['bg-right-top', { 'background-position': 'right top' }],
  ['bg-top', { 'background-position': 'top' }],
]

export const bgRepeats: Rule[] = [
  ['bg-repeat', { 'background-repeat': 'repeat' }],
  ['bg-no-repeat', { 'background-repeat': 'no-repeat' }],
  ['bg-repeat-x', { 'background-position': 'repeat-x' }],
  ['bg-repeat-y', { 'background-position': 'repeat-y' }],
  ['bg-repeat-round', { 'background-position': 'round' }],
  ['bg-repeat-space', { 'background-position': 'space' }],
]

export const bgSizes: Rule[] = [
  ['bg-auto', { 'background-size': 'auto' }],
  ['bg-cover', { 'background-repeat': 'cover' }],
  ['bg-contain', { 'background-position': 'contain' }],
]
