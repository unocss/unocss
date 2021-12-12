import type { Rule } from '@unocss/core'

const transitionBasicProps = [
  'color', 'border-color', 'background-color', 'flex-grow', 'flex', 'flex-shrink',
  'caret-color', 'font', 'gap', 'opacity', 'visibility', 'z-index', 'font-weight',
  'zoom', 'text-shadow', 'transform', 'box-shadow',
]
const transitionPositionProps = [
  'backround-position', 'left', 'right', 'top', 'bottom', 'object-position',
]
const transitionSizeProps = [
  'max-height', 'min-height', 'max-width', 'min-width', 'height', 'width',
  'border-width', 'margin', 'padding', 'outline-width', 'outline-offset',
  'font-size', 'line-height', 'text-indent', 'vertical-align',
  'border-spacing', 'letter-spacing', 'word-spacing',
]
const transitionSwitchProps = ['all', 'none']
const transitionEnhanceProps = ['stroke', 'filter', 'backdrop-filter', 'fill', 'mask', 'mask-size', 'mask-border', 'clip-path', 'clip']
const transitionProps = [
  ...transitionBasicProps,
  ...transitionPositionProps,
  ...transitionSizeProps,
  ...transitionEnhanceProps,
]
// Not all, but covers most high frequency attributes
const transitionPropsStr = transitionProps.join(', ')

const validateProperty = (prop: string): string | undefined => {
  if (prop && ![...transitionProps, ...transitionSwitchProps].includes(prop))
    return

  return prop || transitionPropsStr
}

export const transitions: Rule[] = [
  [/^transition(?:-([a-z-]+))?(?:-(\d+))?$/, ([, prop, duration = '150']) => {
    const transitionProperty = validateProperty(prop)
    if (!transitionProperty)
      return

    return {
      'transition-property': transitionProperty,
      'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'transition-duration': `${duration}ms`,
    }
  }],
  [/^duration-(\d+)$/, ([, duration = '150']) => {
    return {
      'transition-duration': `${duration}ms`,
    }
  }],
  ['ease', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],
  ['ease-in', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 1, 1)' }],
  ['ease-out', { 'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)' }],
  ['ease-in-out', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],
  [/^transition-delay-(\d+)$/, ([, v]) => ({ 'transition-delay': `${v}ms` })],
  [/^transition-duration-(\d+)$/, ([, v]) => ({ 'transition-duration': `${v}ms` })],
  // TODO： Support the writing of '[prop, prop]' by supporting more symbols through the parser
  [/^(?:transition-)?property-([a-z-]+)$/, ([, v]) => {
    const transitionProperty = validateProperty(v)
    if (transitionProperty)
      return ({ 'transition-property': transitionProperty })
  }],
]
