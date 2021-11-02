import { hex2rgba, Rule, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'
import { extractColor } from './color'

const listStyleProps = [
  'none', 'disc', 'circle', 'square',
  'decimal', 'zero-decimal', 'greek', 'roman',
  'upper-roman', 'alpha', 'upper-alpha',
]

export const listStyle: Rule[] = [
  [new RegExp(`^list-((${listStyleProps.join('|')})(?:(-outside|-inside))?)$`), ([, value]) => {
    const style = value.split(/-outside|-inside/)[0]
    const position = /inside|outside/.exec(value) ?? []

    if (position.length) {
      return {
        'list-style-position': `${position[0]}`,
        'list-style-type': `${style}`,
      }
    }
    return {
      'list-style-type': `${style}`,
    }
  }],
  [/^list-(inside|outside)$/, ([, value]) => {
    return {
      'list-style-position': value,
    }
  }],
]

const colorResolver
  = (attribute: string, varName: string) =>
    ([, body]: string[], { theme }: RuleContext<Theme>) => {
      const data = extractColor(body)

      if (!data)
        return

      const { opacity, name, no, color } = data

      if (!name)
        return

      let useColor = color

      if (!color) {
        if (name === 'transparent') {
          return {
            [attribute]: 'transparent',
          }
        }
        else if (name === 'current') {
          return {
            [attribute]: 'currentColor',
          }
        }
        useColor = theme.colors?.[name]
        if (no && useColor && typeof useColor !== 'string')
          useColor = useColor[no]
      }

      if (typeof useColor !== 'string')
        return

      const rgba = hex2rgba(useColor)
      if (rgba) {
        const a = opacity ? opacity[0] === '[' ? h.bracket.percent(opacity)! : (parseFloat(opacity) / 100) : rgba[3]
        if (a != null && !Number.isNaN(a)) {
          // @ts-expect-error
          rgba[3] = typeof a === 'string' && !a.includes('%') ? parseFloat(a) : a
          return {
            [attribute]: `rgba(${rgba.join(',')})`,
          }
        }
        else {
          return {
            [`--un-${varName}-opacity`]: 1,
            [attribute]: `rgba(${rgba.slice(0, 3).join(',')},var(--un-${varName}-opacity))`,
          }
        }
      }
    }

export const boxDecorationBreaks: Rule[] = [
  ['decoration-slice', { 'box-decoration-break': 'slice' }],
  ['decoration-clone', { 'box-decoration-break': 'clone' }],
]

export const caretOpacity: Rule[] = [
  [/^caret-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-caret-opacity': h.bracket.percent(d) })],
]

export const caretColors: Rule[] = [
  [/^caret-(.+)$/, colorResolver('caret-color', 'caret')],
]

export const imageRenderings: Rule[] = [
  ['image-render-auto', { 'image-rendering': 'auto' }],
  ['image-render-edge', { 'image-rendering': 'crisp-edges' }],
  ['image-render-pixel', [
    ['-ms-interpolation-mode', 'nearest-neighbor'],
    ['image-rendering', '-webkit-optimize-contrast'],
    ['image-rendering', '-moz-crisp-edges'],
    ['image-rendering', '-o-pixelated'],
    ['image-rendering', 'pixelated'],
  ]],
]

export const Appearance: Rule[] = [
  ['appearance-none', [
    ['appearance', 'none'],
    ['-webkit-appearance', 'none'],
    ['-moz-appearance', 'none'],
  ]],
]
