import MagicString, { type SourceMap } from 'magic-string'
import { type UnoGenerator, expandVariantGroup } from '@unocss/core'
import type { Processed } from 'svelte/types/compiler/preprocess'
import type { TransformClassesOptions } from '../types'
import { wrapSelectorsWithGlobal } from './wrap-global'
import { hash } from './hash'

const notInCommentRE = /(?<!<!--\s*)/
const stylesTagWithCapturedDirectivesRE = /<style([^>]*)>[\s\S]*?<\/style\s*>/
const actualStylesTagWithCapturedDirectivesRE = new RegExp(notInCommentRE.source + stylesTagWithCapturedDirectivesRE.source, 'g')

const classesRE = /class=(["'\`])([\S\s]+?)\1/g // class="mb-1"
const classDirectivesRE = /class:([\S]+?)={/g // class:mb-1={foo}
const classDirectivesShorthandRE = /class:([^=>\s/]+)[{>\s/]/g // class:mb-1 (compiled to class:uno-1hashz={mb-1})
const classesFromInlineConditionalsRE = /'([\S\s]+?)'/g // { foo ? 'mt-1' : 'mt-2'}

export async function transformClasses({ code, filename, uno, options }: { code: string; filename: string; uno: UnoGenerator; options: TransformClassesOptions }): Promise<Processed | void> {
  const classes = [...code.matchAll(classesRE)]
  const classDirectives = [...code.matchAll(classDirectivesRE)]
  const classDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]
  if (!classes.length && !classDirectives.length && !classDirectivesShorthand.length)
    return

  const {
    classPrefix = 'uno-',
    combine = true,
    hashFn = hash,
  } = options

  const originalShortcuts = uno.config.shortcuts
  const shortcuts: Record<string, string[]> = {}
  const toGenerate = new Set<string>()
  const s = new MagicString(code)
  const idHash = combine ? '' : hashFn(filename)
  let styles = ''
  let map: SourceMap

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
      const start = match.index!
      s.overwrite(start + 7, start + match[0].length - 1, replacement)
    }
  }

  for (const match of classDirectives) {
    const token = match[1]
    const result = await needsGenerated(token)
    if (!result)
      continue
    const className = queueCompiledClass([token])
    const start = match.index! + 'class:'.length
    s.overwrite(start, start + match[1].length, className)
  }

  for (const match of classDirectivesShorthand) {
    const token = match[1]
    const result = await needsGenerated(token)
    if (!result)
      continue
    const className = queueCompiledClass([token])
    const start = match.index! + 'class:'.length
    s.overwrite(start, start + match[1].length, `${className}={${token}}`)
  }

  async function sortKnownAndUnknownClasses(str: string) {
    const classArr = str.split(/\s+/)
    const result = await Promise.all(classArr.filter(Boolean).map(async token => [token, await needsGenerated(token)] as const))
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

  async function needsGenerated(token: string): Promise<boolean> {
    if (uno.config.safelist.includes(token))
      return false
    return !!await uno.parseToken(token)
  }

  function queueCompiledClass(tokens: string[]): string {
    if (combine) {
      const _shortcuts = tokens.filter(t => isOriginalShortcut(t))
      for (const s of _shortcuts)
        toGenerate.add(s)

      const _tokens = tokens.filter(t => !isOriginalShortcut(t))
      if (!_tokens.length)
        return _shortcuts.join(' ')
      const hash = hashFn(_tokens.join(' ') + filename)
      const className = `${classPrefix}${hash}`
      shortcuts[className] = _tokens
      toGenerate.add(className)
      return [className, ..._shortcuts].join(' ')
    }
    else {
      return tokens.map((token) => {
        if (isOriginalShortcut(token)) {
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

  function isOriginalShortcut(token: string): boolean {
    return originalShortcuts.some(s => s[0] === token)
  }

  uno.config.shortcuts = [...originalShortcuts, ...Object.entries(shortcuts)]
  const { css } = await uno.generate(toGenerate, { preflights: false, safelist: false, minify: true }) // minify avoids wrapSelectorsWithGlobal getting tangled up in layer comments like /* layer: shortcuts */

  styles += wrapSelectorsWithGlobal(css)
  uno.config.shortcuts = originalShortcuts

  if (toGenerate.size > 0 || s.hasChanged()) {
    code = s.toString()
    map = s.generateMap({ hires: true, source: filename })
  }
  else { return }

  const preexistingStylesTag = code.match(actualStylesTagWithCapturedDirectivesRE)
  if (preexistingStylesTag) {
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

// Possible Optimizations
// Don't let config-set shortcuts be included in hashed class, would make for clearer output but add complexity to the code
