import { isString } from '@unocss/core'

export function getComponent(str: string, open: string, close: string, separators: string | string[]) {
  if (str === '')
    return

  if (isString(separators))
    separators = [separators]

  if (separators.length === 0)
    return

  const l = str.length
  let parenthesis = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case open:
        parenthesis++
        break

      case close:
        if (--parenthesis < 0)
          return
        break

      default:
        for (const separator of separators) {
          const separatorLength = separator.length
          if (separatorLength && separator === str.slice(i, i + separatorLength) && parenthesis === 0) {
            if (i === 0 || i === l - separatorLength)
              return
            return [
              str.slice(0, i),
              str.slice(i + separatorLength),
            ]
          }
        }
    }
  }

  return [
    str,
    '',
  ]
}

export function getComponents(str: string, separators: string | string[], limit?: number) {
  limit = limit ?? 10
  const components = []
  let i = 0
  while (str !== '') {
    if (++i > limit)
      return
    const componentPair = getComponent(str, '(', ')', separators)
    if (!componentPair)
      return
    const [component, rest] = componentPair
    components.push(component)
    str = rest
  }
  if (components.length > 0)
    return components
}
