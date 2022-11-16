import type { UnoGenerator } from '@unocss/core'
import { escapeRegExp, isAttributifySelector, regexClassGroup } from '@unocss/core'
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
    return { pug: false, code: undefined }

  const ctx = { code, id } as any
  await pugExtractor.extract(ctx)
  return ctx.code !== code ? { pug: true, code: ctx.code } : { pug: false, code: undefined }
}

export function getPlainClassMatchedPositionsForPug(codeSplit: string, matchedPlain: Set<string>, start: number) {
  const result: [number, number, string][] = []
  matchedPlain.forEach((plainClassName) => {
    // match for 'p1'
    // end with EOL : div.p1
    // end with . : div.p1.ma
    // end with # : div.p1#id
    // end with = : div.p1= content
    // end with space : div.p1 content
    // end with ( :  div.p1(text="red")

    const regex = new RegExp(`\.(${plainClassName})[\.#=\s(]|\.(${plainClassName})$`)
    const match = regex.exec(codeSplit)
    if (match)
      // keep [.] not include -> .p1 will only show underline on [p1]
      result.push([start + match.index + 1, start + match.index + plainClassName.length + 1, plainClassName])
  })

  return result
}

export function getMatchedPositions(code: string, matched: string[], hasVariantGroup = false, isPug = false) {
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
    if (isPug) {
      result.push(...getPlainClassMatchedPositionsForPug(i, plain, start))
    }
    else {
      if (plain.has(i))
        result.push([start, end, i])
    }
    start = end
  })

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

  const { pug, code: pugCode } = await isPug(uno, code, id)
  const result = await uno.generate(pug ? pugCode : s.toString(), { preflights: false })
  return getMatchedPositions(code, [...result.matched], hasVariantGroup, pug)
}

