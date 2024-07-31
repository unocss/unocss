import { uniq } from '@unocss/core'
import { Fzf } from 'fzf'
import type { AutoCompleteMatchType, AutocompleteTemplateGroup, AutocompleteTemplatePart, ParsedAutocompleteTemplate } from './types'
import { cartesian } from './utils'

export const shorthands: Record<string, string> = {
  directions: '(x|y|t|b|l|r|s|e)',
  num: `(${[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 24, 36].join('|')})`,
  percent: `(${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].join('|')})`,
  percentage: `(${['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'].join('|')})`,
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

export function parseAutocomplete(template: string, theme: any = {}, extraShorthands: Record<string, string> = {}): ParsedAutocompleteTemplate {
  const parts: AutocompleteTemplatePart[] = []

  const newShorthands = {
    ...shorthands,
    ...extraShorthands,
  }

  template = template.replace(/<(\w+)>/g, (_, key) => {
    if (!newShorthands[key])
      throw new Error(`Unknown template shorthand: ${key}`)
    return newShorthands[key]
  })

  handleGroups(template)

  const fzf = new Fzf(getAllCombination(parts))

  return {
    parts,
    suggest,
  }

  function handleNonGroup(input: string) {
    handleRegexMatch(
      input,
      /\$([\w.|]+)/g,
      (m) => {
        parts.push({
          type: 'theme',
          objects: m[1].split('|').map((i) => {
            return i.split('.').reduce((v, k) => {
              if (!k || !v[k])
                throw new Error(`Invalid theme key ${k}`)
              return v[k]
            }, theme)
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
          values: m[1].split('|'),
        })
      },
      (str) => {
        handleNonGroup(str)
      },
    )
  }

  function suggest(input: string, matchType: AutoCompleteMatchType = 'prefix') {
    if (input.length > 1 && matchType === 'fuzzy')
      return fzf.find(input).map(i => i.item)
    let rest = input.replace(/-/g, '')
    let matched: string[] = ['']
    let combinations: string[] = ['']
    const tempParts = [...parts]

    while (tempParts.length) {
      const part = tempParts.shift()!
      if (part.type === 'static') {
        const temp = part.value.replace(/-/g, '')
        if (!rest.startsWith(temp) && !part.value.startsWith(rest))
          return ['']
        matched = matched.map(m => m + part.value)
        rest = rest.slice(temp.length)
      }
      else if (part.type === 'group') {
        const fullMatched = part.values.find(i => i && rest.startsWith(i))
        if (fullMatched) {
          matched = matched.map(m => m + fullMatched)
          rest = rest.slice(fullMatched.length)
          if (!tempParts[0] && rest)
            return []
          continue
        }
        else {
          if (tempParts[0]) {
            const values = part.values.filter(i => i && i.startsWith(rest))
            rest = ''
            if (values.length) {
              matched = matched.map(m => values.map(n => m + n)).flat()
              continue
            }
            break
          }
          if (matched[0] === '')
            break
          combinations = part.values.filter(p => p.startsWith(rest))
          break
        }
      }
      else if (part.type === 'theme') {
        const keys = part.objects.flatMap(i => Object.keys(i))
          .filter(i => i && !ignoredThemeKeys.includes(i) && i[0] !== '_')
        const fullMatched = keys.find(i => i && rest.startsWith(i))
        if (fullMatched != null) {
          rest = rest.slice(fullMatched.length)
          const subObjects = part.objects.map(i => i[fullMatched])
            .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')

          if (subObjects.length) {
            matched = matched.map(m => `${m + fullMatched}-`)
            tempParts.unshift({
              type: 'theme',
              objects: subObjects,
            })
          }
          else {
            combinations = keys.filter(i => i.startsWith(rest))
          }
        }
        else {
          if (tempParts[0] && tempParts[0].type !== 'static') {
            const values = (tempParts[0] as AutocompleteTemplateGroup).values
            if (values)
              matched = matched.filter(i => i && rest.startsWith(i)).map(m => values.map(n => m + n)).flat()
          }
          else {
            combinations = keys.filter(i => i.startsWith(rest))
          }
          break
        }
      }
    }

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

    return combinations.map(i => matched.map(m => m + i)).flat()
      .filter(i => i.length >= input.length)
  }
}

function getValuesFromPartTemplate(part: AutocompleteTemplatePart): string[] {
  if (part.type === 'static')
    return [part.value]
  if (part.type === 'theme') {
    return part.objects.flatMap((i) => {
      const keys = Object.keys(i).filter(i => i && i[0] !== '_')
      for (const key in i) {
        const value = i[key]
        if (value === null || value === undefined)
          continue
        if (typeof value === 'object' && !Array.isArray(value)) {
          const subKeys = getValuesFromPartTemplate({
            type: 'theme',
            objects: [value as Record<string, unknown>],
          }).map(i => `${key}-${i}`)

          keys.push(...subKeys)
        }
      }
      return keys
    })
  }
  if (part.type === 'group')
    return [...part.values]
  return []
}

function getAllCombination(parts: AutocompleteTemplatePart[]) {
  const values = parts.map(i => getValuesFromPartTemplate(i))
  const list = uniq(cartesian(values).flatMap(i => i.join('').replace('-DEFAULT', '')))
  return list
}
