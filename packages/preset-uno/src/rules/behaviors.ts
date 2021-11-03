import { Rule } from '@unocss/core'
import { handler as h } from '../utils'
import { colorResolver } from './color'

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

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance-none': 'none',
  }],
]

// These are abbreviations
const unMatchedAbbreviation = {
  'w': 'with',
  'h': 'height',
  'max-w': 'max-width',
  'max-h': 'max-height',
  'padding-x': 'padding-left',
  'padding-y': 'padding-top',
  'margin-x': 'margin-left',
  'margin-y': 'margin-top',
  'visible': 'visibility',
  'select': 'user-select',
  'vertical': 'vertical-align',
  'backface': 'backface-visibility',
  'whitespace': 'white-space',
  'break': 'word-break',
  'case': 'text-transform',
  'write': 'writing-mode',
  'write-orient': 'text-orientation',
  'origin': 'transform-origin',
  'bg': 'background-color',
  'bg-blend': 'background-blend-mode',
  'bg-clip': '-webkit-background-clip',
  'bg-gradient': 'linear-gradient',
  'bg-origin-border': 'background-origin',
  'bg-position': 'background-position',
  'bg-repeat': 'background-repeat',
  'bg-size': 'background-size',
  'border-opacity': 'background-opacity',
  'tab': 'tab-size',
  'underline': 'text-decoration-thickness',
  'underline-offset': 'text-underline-offset',
  'indent': 'text-indent',
  'text': 'color',
  'grid-cols': 'grid-template-columns',
  'grid-rows': 'grid-template-rows',
  'auto-flow': 'grid-auto-flow',
  'row-start': 'grid-row-start',
  'row-end': 'grid-row-end',
  'justify': 'justify-content',
  'content': 'align-content',
  'items': 'align-items',
  'self': 'align-self',
  'object': 'object-fit',
  'mix-blend': 'mix-blend-mode',
} as const

export const variables: Rule[] = [[
  /^(.+)-\$(.+)$/, async([v]) => {
    const [prop, varName] = v.split(/-\$/)

    if (prop in unMatchedAbbreviation) {
      return {
        // @ts-expect-error
        [unMatchedAbbreviation[prop]]: `var(--${varName})`,
      }
    }
    // const data = await config.generator.parseUtil(prop)
    // To get the name of the abbreviated attribute
    // const variable = Number(data?.length) > 2 ? data![2]![0][0] : varName

    return {
      [prop]: `var(--${varName})`,
    }
  },
]]
