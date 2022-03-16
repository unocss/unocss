import type { AutocompleteTemplatePart, ParsedAutocompleteTemplate } from './types'

export function parseAutocomplete(template: string): ParsedAutocompleteTemplate {
  const parts: AutocompleteTemplatePart[] = []

  let lastIndex = 0
  Array.from(template.matchAll(/\((.*?)\)/g))
    .forEach((m) => {
      const index = m.index!
      if (lastIndex !== index) {
        parts.push({
          type: 'static',
          value: template.slice(lastIndex, index),
        })
      }
      parts.push({
        type: 'group',
        values: m[1].split('|').sort((a, b) => b.length - a.length),
      })
      lastIndex = index + m[0].length
    })

  if (lastIndex !== template.length) {
    parts.push({
      type: 'static',
      value: template.slice(lastIndex),
    })
  }

  function suggest(input: string) {
    let rest = input
    let matched = ''
    let combinations: string[] = []

    let idx = 0
    for (idx = 0; idx < parts.length; idx++) {
      const part = parts[idx]
      if (part.type === 'static') {
        if (!rest.startsWith(part.value))
          break
        matched += part.value
        rest = rest.slice(part.value.length)
      }
      else if (part.type === 'group') {
        const fullMatched = part.values.find(i => rest.startsWith(i))
        if (fullMatched) {
          matched += fullMatched
          rest = rest.slice(fullMatched.length)
        }
        else {
          combinations = part.values.filter(i => i.startsWith(rest))
          break
        }
      }
    }

    if (!matched)
      return []

    if (combinations.length === 0)
      combinations.push('')

    if (idx + 1 < parts.length) {
      const rest = parts.slice(idx + 1)
      for (const part of rest) {
        if (part.type === 'static')
          combinations = combinations.map(i => i + part.value)
        else if (part.type === 'group')
          combinations = part.values.flatMap(i => combinations.map(r => r + i))
      }
    }

    return combinations.map(i => matched + i)
  }

  return {
    parts,
    suggest,
  }
}
