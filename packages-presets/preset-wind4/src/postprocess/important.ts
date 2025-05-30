import type { Postprocessor } from '@unocss/core'
import type { PresetWind4Options } from '..'

export function important({ important: option }: PresetWind4Options): Postprocessor[] {
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
          // If the util is a property layer, we should not add `!important` to it
          if (util.layer === 'properties')
            return

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
