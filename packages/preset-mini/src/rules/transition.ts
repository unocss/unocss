import type { Rule } from '@unocss/core'
import { cssProps } from './static'

const transitionSwitchProps = ['all', 'none']
const transitionPropsStr = cssProps.join(', ')

const validateProperty = (prop: string): string | undefined => {
  if (prop && ![...cssProps, ...transitionSwitchProps].includes(prop))
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
  ['ease-linear', { 'transition-timing-function': 'linear' }],
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
