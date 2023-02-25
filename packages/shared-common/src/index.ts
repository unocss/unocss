import type { ExtractorContext, UnoGenerator } from '@unocss/core'
import { arbitraryPropertyRE, escapeRegExp, isAttributifySelector, makeRegexClassGroup, quotedArbitraryValuesRE } from '@unocss/core'
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

export async function isPug(uno: UnoGenerator, code: string, id = '') {
  const pugExtractor = uno.config.extractors?.find(e => e.name === 'pug')
  if (!pugExtractor)
    return { pug: false, code: '' }

  const ctx = { code, id } as ExtractorContext
  await pugExtractor.extract(ctx)
  const extractResult = ctx.code.startsWith(code) ? ctx.code.substring(code.length + 2) : ctx.code
  return ctx.code !== code ? { pug: true, code: extractResult } : { pug: false, code: '' }
}

export function getPlainClassMatchedPositionsForPug(codeSplit: string, matchedPlain: Set<string>, start: number) {
  const result: [number, number, string][] = []
  matchedPlain.forEach((plainClassName) => {
    // normal case: match for 'p1'
    // end with EOL : div.p1
    // end with . : div.p1.ma
    // end with # : div.p1#id
    // end with = : div.p1= content
    // end with space : div.p1 content
    // end with ( :  div.p1(text="red")

    // complex case: match for hover:scale-100
    // such as [div.hover:scale-100] will not be parsed correctly by pug
    // should use [div(class='hover:scale-100')]

    // combine both cases will be 2 syntax
    // div.p1(class='hover:scale-100')
    // div(class='hover:scale-100 p1') -> p1 should be parsing as well
    if (plainClassName.includes(':')) {
      if (plainClassName === codeSplit)
        result.push([start, start + plainClassName.length, plainClassName])
    }
    else {
      const regex = new RegExp(`\.(${plainClassName})[\.#=\s(]|\.(${plainClassName})$`)
      const match = regex.exec(codeSplit)
      if (match) {
        // keep [.] not include -> .p1 will only show underline on [p1]
        result.push([start + match.index + 1, start + match.index + plainClassName.length + 1, plainClassName])
      }
      else {
        // div(class='hover:scale-100 p1') -> parsing p1
        // this will only be triggered if normal case fails
        if (plainClassName === codeSplit)
          result.push([start, start + plainClassName.length, plainClassName])
      }
    }
  })

  return result
}

export function getMatchedPositions(code: string, matched: string[], hasVariantGroup = false, isPug = false, uno: UnoGenerator | undefined = undefined) {
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
  code.split(/([\s"'`;*]|:\(|\)"|\)\s)/g).forEach((i) => {
    const end = start + i.length
    if (isPug) {
      result.push(...getPlainClassMatchedPositionsForPug(i, plain, start))
    }
    else {
      if (plain.has(i))
        result.push([start, end, i])
    }
    start = end
  })

  // highlight for qouted arbitrary values
  for (const match of code.matchAll(quotedArbitraryValuesRE)) {
    const start = match.index!
    const end = start + match[0].length
    if (plain.has(match[0]))
      result.push([start, end, match[0]])
  }

  // highlight for arbitrary css properties
  for (const match of code.matchAll(arbitraryPropertyRE)) {
    const start = match.index!
    const end = start + match[0].length
    if (plain.has(match[0]))
      result.push([start, end, match[0]])
  }

  // highlight for variant group
  if (hasVariantGroup) {
    Array.from(code.matchAll(makeRegexClassGroup(uno?.config.separators)))
      .forEach((match) => {
        const [, pre, sep, body] = match
        const index = match.index!
        let start = index + pre.length + sep.length + 1
        body.split(/([\s"'`;*]|:\(|\)"|\)\s)/g).forEach((i) => {
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
        let bodyIndex = body.match(`[\\b\\s'"]${escapeRegExp(value)}[\\b\\s'"]`)?.index ?? -1
        if (body[bodyIndex]?.match(/[\s'"]/))
          bodyIndex++
        if (bodyIndex < 0)
          return
        const start = match.index! + escaped.length + bodyIndex
        const end = start + value.length
        result.push([start, end, `[${name}="${value}"]`])
      })
  })

  return result.sort((a, b) => a[0] - b[0])
}

// remove @unocss/transformer-directives transformer to get matched result from source code
const ignoreTransformers = [
  '@unocss/transformer-directives',
  '@unocss/transformer-compile-class',
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
  const hasVariantGroup = !!uno.config.transformers?.find(i => i.name === '@unocss/transformer-variant-group')

  const { pug, code: pugCode } = await isPug(uno, s.toString(), id)
  const result = await uno.generate(pug ? pugCode : s.toString(), { preflights: false })
  return getMatchedPositions(code, [...result.matched], hasVariantGroup, pug, uno)
}
