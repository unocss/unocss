import type { Postprocessor } from '@unocss/core'

function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function hyphenate(str: string) {
  return str.replace(/(?:^|\B)([A-Z])/g, '-$1').toLowerCase()
}
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

export function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
}
