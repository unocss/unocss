import type { CSSColorValue, Rule, RuleContext } from '@unocss/core'
import { colorOpacityToString, colorToString, globalKeywords, handler as h, makeGlobalStaticRules, parseColor, positionMap } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

function bgGradientToValue(cssColor: CSSColorValue | undefined) {
  if (cssColor)
    return colorToString(cssColor, 0)

  return 'rgba(255,255,255,0)'
}

function bgGradientColorValue(mode: string, cssColor: CSSColorValue | undefined, color: string, alpha: any) {
  if (cssColor) {
    if (alpha != null)
      return colorToString(cssColor, alpha)
    else
      return colorToString(cssColor, `var(--un-${mode}-opacity, ${colorOpacityToString(cssColor)})`)
  }

  return colorToString(color, alpha)
}

function bgGradientColorResolver() {
  return ([, mode, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColor(body, theme)

    if (!data)
      return

    const { alpha, color, cssColor } = data

    if (!color)
      return

    const colorString = bgGradientColorValue(mode, cssColor, color, alpha)

    switch (mode) {
      case 'from':
        return {
          '--un-gradient-from-position': '0%',
          '--un-gradient-from': `${colorString} var(--un-gradient-from-position)`,
          '--un-gradient-to': `${bgGradientToValue(cssColor)} var(--un-gradient-to-position)`,
          '--un-gradient-stops': 'var(--un-gradient-from), var(--un-gradient-to)',
        }
      case 'via':
        return {
          '--un-gradient-via-position': '50%',
          '--un-gradient-to': bgGradientToValue(cssColor),
          '--un-gradient-stops': `var(--un-gradient-from), ${colorString} var(--un-gradient-via-position), var(--un-gradient-to)`,
        }
      case 'to':
        return {
          '--un-gradient-to-position': '100%',
          '--un-gradient-to': `${colorString} var(--un-gradient-to-position)`,
        }
    }
  }
}

function bgGradientPositionResolver() {
  return ([, mode, body]: string[]) => {
    return {
      [`--un-gradient-${mode}-position`]: `${Number(h.bracket.cssvar.percent(body)) * 100}%`,
    }
  }
}

const bgUrlRE = /^\[url\(.+\)\]$/
const bgLengthRE = /^\[length:.+\]$/
const bgPositionRE = /^\[position:.+\]$/
export const backgroundStyles: Rule[] = [
  [/^bg-(.+)$/, ([, d]) => {
    if (bgUrlRE.test(d))
      return { '--un-url': h.bracket(d), 'background-image': 'var(--un-url)' }
    if (bgLengthRE.test(d) && h.bracketOfLength(d) != null)
      return { 'background-size': h.bracketOfLength(d)!.split(' ').map(e => h.fraction.auto.px.cssvar(e)).join(' ') }
    if (bgPositionRE.test(d) && h.bracketOfPosition(d) != null)
      return { 'background-position': h.bracketOfPosition(d)!.split(' ').map(e => h.position.fraction.auto.px.cssvar(e)).join(' ') }
  }],

  // gradients
  [/^bg-gradient-(.+)$/, ([, d]) => ({ '--un-gradient': h.bracket(d) }), {
    autocomplete: ['bg-gradient', 'bg-gradient-(from|to|via)', 'bg-gradient-(from|to|via)-$colors', 'bg-gradient-(from|to|via)-(op|opacity)', 'bg-gradient-(from|to|via)-(op|opacity)-<percent>'],
  }],
  [/^(?:bg-gradient-)?stops-(\[.+\])$/, ([, s]) => ({ '--un-gradient-stops': h.bracket(s) })],
  [/^(?:bg-gradient-)?(from|via|to)-(.+)$/, bgGradientColorResolver()],
  [/^(?:bg-gradient-)?(from|via|to)-op(?:acity)?-?(.+)$/, ([, position, opacity]) => ({ [`--un-${position}-opacity`]: h.bracket.percent(opacity) })],
  [/^(from|via|to)-([\d\.]+)%$/, bgGradientPositionResolver()],
  // images
  [/^bg-gradient-((?:repeating-)?(?:linear|radial|conic))$/, ([, s]) => ({
    'background-image': `${s}-gradient(var(--un-gradient, var(--un-gradient-stops, rgba(255, 255, 255, 0))))`,
  }), { autocomplete: ['bg-gradient-repeating', 'bg-gradient-(linear|radial|conic)', 'bg-gradient-repeating-(linear|radial|conic)'] }],
  // ignore any center position
  [/^bg-gradient-to-([rltb]{1,2})$/, ([, d]) => {
    if (d in positionMap) {
      return {
        '--un-gradient-shape': `to ${positionMap[d]}`,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
        'background-image': 'linear-gradient(var(--un-gradient))',
      }
    }
  }, { autocomplete: `bg-gradient-to-(${Object.keys(positionMap).filter(k => k.length <= 2 && Array.from(k).every(c => 'rltb'.includes(c))).join('|')})` }],
  [/^(?:bg-gradient-)?shape-(.+)$/, ([, d]) => {
    const v = d in positionMap ? `to ${positionMap[d]}` : h.bracket(d)
    if (v != null) {
      return {
        '--un-gradient-shape': v,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
      }
    }
  }, { autocomplete: ['bg-gradient-shape', `bg-gradient-shape-(${Object.keys(positionMap).join('|')})`, `shape-(${Object.keys(positionMap).join('|')})`] }],
  ['bg-none', { 'background-image': 'none' }],
  [/box-decoration-(slice|clone)/, ([, body]) => ({
    'box-decoration-break': body,
  })],
  ...makeGlobalStaticRules('box-decoration', 'box-decoration-break'),

  // size
  [/bg-(auto|cover|contain)/, ([, body]) => ({ 'background-size': body })],

  // attachments
  [/bg-(fixed|local|scroll)/, ([, body]) => ({ 'background-attachment': body })],

  // clips
  [/bg-clip-(border|content|padding|text)/, ([, body]) => {
    const value = body === 'text' ? 'text' : `${body}-box`
    return {
      '-webkit-background-clip': value,
      'background-clip': value,
    }
  }],
  ...globalKeywords.map(keyword => [`bg-clip-${keyword}`, {
    '-webkit-background-clip': keyword,
    'background-clip': keyword,
  }] as Rule),

  // positions
  // skip 1 & 2 letters shortcut
  [/^bg-([-\w]{3,})$/, ([, s]) => ({ 'background-position': positionMap[s] })],

  // repeats
  [/bg-((no-)?repeat)/, ([_, body]) => ({ 'background-repeat': body })],
  [/bg-repeat-(x|y)/, ([_, body]) => ({ 'background-repeat': `repeat-${body}` })],
  [/bg-repeat-(round|space)/, ([_, body]) => ({ 'background-repeat': body })],
  ...makeGlobalStaticRules('bg-repeat', 'background-repeat'),

  // origins
  [/bg-origin-(border|padding|content)/, ([, body]) => ({ 'background-origin': `${body}-box` })],
  ...makeGlobalStaticRules('bg-origin', 'background-origin'),
]
