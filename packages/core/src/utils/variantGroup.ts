import type MagicString from 'magic-string'
import { notNull } from '../utils'

const regexCache: Record<string, RegExp> = {}

export function makeRegexClassGroup(separators = ['-', ':']) {
  const key = separators.join('|')
  if (!regexCache[key])
    regexCache[key] = new RegExp(`((?:[!@\\w+:_/-]|\\[&?>?:?\\S*\\])+?)(${key})\\(((?:[~!\\w\\s:/\\\\,%#.$?-]|\\[.*?\\])+?)\\)(?!\\s*?=>)`, 'gm')
  regexCache[key].lastIndex = 0
  return regexCache[key]
}

export function parseVariantGroup(str: string, separators = ['-', ':'], depth = 5) {
  const regexClassGroup = makeRegexClassGroup(separators)
  let hasChanged = false
  let content = str.toString()
  const prefixes = new Set<string>()

  do {
    const before = content
    content = content.replace(
      regexClassGroup,
      (from, pre, sep, body: string) => {
        if (!separators.includes(sep))
          return from

        prefixes.add(pre + sep)

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

  return {
    prefixes: Array.from(prefixes),
    expanded: content,
    hasChanged,
  }
}

export function collapseVariantGroup(str: string, prefixes: string[]): string {
  const collection = new Map<string, string[]>()

  const sortedPrefix = prefixes.sort((a, b) => b.length - a.length)

  return str.split(/\s+/g).map((part) => {
    const prefix = sortedPrefix.find(prefix => part.startsWith(prefix))
    if (!prefix)
      return part

    const body = part.slice(prefix.length)
    if (collection.has(prefix)) {
      collection.get(prefix)!.push(body)
      return null
    }
    else {
      const items = [body]
      collection.set(prefix, items)
      return {
        prefix,
        items,
      }
    }
  })
    .filter(notNull)
    .map((i) => {
      if (typeof i === 'string')
        return i
      return `${i.prefix}(${i.items.join(' ')})`
    })
    .join(' ')
}

export function expandVariantGroup(str: string, separators?: string[], depth?: number): string
export function expandVariantGroup(str: MagicString, separators?: string[], depth?: number): MagicString
export function expandVariantGroup(str: string | MagicString, separators = ['-', ':'], depth = 5) {
  const {
    expanded,
  } = parseVariantGroup(str.toString(), separators, depth)

  if (typeof str === 'string') {
    return expanded
  }
  else {
    return str.length()
      ? str.overwrite(0, str.length(), expanded)
      : str
  }
}
