import type MagicString from 'magic-string'
import type { HighlightAnnotation } from '../types'
import { notNull } from '../utils'

const regexCache: Record<string, RegExp> = {}

export function makeRegexClassGroup(separators = ['-', ':']) {
  const key = separators.join('|')
  if (!regexCache[key])
    regexCache[key] = new RegExp(`((?:[!@<~\\w+:_-]|\\[&?>?:?\\S*\\])+?)(${key})\\(((?:[~!<>\\w\\s:/\\\\,%#.$?-]|\\[[^\\]]*?\\])+?)\\)(?!\\s*?=>)`, 'gm')
  regexCache[key].lastIndex = 0
  return regexCache[key]
}

interface VariantGroup {
  length: number
  items: HighlightAnnotation[]
}

export function parseVariantGroup(str: string | MagicString, separators = ['-', ':'], depth = 5) {
  const regexClassGroup = makeRegexClassGroup(separators)
  let hasChanged
  let content = str.toString()
  const prefixes = new Set<string>()
  const groupsByOffset = new Map<number, VariantGroup>()

  do {
    hasChanged = false
    content = content.replace(
      regexClassGroup,
      (from, pre: string, sep: string, body: string, groupOffset: number) => {
        if (!separators.includes(sep))
          return from

        hasChanged = true
        prefixes.add(pre + sep)
        const bodyOffset = groupOffset + pre.length + sep.length + 1
        const group: VariantGroup = { length: from.length, items: [] }
        groupsByOffset.set(groupOffset, group)

        for (const itemMatch of [...body.matchAll(/\S+/g)]) {
          const itemOffset = bodyOffset + itemMatch.index!
          let innerItems = groupsByOffset.get(itemOffset)?.items
          if (innerItems) {
            // We won't need to look up this group from this offset again.
            // It gets added to the current group below.
            groupsByOffset.delete(itemOffset)
          }
          else {
            innerItems = [{
              offset: itemOffset,
              length: itemMatch[0].length,
              className: itemMatch[0],
            }]
          }
          for (const item of innerItems) {
            item.className = item.className === '~'
              ? pre
              : item.className.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)
            group.items.push(item)
          }
        }
        // The replacement string just needs to be the same length (so it doesn't mess up offsets)
        // and not contain any grouping/separator characters (so any outer groups will match on
        // the next pass). The final value of `content` won't be used; we construct the final result
        // below using groupsByOffset.
        return '$'.repeat(from.length)
      },
    )
    depth -= 1
  } while (hasChanged && depth)

  let expanded: MagicString | string

  if (typeof str === 'string') {
    expanded = ''
    let prevOffset = 0
    for (const [offset, group] of groupsByOffset) {
      expanded += str.slice(prevOffset, offset)
      expanded += group.items.map(item => item.className).join(' ')
      prevOffset = offset + group.length
    }
    expanded += str.slice(prevOffset)
  }
  else {
    expanded = str
    for (const [offset, group] of groupsByOffset) {
      expanded.overwrite(
        offset,
        offset + group.length,
        group.items.map(item => item.className).join(' '),
      )
    }
  }

  return {
    prefixes: Array.from(prefixes),
    hasChanged,
    groupsByOffset,
    // Computed lazily because MagicString's toString does a lot of work
    get expanded() { return expanded.toString() },
  }
}

export function collapseVariantGroup(str: string, prefixes: string[]): string {
  const collection = new Map<string, string[]>()

  const sortedPrefix = prefixes.sort((a, b) => b.length - a.length)

  return str
    .split(/\s+/g)
    .map((part) => {
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
  const res = parseVariantGroup(str, separators, depth)
  return typeof str === 'string'
    ? res.expanded
    : str
}
