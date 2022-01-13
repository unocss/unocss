import type { Postprocessor } from '@unocss/core'
import { capitalize } from '@unocss/preset-mini/utils'

const camelize = (str: string) => str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
const hyphenate = (str: string) => str.replace(/(?:^|\B)([A-Z])/g, '-$1').toLowerCase()
const prefixes = ['Webkit', 'Moz', 'ms']

export function autoPrefixer(style: CSSStyleDeclaration): Postprocessor {
  const prefixCache: Record<string, string> = {}

  function autoPrefix(rawName: string): string {
    const cached = prefixCache[rawName]
    if (cached)
      return cached
    let name = camelize(rawName)
    if (name !== 'filter' && name in style)
      return (prefixCache[rawName] = hyphenate(name))
    name = capitalize(name)
    for (let i = 0; i < prefixes.length; i++) {
      const prefixed = `${prefixes[i]}${name}`
      if (prefixed in style)
        return (prefixCache[rawName] = hyphenate(capitalize(prefixed)))
    }
    return rawName
  }

  return ({ entries }) => entries.forEach((e) => {
    if (!e[0].startsWith('--'))
      e[0] = autoPrefix(e[0])
  })
}
