import type { AutocompleteTemplatePart, ParsedAutocompleteTemplate } from './types'

const shorthands = {
  '#num': `(${[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 24, 36].join('|')})`,
}

export function parseAutocomplete(template: string, theme: any = {}): ParsedAutocompleteTemplate {
  const parts: AutocompleteTemplatePart[] = []

  template = Object.entries(shorthands)
    .reduce((a, b) => template.replace(b[0], b[1]), template)

  function handleNonGroup(str: string) {
    let lastIndex = 0
    Array.from(str.matchAll(/\$(\w+)(:[\w:]+)?/g))
      .forEach((m) => {
        const key = m[1]
        // const attrs = m[2]?.split(':').filter(Boolean) || []
        const index = m.index!
        if (lastIndex !== index) {
          parts.push({
            type: 'static',
            value: template.slice(lastIndex, index),
          })
        }
        if (key in theme) {
          parts.push({
            type: 'deepgroup',
            value: theme[key],
          })
        }
        lastIndex = index + m[0].length
      })

    if (lastIndex !== str.length) {
      parts.push({
        type: 'static',
        value: str.slice(lastIndex),
      })
    }
  }

  let lastIndex = 0
  Array.from(template.matchAll(/\((.*?)\)/g))
    .forEach((m) => {
      const index = m.index!
      if (lastIndex !== index)
        handleNonGroup(template.slice(lastIndex, index))
      parts.push({
        type: 'group',
        values: m[1].split('|').sort((a, b) => b.length - a.length),
      })
      lastIndex = index + m[0].length
    })

  if (lastIndex !== template.length)
    handleNonGroup(template.slice(lastIndex))

  function suggest(input: string, listAll = false) {
    let rest = input
    let matched = ''
    let combinations: string[] = []
    const tempParts = [...parts]

    while (tempParts.length) {
      const part = tempParts.shift()!
      if (part.type === 'static') {
        if (!rest.startsWith(part.value))
          break
        matched += part.value
        rest = rest.slice(part.value.length)
      }
      else if (part.type === 'group') {
        const fullMatched = part.values.find(i => i && rest.startsWith(i))
        if (fullMatched != null) {
          matched += fullMatched
          rest = rest.slice(fullMatched.length)
        }
        else {
          combinations = part.values.filter(i => i.startsWith(rest))
          break
        }
      }
      else if (part.type === 'deepgroup') {
        const fullMatched = Object.keys(part.value).find(i => i && rest.startsWith(i))
        if (fullMatched != null) {
          matched += fullMatched
          rest = rest.slice(fullMatched.length)
          const sub = part.value[fullMatched]
          if (typeof sub === 'object' && sub !== null) {
            tempParts.unshift({
              type: 'static',
              value: '-',
            }, {
              type: 'deepgroup',
              value: sub as Record<string, unknown>,
            })
          }
        }
        else {
          combinations = Object.keys(part.value).filter(i => i.startsWith(rest))
          break
        }
      }
    }

    if (!matched)
      return []

    if (combinations.length === 0)
      combinations.push('')

    if (listAll && tempParts.length) {
      for (const part of tempParts) {
        if (part.type === 'static') {
          combinations = combinations.map(i => i + part.value)
        }
        else if (part.type === 'group') {
          combinations = part.values.flatMap(i => combinations.map(r => r + i))
        }
        else if (part.type === 'deepgroup') {
          const resolve = (sub: Record<string, unknown>): string[] => {
            const res = []
            for (const key in sub) {
              const value = sub[key]
              if (value === null || value === undefined) continue
              if (typeof value === 'object')
                res.push(...resolve(value as Record<string, unknown>).map(r => `${key}-${r}`))
              else
                res.push(key)
            }
            return res
          }
          combinations = combinations.flatMap(i => resolve(part.value).map(r => i + r))
        }
      }
    }

    return combinations.map(i => matched + i)
      .filter(i => i.length >= input.length)
  }

  return {
    parts,
    suggest,
  }
}
