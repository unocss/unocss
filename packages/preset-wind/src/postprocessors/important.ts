import type { Postprocessor } from '@unocss/core'
import type { PresetWindOptions } from '..'

export function important(option: PresetWindOptions['important']): Postprocessor[] {
  if (option == null || option === false)
    return []

  const wrapWithIs = (selector: string) => {
    if (selector.startsWith(':is(') && selector.endsWith(')'))
      return selector

    // handle pseudo
    if (selector.includes('::'))
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      return selector.replace(/(.*?)(\s*::.*)/, ':is($1)$2')

    return `:is(${selector})`
  }

  return [
    option === true
      ? (util) => {
          util.entries.forEach((i) => {
            if (i[1] != null && !String(i[1]).endsWith('!important'))
              i[1] += ' !important'
          })
        }
      : (util) => {
          if (!util.selector.startsWith(option))
            util.selector = `${option} ${wrapWithIs(util.selector)}`
        },
  ]
}
