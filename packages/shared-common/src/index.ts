import type { UnoGenerator } from '@unocss/core'
import { arbitraryPropertyRE, escapeRegExp, isAttributifySelector, regexClassGroup } from '@unocss/core'
import MagicString from 'magic-string'

// https://github.com/dsblv/string-replace-async/blob/main/index.js
export function replaceAsync(string: string, searchValue: RegExp, replacer: (...args: string[]) => Promise<string>) {
  try {
    if (typeof replacer === 'function') {
      const values: Promise<string>[] = []
      String.prototype.replace.call(string, searchValue, (...args) => {
        values.push(replacer(...args))
        return ''
      })
      return Promise.all(values).then((resolvedValues) => {
        return String.prototype.replace.call(string, searchValue, () => {
          return resolvedValues.shift() || ''
        })
      })
    }
    else {
      return Promise.resolve(
        String.prototype.replace.call(string, searchValue, replacer),
      )
    }
  }
  catch (error) {
    return Promise.reject(error)
  }
}

export function getMatchedPositions(code: string, matched: string[], hasVariantGroup = false) {
  const result: [number, number, string][] = []
  const attributify: RegExpMatchArray[] = []
  const plain = new Set<string>()

  Array.from(matched)
    .forEach((v) => {
      const match = isAttributifySelector(v)
      if (!match)
        plain.add(v)
      else if (!match[2])
        plain.add(match[1])
      else
        attributify.push(match)
    })

  // highlight for plain classes
  let start = 0
  code.split(/([\s"'`;<>]|:\(|\)"|\)\s)/g).forEach((i) => {
    const end = start + i.length
    if (plain.has(i))
      result.push([start, end, i])
    start = end
  })

  // highlight for arbitrary css properties
  for (const match of code.matchAll(arbitraryPropertyRE)) {
    const start = match.index!
    const end = start + match[0].length
    if (plain.has(match[0]))
      result.push([start, end, match[0]])
  }

  // highlight for variant group
  if (hasVariantGroup) {
    Array.from(code.matchAll(regexClassGroup))
      .forEach((match) => {
        const [, pre, sep, body] = match
        const index = match.index!
        let start = index + pre.length + sep.length + 1
        body.split(/([\s"'`;<>]|:\(|\)"|\)\s)/g).forEach((i) => {
          const end = start + i.length
          const full = pre + sep + i
          if (plain.has(full)) {
            // find existing plain class match and replace it
            const index = result.findIndex(([s, e]) => s === start && e === end)
            if (index < 0)
              result.push([start, end, full])
            else
              result[index][2] = full
          }
          start = end
        })
      })
  }

  // attributify values
  attributify.forEach(([, name, value]) => {
    const regex = new RegExp(`(${escapeRegExp(name)}=)(['"])[^\\2]*?${escapeRegExp(value)}[^\\2]*?\\2`, 'g')
    Array.from(code.matchAll(regex))
      .forEach((match) => {
        const escaped = match[1]
        const body = match[0].slice(escaped.length)
        const bodyIndex = body.indexOf(value)
        if (bodyIndex < 0)
          return
        const start = match.index! + escaped.length + bodyIndex
        const end = start + value.length
        result.push([start, end, `[${name}="${value}"]`])
      })
  })

  return result.sort((a, b) => a[0] - b[0])
}

// remove css-directive transformer to get matched result from source code
const ignoreTransformers = [
  'css-directive',
  'compile-class',
]

export async function getMatchedPositionsFromCode(uno: UnoGenerator, code: string, id = '') {
  const s = new MagicString(code)
  const tokens = new Set()
  const ctx = { uno, tokens } as any

  const transformers = uno.config.transformers?.filter(i => !ignoreTransformers.includes(i.name))
  for (const i of transformers?.filter(i => i.enforce === 'pre') || [])
    await i.transform(s, id, ctx)
  for (const i of transformers?.filter(i => !i.enforce || i.enforce === 'default') || [])
    await i.transform(s, id, ctx)
  for (const i of transformers?.filter(i => i.enforce === 'post') || [])
    await i.transform(s, id, ctx)
  const hasVariantGroup = !!uno.config.transformers?.find(i => i.name === 'variant-group')
  const result = await uno.generate(s.toString(), { preflights: false })
  return getMatchedPositions(code, [...result.matched], hasVariantGroup)
}
