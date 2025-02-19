import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'

export function important(option: PresetWind4Options['important']): Postprocessor[] {
  if (option == null || option === false)
    return []

  const wrapWithIs = (selector: string) => {
    if (selector.startsWith(':is(') && selector.endsWith(')'))
      return selector

    // handle pseudo
    if (selector.includes('::'))
      return selector.replace(/(.*?)((?:\s\*)?::.*)/, ':is($1)$2')

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
