import type MagicString from 'magic-string'

const regexCache: Record<string, RegExp> = {}

export function makeRegexClassGroup(separators = ['-', ':']) {
  const key = separators.join('|')
  if (!regexCache[key])
    regexCache[key] = new RegExp(`((?:[!@\\w+:_/-]|\\[&?>?:?.*\\])+?)(${key})\\(((?:[~!\\w\\s:/\\\\,%#.$?-]|\\[.*?\\])+?)\\)(?!\\s*?=>)`, 'gm')
  regexCache[key].lastIndex = 0
  return regexCache[key]
}

export function expandVariantGroup(str: string, separators?: string[], depth?: number): string
export function expandVariantGroup(str: MagicString, separators?: string[], depth?: number): MagicString
export function expandVariantGroup(str: string | MagicString, separators = ['-', ':'], depth = 5) {
  const regexClassGroup = makeRegexClassGroup(separators)
  let hasChanged = false
  let content = str.toString()
  do {
    const before = content
    content = content.replace(
      regexClassGroup,
      (from, pre, sep, body: string) => {
        if (!separators.includes(sep))
          return from
        return body
          .split(/\s/g)
          .filter(Boolean)
          .map(i => i === '~' ? pre : i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`))
          .join(' ')
      },
    )
    hasChanged = content !== before
    depth -= 1
  } while (hasChanged && depth)

  if (typeof str === 'string') {
    return content
  }
  else {
    return str.length()
      ? str.overwrite(0, str.length(), content)
      : str
  }
}
