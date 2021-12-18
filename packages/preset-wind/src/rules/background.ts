import type { Rule, RuleContext } from '@unocss/core'
import { createColorOpacityRule, createKeywordRules, handler as h, parseColor } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

const colorResolver = (mode: 'from' | 'to' | 'via') =>
  ([, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColor(body, theme)

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

const bgGradientDirections: Record<string, string> = {
  t: 'top',
  tr: 'top right',
  r: 'right',
  br: 'bottom right',
  b: 'bottom',
  bl: 'bottom left',
  l: 'left',
  tl: 'top left',
}

export const backgroundStyles: Rule[] = [
  // attachments
  ...createKeywordRules('bg', 'background-attachment', [
    'fixed',
    'local',
    'scroll',
  ]),

  // blends
  ...createKeywordRules('bg-blend', 'background-blend-mode', [
    'color',
    'color-burn',
    'color-dodge',
    'darken',
    'difference',
    'exclusion',
    'hard-light',
    'hue',
    'lighten',
    'luminosity',
    'multiply',
    'overlay',
    'saturation',
    'screen',
    'soft-light',
  ]),
  ['bg-blend-normal', { 'background-blend-mode': 'normal' }],

  // clips
  ...createKeywordRules('bg-clip', ['-webkit-background-clip', 'background-attachment'], [
    'text',
    ['border', 'border-box'],
    ['content', 'content-box'],
    ['padding', 'padding-box'],
  ]),

  // gradients
  [/^from-(.+)$/, colorResolver('from')],
  [/^to-(.+)$/, colorResolver('to')],
  [/^via-(.+)$/, colorResolver('via')],
  createColorOpacityRule('from'),
  createColorOpacityRule('to'),
  createColorOpacityRule('via'),

  // images
  [/^bg-gradient-to-([trbl]{1,2})$/, ([, d]) => {
    const v = bgGradientDirections[d]
    if (v)
      return { 'background-image': `linear-gradient(to ${v}, var(--un-gradient-stops))` }
  }],
  ['bg-none', { 'background-image': 'none' }],

  // origins
  ...createKeywordRules('bg-origin', 'background-origin', [
    ['border', 'border-box'],
    ['content', 'content-box'],
    ['padding', 'padding-box'],
  ]),

  // positions
  ...createKeywordRules('bg', 'background-position', [
    'bottom',
    'center',
    'left',
    'right',
    'top',
    ['left-bottom', 'left bottom'],
    ['left-top', 'left top'],
    ['right-bottom', 'right bottom'],
    ['right-top', 'right top'],
  ]),

  // repeats
  ...createKeywordRules('bg', 'background-repeat', [
    'repeat',
    'no-repeat',
  ]),
  ...createKeywordRules('bg-repeat', 'background-position', [
    'round',
    'space',
    ['x', 'repeat-x'],
    ['y', 'repeat-y'],
  ]),

  // size
  ...createKeywordRules('bg', 'background-size', [
    'auto',
    'cover',
    'contain',
  ]),
]
