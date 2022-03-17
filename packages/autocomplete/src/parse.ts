import type { AutocompleteTemplatePart, ParsedAutocompleteTemplate } from './types'

export const shorthands: Record<string, string> = {
  num: `(${[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 24, 36].join('|')})`,
  percent: `(${Array.from({ length: 11 }, (_, i) => i * 10).join('|')})`,
  directions: '(x|y|t|b|l|r|s|e)',
}

export const ignoredThemeKeys = ['DEFAULT']

function handleRegexMatch(
  str: string,
  regex: RegExp,
  onMatched: (match: RegExpMatchArray) => void,
  onNotMatched: (str: string, start: number, end: number) => void,
) {
  let lastIndex = 0
  Array.from(str.matchAll(regex))
    .forEach((m) => {
      const index = m.index!
      if (lastIndex !== index)
        onNotMatched(str.slice(lastIndex, index), lastIndex, index)
      onMatched(m)
      lastIndex = index + m[0].length
    })

  if (lastIndex !== str.length)
    onNotMatched(str.slice(lastIndex), lastIndex, str.length)
}

export function parseAutocomplete(template: string, theme: any = {}): ParsedAutocompleteTemplate {
  const parts: AutocompleteTemplatePart[] = []

  template = template.replace(/<(\w+)>/g, (_, key) => {
    if (!shorthands[key])
      throw new Error(`Unknown template shorthand: ${key}`)
    return shorthands[key]
  })

  handleGroups(template)

  return {
    parts,
    suggest,
  }

  function handleNonGroup(input: string) {
    handleRegexMatch(
      input,
      /\$([\w\|]+)/g,
      (m) => {
        parts.push({
          type: 'theme',
          objects: m[1].split('|').map((i) => {
            if (!i || !theme[i])
              throw new Error(`Invalid theme key ${i}`)
            return theme[i]
          }),
        })
      },
      (str) => {
        parts.push({
          type: 'static',
          value: str,
        })
      },
    )
  }

  function handleGroups(input: string) {
    handleRegexMatch(
      input,
      /\((.*?)\)/g,
      (m) => {
        parts.push({
          type: 'group',
          values: m[1].split('|').sort((a, b) => b.length - a.length),
        })
      },
      (str) => {
        handleNonGroup(str)
      },
    )
  }

  function suggest(input: string) {
    let rest = input
    let matched = ''
    let combinations: string[] = []
    const tempParts = [...parts]

    while (tempParts.length) {
      const part = tempParts.shift()!
      if (part.type === 'static') {
        if (combinations.length)
          combinations = combinations.map(i => i + part.value)
        if (part.value.startsWith(rest) && part.value !== rest && !combinations.length) {
          combinations = [part.value]
          break
        }
        else if (!rest.startsWith(part.value)) {
          break
        }
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
          if (tempParts[0]?.type !== 'static')
            break
        }
      }
      else if (part.type === 'theme') {
        const keys = part.objects.flatMap(i => Object.keys(i))
          .filter(i => i && !ignoredThemeKeys.includes(i) && i[0] !== '_')
        const fullMatched = keys.find(i => i && rest.startsWith(i))
        if (fullMatched != null) {
          matched += fullMatched
          rest = rest.slice(fullMatched.length)
          const subObjects = part.objects.map(i => i[fullMatched])
            .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')

          if (subObjects.length) {
            tempParts.unshift({
              type: 'static',
              value: '-',
            }, {
              type: 'theme',
              objects: subObjects,
            })
          }
        }
        else {
          combinations = keys.filter(i => i.startsWith(rest))
          if (tempParts[0]?.type !== 'static')
            break
        }
      }
    }

    if (combinations.length === 0)
      combinations.push('')

    // if (listAll && tempParts.length) {
    //   for (const part of tempParts) {
    //     if (part.type === 'static') {
    //       combinations = combinations.map(i => i + part.value)
    //     }
    //     else if (part.type === 'group') {
    //       combinations = part.values.flatMap(i => combinations.map(r => r + i))
    //     }
    //     else if (part.type === 'theme') {
    //       const resolve = (sub: Record<string, unknown>): string[] => {
    //         const res = []
    //         for (const key in sub) {
    //           const value = sub[key]
    //           if (value === null || value === undefined) continue
    //           if (typeof value === 'object')
    //             res.push(...resolve(value as Record<string, unknown>).map(r => `${key}-${r}`))
    //           else
    //             res.push(key)
    //         }
    //         return res
    //       }
    //       combinations = combinations.flatMap(i => resolve(part.value).map(r => i + r))
    //     }
    //   }
    // }

    return combinations.map(i => matched + i)
      .filter(i => i.length >= input.length)
  }
}
