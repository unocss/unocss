import MagicString from 'magic-string'
import { type UnoGenerator, expandVariantGroup } from '@unocss/core'
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
   * Hash function
   */
  hashFn?: (str: string) => string
}

export async function transformSFC(code: string, id: string, uno: UnoGenerator, options: TransformSFCOptions = {}) {
  const {
    hashFn = hash,
    classPrefix = 'uno-',
  } = options

  let styles = ''

  const preflights = code.includes('uno:preflights')
  const safelist = code.includes('uno:safelist')

  if (preflights || safelist) {
    const { css } = await uno.generate('', { preflights, safelist })
    styles = css
  }

  const classes = [...code.matchAll(classesRE)]
  const classDirectives = [...code.matchAll(classesDirectivesRE)]
  const classDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]

  if (classes.length || classDirectives.length || classDirectivesShorthand.length) {
    const originalShortcuts = uno.config.shortcuts
    const shortcuts: Record<string, string[]> = {}
    const toGenerate = new Set<string>()
    const s = new MagicString(code)

    function queueCompiledClass(tokens: string[]) {
      const hash = hashFn(tokens.join(' '))
      const className = `${classPrefix}${hash}`
      shortcuts[className] = tokens
      toGenerate.add(className)
      return className
    }

    async function sortKnownAndUnknownClasses(str: string) {
      const classArr = str.split(/\s+/)
      const result = await Promise.all(classArr.filter(Boolean).map(async i => [i, !!await uno.parseToken(i)] as const))
      const known = result.filter(([, matched]) => matched).map(([i]) => i).sort()
      if (!known.length)
        return null
      const replacements = result.filter(([, matched]) => !matched).map(([i]) => i) // unknown
      const className = queueCompiledClass(known)
      return [className, ...replacements].join(' ')
    }

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
      const result = !!await uno.parseToken(token)
      if (!result)
        return
      const className = queueCompiledClass([token])
      const start = match.index! + 'class:'.length
      s.overwrite(start, start + match[1].length, className)
    }

    for (const match of classDirectivesShorthand) {
      const token = match[1]
      const result = !!await uno.parseToken(token)
      if (!result)
        return
      const className = queueCompiledClass([token])
      const start = match.index! + 'class:'.length
      s.overwrite(start, start + match[1].length, `${className}={${token}}`)
    }

    if (s.hasChanged())
      code = s.toString()

    // TODO: return a source map
    // const map = s.generateMap({ hires: true, source: id }) as EncodedSourceMap
    // import type { EncodedSourceMap } from '@ampproject/remapping'

    uno.config.shortcuts = [...originalShortcuts, ...Object.entries(shortcuts)]
    const { css } = await uno.generate(toGenerate, { preflights: false, safelist: false, minify: true })

    styles += wrapSelectorsWithGlobal(css)
    uno.config.shortcuts = originalShortcuts
  }

  if (!styles.length)
    return code
  if (code.match(/<style[^>]*>[\s\S]*?<\/style\s*>/))
    return code.replace(/(<style[^>]*>)/, `$1${styles}`)
  return `${code}\n<style>${styles}</style>`
}

// Possible Optimizations
// 1. If <style> tag includes 'uno:preflights' and 'global' don't have uno.generate output root variables that it thinks are needed because preflights is set to false. If there is no easy to do this in UnoCSS then we could also have preflights set to true and just strip them out if a style tag includes 'uno:preflights' and 'global' but that feels inefficient - is it?
// 2. Don't let config-set shortcuts be included in hashed class, would make for clearer output but add complexity to the code
