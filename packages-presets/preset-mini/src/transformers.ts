import type { HighlightAnnotation, SourceCodeTransformer } from '@unocss/core'

const bgUrlRE = /^\[url\(.+\)\]$/

export const bgColorsTransformer: SourceCodeTransformer = {
  name: '@unocss/preset-mini:transformer',
  enforce: 'pre',
  async transform(code, id, ctx) {
    // playground browser doesn't support node:path
    const nodePath = await import('node:path').catch(() => null)
    if (!nodePath)
      return

    const { dirname, isAbsolute, resolve } = nodePath
    const highlightAnnotations: HighlightAnnotation[] = []
    const matches = code.original.matchAll(/ ?bg-(\[.+\])/g)
    for (const match of matches) {
      const [pattern, d] = match
      if (bgUrlRE.test(d)) {
        const url = d.replace(/^\[?(?:url\(?)?['"]?(.+?)['"]?\)?\]?$/, '$1')
        if (url && !isAbsolute(url) && !/^(?:https?:)?\/\//.test(url)) {
          const path = resolve(dirname(id), url).replace(ctx.root, '').replace(/\\/g, '/')
          code.overwrite(match.index, match.index + pattern.length, ` bg-[url('${path}')]`)
          highlightAnnotations.push({
            offset: match.index,
            length: pattern.length,
            className: pattern,
          })
        }
      }
    }

    return {
      highlightAnnotations,
    }
  },
}

export const transformers: SourceCodeTransformer[] = [
  bgColorsTransformer,
]
