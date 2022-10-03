import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
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

import MagicString from 'magic-string'
import { expandVariantGroup } from '@unocss/core'
// import type { EncodedSourceMap } from '@ampproject/remapping'

export async function transformSFC(code: string, id: string, ctx: UnocssPluginContext, hashFn = hash, classPrefix = 'uno-', keepUnknown = true) {
  let styles = '';

  const preflights = code.includes('uno:preflights');
  const safelist = code.includes('uno:safelist');

  if (preflights || safelist) {
    const { css } = await ctx.uno.generate('', { preflights, safelist })
    styles = css;
  }

  const matches = [
    ...code.matchAll(/class="([\S\s]+?)"/g),
    ...code.matchAll(/class:([\S]+?){"/g),
  ];
  // If desired can use /class:([\S]+?)[{>\s]/g if we make sure to keep variable and just change class name (turn class:text-sm into class:uno-1hashz={text-sm})


  if (matches.length) {
    let s = new MagicString(code)

    for (const match of matches) {
      let body = expandVariantGroup(match[2].trim())
      let classesArr = body.split(/\s+/);
      const start = match.index!
      const replacements = []

      if (keepUnknown) {
        const result = await Promise.all(classesArr.filter(Boolean).map(async i => [i, !!await ctx.uno.parseToken(i)] as const))

        const known = result.filter(([, matched]) => matched).map(([i]) => i)
        classesArr = known;

        const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)
        replacements.push(...unknown)
      }

      if (classesArr) {
        classesArr = classesArr.sort()
        const hash = hashFn(classesArr.join(' '))
        const className = `${classPrefix}${hash}`
        replacements.unshift(className)

        // TODO: do we need generate or can we use parseToken...?
        const result = await ctx.uno.generate(classesArr);
        styles += result.css;
        console.log(result.matched); 
        // TODO: styles += `:global(modified selector stemming from .${className}){${result.css}}`;

        s.overwrite(start + 1, start + match[0].length - 1, replacements.join(' '))

        // TODO: add id to ctx.module and classesArr to ctx.tokens (tokens.add(___)) for the Inspector w/o making Uno try to place tokens in a non-existent uno.css global stylesheet
      }
    }

    // from packages\shared-integration\src\transformers.ts
    if (s.hasChanged()) {
      code = s.toString()
      // TODO: how should the map be handled?
      // const map = s.generateMap({ hires: true, source: id }) as EncodedSourceMap
    }
  }

  if (!styles.length)
    return null
  if (code.match(/<style[^>]*>[\s\S]*?<\/style\s*>/))
    return code.replace(/(<style[^>]*>)/, `$1${styles}`)
  return `${code}\n<style>${styles}</style>`
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