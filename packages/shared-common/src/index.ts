import type { ExtractorContext, HighlightAnnotation, UnoGenerator } from '@unocss/core'
import { escapeRegExp, isAttributifySelector, splitWithVariantGroupRE } from '@unocss/core'
import MagicString from 'magic-string'
import { arbitraryPropertyRE, quotedArbitraryValuesRE } from '../../extractor-arbitrary-variants/src'

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
  await pugExtractor.extract?.(ctx)
  const extractResult = ctx.code.startsWith(code)
    ? ctx.code.substring(code.length + 2)
    : ctx.code
  return ctx.code !== code
    ? { pug: true, code: extractResult }
    : { pug: false, code: '' }
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

export interface GetMatchedPositionsOptions {
  isPug?: boolean
  /**
   * Regex to only limit the matched positions for certain code
   */
  includeRegex?: RegExp[]
  /**
   * Regex to exclude the matched positions for certain code, excludeRegex has higher priority than includeRegex
   */
  excludeRegex?: RegExp[]
}

export function getMatchedPositions(
  code: string,
  matched: string[],
  extraAnnotations: HighlightAnnotation[] = [],
  options: GetMatchedPositionsOptions = {},
) {
  const result: (readonly [start: number, end: number, text: string])[] = []
  const attributify: RegExpMatchArray[] = []
  const plain = new Set<string>()

  const includeRanges: [number, number][] = []
  const excludeRanges: [number, number][] = []

  if (options.includeRegex) {
    for (const regex of options.includeRegex) {
      for (const match of code.matchAll(regex))
        includeRanges.push([match.index!, match.index! + match[0].length])
    }
  }
  else {
    includeRanges.push([0, code.length])
  }

  if (options.excludeRegex) {
    for (const regex of options.excludeRegex) {
      for (const match of code.matchAll(regex))
        excludeRanges.push([match.index!, match.index! + match[0].length])
    }
  }

  Array.from(matched)
    .forEach((v) => {
      const match = isAttributifySelector(v)
      if (!match) {
        highlightLessGreaterThanSign(v)
        plain.add(v)
      }
      else if (!match[2]) {
        highlightLessGreaterThanSign(match[1])
        plain.add(match[1])
      }
      else {
        attributify.push(match)
      }
    })

  // highlight classes that includes `><`
  function highlightLessGreaterThanSign(str: string) {
    if (/[><]/.test(str)) {
      for (const match of code.matchAll(new RegExp(escapeRegExp(str), 'g'))) {
        const start = match.index!
        const end = start + match[0].length
        result.push([start, end, match[0]])
      }
    }
  }

  // highlight for plain classes
  let start = 0
  code.split(splitWithVariantGroupRE).forEach((i) => {
    const end = start + i.length
    if (options.isPug) {
      result.push(...getPlainClassMatchedPositionsForPug(i, plain, start))
    }
    else {
      if (plain.has(i))
        result.push([start, end, i])
    }
    start = end
  })

  // highlight for quoted arbitrary values
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
    if (plain.has(match[0])) {
      // non-quoted arbitrary properties already highlighted by plain class highlighter
      const index = result.findIndex(([s, e]) => s === start && e === end)
      if (index < 0)
        result.push([start, end, match[0]])
    }
  }

  // attributify values
  attributify.forEach(([, name, value]) => {
    const regex = new RegExp(`(${escapeRegExp(name)}=)(['"])[^\\2]*?${escapeRegExp(value)}[^\\2]*?\\2`, 'g')
    Array.from(code.matchAll(regex))
      .forEach((match) => {
        const escaped = match[1]
        const body = match[0].slice(escaped.length)
        let bodyIndex = body.match(`[\\b\\s'"]${escapeRegExp(value)}[\\b\\s'"]`)?.index ?? -1
        if (/[\s'"]/.test(body[bodyIndex] ?? ''))
          bodyIndex++
        if (bodyIndex < 0)
          return
        const start = match.index! + escaped.length + bodyIndex
        const end = start + value.length
        result.push([start, end, `[${name}="${value}"]`])
      })
  })

  result
    .push(...extraAnnotations.map(i => [i.offset, i.offset + i.length, i.className] as const))

  return result
    .filter(([start, end]) => {
      if (excludeRanges.some(([s, e]) => start >= s && end <= e))
        return false
      if (includeRanges.some(([s, e]) => start >= s && end <= e))
        return true
      return false
    })
    .sort((a, b) => a[0] - b[0])
}

// remove @unocss/transformer-directives transformer to get matched result from source code
const ignoreTransformers = [
  '@unocss/transformer-directives',
  '@unocss/transformer-compile-class',
]

export async function getMatchedPositionsFromCode(
  uno: UnoGenerator,
  code: string,
  id = '',
  options: GetMatchedPositionsOptions = {},
) {
  const s = new MagicString(code)
  const tokens = new Set()
  const ctx = { uno, tokens } as any

  const transformers = uno.config.transformers?.filter(i => !ignoreTransformers.includes(i.name))
  const annotations = []
  for (const enforce of ['pre', 'default', 'post']) {
    for (const i of transformers?.filter(i => (i.enforce ?? 'default') === enforce) || []) {
      const result = await i.transform(s, id, ctx)
      const _annotations = result?.highlightAnnotations
      if (_annotations)
        annotations.push(..._annotations)
    }
  }

  const { pug, code: pugCode } = await isPug(uno, s.toString(), id)
  const result = await uno.generate(pug ? pugCode : s.toString(), { preflights: false })
  return getMatchedPositions(code, [...result.matched], annotations, {
    isPug: pug,
    ...options,
  })
}
