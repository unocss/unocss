import { MiniwindRule } from '../../../types'

const transitionProps = ['background-color', 'border-color', 'color', 'fill', 'stroke', 'opacity', 'box-shadow', 'transform', 'filter', 'backdrop-filter']
const transitionPropsStr = transitionProps.join(', ')

export const transitions: MiniwindRule[] = [
  [/^transition(?:-([a-z-]+))?(?:-(\d+))?$/, ([, prop, duration = '150']) => {
    if (prop && !transitionProps.includes(prop))
      return

    return {
      'transition-property': prop || transitionPropsStr,
      'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'transition-duration': `${duration}ms`,
    }
  }],
]
