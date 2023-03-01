import MagicString from 'magic-string'
import { type UnoGenerator, attributifyRE, escapeRegExp, expandVariantGroup } from '@unocss/core'
import { wrapSelectorsWithGlobal } from './wrap-global'
import { hash } from './hash'

const classesRE = /class=(["'\`])([\S\s]+?)\1/g // class="mb-1"
const classesDirectivesRE = /class:([\S]+?)={/g // class:mb-1={foo}
const classDirectivesShorthandRE = /class:([^=>\s/]+)[{>\s/]/g // class:mb-1 (compiled to class:uno-1hashz={mb-1})
const classesFromInlineConditionalsRE = /'([\S\s]+?)'/g // { foo ? 'mt-1' : 'mt-2'}

export interface TransformSFCOptions {
  /**
   * Prefix for compiled class name
   * @default 'uno-'
   */
  classPrefix?: string
  /**
   * Add hash and combine recognized tokens (optimal for production); set false in dev mode for easy dev tools toggling to allow for design adjustments in the browser
   * @default true
   */
  combine?: boolean
  /**
   * Hash function
   */
  hashFn?: (str: string) => string
}

export async function transformSvelteSFC(code: string, id: string, uno: UnoGenerator, options: TransformSFCOptions = {}): Promise<{ code: string; map?: SourceMap } | undefined> {
  const {
    classPrefix = 'uno-',
    combine = true,
    hashFn = hash,
  } = options

  let styles = ''
  let map: SourceMap

  const alreadyHasStyles = code.match(/<style[^>]*>[\s\S]*?<\/style\s*>/)
  const preflights = code.includes('uno:preflights')
  const safelist = code.includes('uno:safelist')

  if (preflights || safelist) {
    const { css } = await uno.generate('', { preflights, safelist })
    styles = css
  }

  const classes = [...code.matchAll(classesRE)]
  const classDirectives = [...code.matchAll(classesDirectivesRE)]
  const classDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]

  const originalShortcuts = uno.config.shortcuts
  const shortcuts: Record<string, string[]> = {}
  const toGenerate = new Set<string>()
  const s = new MagicString(code)

  let idHash: string
  if (!combine)
    idHash = hashFn(id)

  function isOriginalOriginalShortcut(token: string): boolean {
    return !!originalShortcuts.find(s => s[0] === token)
  }

  function queueCompiledClass(tokens: string[]): string {
    if (combine) {
      const _shortcuts = tokens.filter(t => isOriginalOriginalShortcut(t))
      for (const s of _shortcuts)
        toGenerate.add(s)

      const _tokens = tokens.filter(t => !isOriginalOriginalShortcut(t))
      if (!_tokens.length)
        return _shortcuts.join(' ')
      const hash = hashFn(_tokens.join(' ') + id)
      const className = `${classPrefix}${hash}`
      shortcuts[className] = _tokens
      toGenerate.add(className)
      return [className, ..._shortcuts].join(' ')
    }
    else {
      return tokens.map((token) => {
        if (isOriginalOriginalShortcut(token)) {
          toGenerate.add(token)
          return token
        }
        const className = `_${token}_${idHash}` // certain classes (!mt-1, md:mt-1, space-x-1) break when coming at the beginning of a shortcut
        shortcuts[className] = [token]
        toGenerate.add(className)
        return className
      }).join(' ')
    }
  }

  async function sortKnownAndUnknownClasses(str: string) {
    const classArr = str.split(/\s+/)
    const result = await Promise.all(classArr.filter(Boolean).map(async t => [t, !!await uno.parseToken(t)] as const))
    const known = result
      .filter(([, matched]) => matched)
      .map(([t]) => t)
      .sort()
    if (!known.length)
      return null
    const replacements = result.filter(([, matched]) => !matched).map(([i]) => i) // unknown
    const className = queueCompiledClass(known)
    return [className, ...replacements].join(' ')
  }
  const processedMap = new Set()
  for (const match of classes) {
    let body = expandVariantGroup(match[2].trim())

    const inlineConditionals = [...body.matchAll(classesFromInlineConditionalsRE)]
    for (const conditional of inlineConditionals) {
      const replacement = await sortKnownAndUnknownClasses(conditional[1].trim())
      if (replacement)
        body = body.replace(conditional[0], `'${replacement}'`)
    }

    const replacement = await sortKnownAndUnknownClasses(body)
    if (replacement) {
      const start = match.index! + 7
      const end = match.index! + match[0].length - 1
      processedMap.add(start)
      s.overwrite(start, end, replacement)
    }
  }

  for (const match of classDirectives) {
    const token = match[1]
    const result = !!await uno.parseToken(token)
    if (!result)
      continue
    const className = queueCompiledClass([token])
    const start = match.index! + 'class:'.length
    processedMap.add(start)
    s.overwrite(start, start + match[1].length, className)
  }

  for (const match of classDirectivesShorthand) {
    const token = match[1]
    const result = !!await uno.parseToken(token)
    if (!result)
      continue
    const className = queueCompiledClass([token])
    const start = match.index! + 'class:'.length
    processedMap.add(start)
    s.overwrite(start, start + match[1].length, `${className}={${token}}`)
  }

  const { matched } = await uno.generate(code, { preflights: false, safelist: false, minify: true })

  for (const token of matched) {
    const match = token.match(attributifyRE)
    if (match) {
      const [,name, value] = match
      if (!value) {
        let start = 0
        code.split(/([\s"'`;*]|:\(|\)"|\)\s)/g).forEach((i) => {
          const end = start + i.length
          if (i === name && !processedMap.has(start)) {
            const className = queueCompiledClass([name])
            s.appendLeft(start, `class:${className}={true} `)
            s.overwrite(start, end, '')
          }
          start = end
        })
      }
      else {
        const regex = new RegExp(`(${escapeRegExp(name)}=)(['"])[^\\2]*?${escapeRegExp(value)}[^\\2]*?\\2`, 'g')
        for (const match of code.matchAll(regex)) {
          const escaped = match[1]
          const body = match[0].slice(escaped.length)
          let bodyIndex = body.match(`[\\b\\s'"]${escapeRegExp(value)}[\\b\\s'"]`)?.index ?? -1
          if (body[bodyIndex]?.match(/[\s'"]/))
            bodyIndex++
          if (bodyIndex < 0)
            return
          const [,base] = await uno.matchVariants(value)
          const variants = value.replace(base, '')
          const className = queueCompiledClass([`${variants + name}-${base}`])
          s.appendLeft(match.index!, `class:${className}={true} `)
          s.overwrite(match.index!, match.index! + match[0].length, '')
        }
      }
    }
  }

  uno.config.shortcuts = [...originalShortcuts, ...Object.entries(shortcuts)]
  const { css } = await uno.generate(toGenerate, { preflights: false, safelist: false, minify: true })

  styles += wrapSelectorsWithGlobal(css)
  uno.config.shortcuts = originalShortcuts

  if (toGenerate.size > 0 || s.hasChanged()) {
    code = s.toString()
    map = s.generateMap({ hires: true, source: id })
  }
  else { return }

  if (alreadyHasStyles) {
    return {
      code: code.replace(/(<style[^>]*>)/, `$1${styles}`),
      map,
    }
  }
  return {
    code: `${code}\n<style>${styles}</style>`,
    map,
  }
}

// Should be able to import SourceMap from '@unocss/core' but this causes a type error in packages\vite\src\modes\svelte-scoped\index.ts that I don't understand. The only difference is that `toString()` and `toUrl()` are missing on that type.
interface SourceMap {
  file: string
  mappings: string
  names: string[]
  sources: string[]
  sourcesContent: string[]
  version: number
  toString(): string
  toUrl(): string
}

// Possible Optimizations
// 1. If <style> tag includes 'uno:preflights' and 'global' don't have uno.generate output root variables that it thinks are needed because preflights is set to false. If there is no easy to do this in UnoCSS then we could also have preflights set to true and just strip them out if a style tag includes 'uno:preflights' and 'global' but that feels inefficient - is it?
// 2. Don't let config-set shortcuts be included in hashed class, would make for clearer output but add complexity to the code
