import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { type UnoGenerator, type UnocssPluginContext, expandVariantGroup } from '@unocss/core'
import MagicString from 'magic-string'
import { defaultExclude } from '../integration'

export function SvelteScopedCompiledPlugin({ ready, uno }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.svelte$/], defaultExclude)

  return {
    name: 'unocss:svelte-scoped-compiled',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ready
      filter = createFilter(
        config.include || [/\.svelte$/],
        config.exclude || defaultExclude,
      )
    },
    transform(code, id) {
      if (!filter(id))
        return
      return transformSFC(code, id, uno)
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code, ctx.file, uno) || code
        }
      }
    },
  }
}

// import type { EncodedSourceMap } from '@ampproject/remapping'
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
  // TODO: if <style> tag includes 'uno:preflights' and 'global' don't have uno.generate output root variables that it thinks are needed because preflights is set to false. If there is no easy to do this in UnoCSS then we could also have preflights set to true and just strip them out if a style tag includes 'uno:preflights' and 'global' but that feels inefficient - is it?

  if (preflights || safelist) {
    const { css } = await uno.generate('', { preflights, safelist })
    styles = css
  }

  const matches = [...code.matchAll(/class=(["'\`])([\S\s]+?)\1/g)] // class="mb-1"
  // console.log(matches)
  const classDirectives = [...code.matchAll(/class:([\S]+?)={/g)] // class:mb-1={foo}
  const classDirectivesShorthand = [...code.matchAll(/class:([^=>\s/]+)[{>\s/]/g)] // class:mb-1 (turns into class:uno-1hashz={mb-1}) if mb-1 is also a variable

  if (matches.length || classDirectives.length) {
    const originalShortcuts = uno.config.shortcuts
    const shortcuts: Record<string, string[]> = {}
    const toGenerate = new Set<string>()
    const s = new MagicString(code)

    for (const match of matches) {
      const classes = expandVariantGroup(match[2].trim()).split(/\s+/)

      const result = await Promise.all(classes.filter(Boolean).map(async i => [i, !!await uno.parseToken(i)] as const))

      const known = result.filter(([, matched]) => matched).map(([i]) => i).sort()
      if (!known.length)
        continue

      const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)
      const replacements = unknown

      // Could be improved by not letting config-set shortcuts be included in hashed class, would make for cleaner output but add complexity to the code
      const hash = hashFn(known.join(' '))
      const className = `${classPrefix}${hash}`
      replacements.unshift(className)
      shortcuts[className] = known
      toGenerate.add(className)

      const updatedClassString = replacements.join(' ')

      // TODO: to support styles found inside interpolation 'text-red-600 font-bold' surrounded by single quotes, we can take the replacements array at this point
      // if unknown had length, we can run a regex at the end of this match on the matched string to check for styles inside interpolation

      const start = match.index!
      s.overwrite(start + 7, start + match[0].length - 1, updatedClassString)


      // TODO: return module id and found tokens from this function so ctx.module and ctx.tokens (tokens.add(___)) can be updated for the Inspector w/o making Uno, but do it in such a way that Uno doesn't try to place tokens in a non-existent uno.css global stylesheet
    }

    // TODO: bench this transform function, then combine the following two (maybe also above block) into a reusable function
    for (const match of classDirectives) {
      const _class = match[1]
      const result = !!await uno.parseToken(_class)
      if (!result)
        return
      const hash = hashFn(_class)
      const className = `${classPrefix}${hash}`
      shortcuts[className] = [_class]
      toGenerate.add(className)
      const start = match.index! + 'class:'.length
      s.overwrite(start, start + match[1].length, className)
    }

    for (const match of classDirectivesShorthand) {
      const _class = match[1]
      const result = !!await uno.parseToken(_class)
      if (!result)
        return
      const hash = hashFn(_class)
      const className = `${classPrefix}${hash}`
      shortcuts[className] = [_class]
      toGenerate.add(className)
      const start = match.index! + 'class:'.length
      s.overwrite(start, start + match[1].length, `${className}={${_class}}`)
    }

    // from packages\shared-integration\src\transformers.ts
    if (s.hasChanged())
      code = s.toString()

    // TODO: properly create and return a source map
    // const map = s.generateMap({ hires: true, source: id }) as EncodedSourceMap

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

const SELECTOR_REGEX = /(?<![\d(])([[\.][\S\s]+?)({[\S\s]+?})/g
// First group: negative lookbehind to make sure not preceeded by a digit or open parenthesis as seen in `animate-bounce`
// Second group captures selector starting with either a right bracket as in [dir="rtl"] or a period as in normal selectors, followed by consuming just the next set of brackets with content (lazy)
// if needing to wrap a class starting with a colon as in ":not(...)" then need to avoid grabbing colons from media queries like `@media (min-width: 640px){.uno-28lpzl{margin-bottom:0.5rem;}}`
// setting uno.generate's minify option to true means we don't need to worry about avoiding getting tangled up in layer comments like /* layer: shortcuts */
// Third group captures styles

function wrapSelectorsWithGlobal(css: string) {
  return css.replace(SELECTOR_REGEX, ':global($1)$2')
}

// duplicated from @unocss/transformer-compile-class
function hash(str: string) {
  let i; let l
  let hval = 0x811C9DC5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return (`00000${(hval >>> 0).toString(36)}`).slice(-6)
}
