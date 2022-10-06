import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'

import MagicString from 'magic-string'
import { expandVariantGroup } from '@unocss/core'
import { defaultExclude } from '../integration'

export function SvelteScopedCompiledPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.svelte$/], defaultExclude)

  return {
    name: 'unocss:svelte-scoped-compiled',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ctx.ready
      filter = createFilter(
        config.include || [/\.svelte$/],
        config.exclude || defaultExclude,
      )
    },
    transform(code, id) {
      if (!filter(id))
        return
      return transformSFC(code, id, ctx)
    },
    handleHotUpdate(hmrCtx) {
      const read = hmrCtx.read
      if (filter(hmrCtx.file)) {
        hmrCtx.read = async () => {
          const code = await read()
          return await transformSFC(code, hmrCtx.file, ctx) || code
        }
      }
    },
  }
}
// import type { EncodedSourceMap } from '@ampproject/remapping'

export interface TransformSFCOptions {
  /**
   * Prefix for compile class name
   * @default 'uno-'
   */
  classPrefix?: string

  /**
   * Hash function
   */
  hashFn?: (str: string) => string

  /**
   * Leave unknown classes inside the string
   *
   * @default true
   */
  keepUnknown?: boolean
}
export async function transformSFC(code: string, id: string, ctx: UnocssPluginContext, options: TransformSFCOptions = {}) {
  const {
    hashFn = hash,
    classPrefix = 'uno-',
    keepUnknown = true,
  } = options

  let styles = ''

  const preflights = code.includes('uno:preflights')
  const safelist = code.includes('uno:safelist')

  if (preflights || safelist) {
    const { css } = await ctx.uno.generate('', { preflights, safelist })
    styles = css
  }

  const matches = [...code.matchAll(/class="([\S\s]+?)"/g)]
  const variableMatches = [...code.matchAll(/class:([\S]+?)={/g)]
  // If desired can use /class:([\S]+?)[{>\s]/g if we make sure to keep variable and just change class name (turn class:text-sm into class:uno-1hashz={text-sm})

  if (matches.length || variableMatches.length) {
    const originalShortcuts = ctx.uno.config.shortcuts
    const shortcuts: Record<string, string[]> = {}
    const hashedClasses = new Set<string>()
    const s = new MagicString(code)

    for (const match of matches) {
      const body = expandVariantGroup(match[1].trim())
      let classesArr = body.split(/\s+/)
      const start = match.index!
      const replacements = []

      if (keepUnknown) {
        const result = await Promise.all(classesArr.filter(Boolean).map(async i => [i, !!await ctx.uno.parseToken(i)] as const))

        classesArr = result.filter(([, matched]) => matched).map(([i]) => i)
        if (!classesArr.length)
          continue

        const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)
        replacements.push(...unknown)
      }

      // Could be improved by not letting config set shortcuts be included in hashed class, would make for cleaner output but add complexity to the code
      if (classesArr.length) {
        classesArr = classesArr.sort()
        const hash = hashFn(classesArr.join(' '))
        const className = `${classPrefix}${hash}`
        replacements.unshift(className)
        shortcuts[className] = classesArr
        hashedClasses.add(className)
        s.overwrite(start + 7, start + match[0].length - 1, replacements.join(' '))

        // TODO: add id to ctx.module and classesArr to ctx.tokens (tokens.add(___)) for the Inspector w/o making Uno try to place tokens in a non-existent uno.css global stylesheet
      }
    }

    for (const match of variableMatches) {
      const _class = match[1]
      const result = !!await ctx.uno.parseToken(_class)
      if (!result)
        return
      const hash = hashFn(_class)
      const className = `${classPrefix}${hash}`
      shortcuts[className] = [_class]
      hashedClasses.add(className)
      const start = match.index! + 'class:'.length
      s.overwrite(start, start + match[1].length, className)
    }

    // from packages\shared-integration\src\transformers.ts
    if (s.hasChanged())
      code = s.toString()
    // TODO: how should the map be handled?
    // const map = s.generateMap({ hires: true, source: id }) as EncodedSourceMap

    ctx.uno.config.shortcuts = [...originalShortcuts, ...Object.entries(shortcuts)]
    const { css } = await ctx.uno.generate(hashedClasses, { preflights: false, safelist: false, minify: true })

    styles += wrapSelectorsWithGlobal(css)
    // styles += css
    ctx.uno.config.shortcuts = originalShortcuts
  }

  if (!styles.length)
    return null
  if (code.match(/<style[^>]*>[\s\S]*?<\/style\s*>/))
    return code.replace(/(<style[^>]*>)/, `$1${styles}`)
  return `${code}\n<style>${styles}</style>`
}

const SELECTOR_REGEX = /([[\.][\S\s]+?)({[\S\s]+?})/g
// Capture selector starting with either a right bracket as in [dir="rtl"] or a period as in normal selectors, followed by consuming just the next set of brackets with content (lazy)
// if needing to wrap a class starting with a colon as in ":not(...)" then need to avoid grabbing colons from media queries like `@media (min-width: 640px){.uno-28lpzl{margin-bottom:0.5rem;}}`
// setting uno.generate's minify option to true means we don't need to worry about avoiding getting tangled up in layer comments like /* layer: shortcuts */

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
