import type { HighlightAnnotation, SourceCodeTransformer } from '@unocss/core'

const cssUrlRE = /url\(['"]?(.+?)(['"])?\)/g
const httpUrlRE = /^https?:\/\//

export interface CssUrlTransformerOptions extends Omit<SourceCodeTransformer, 'transform'> {
  regexp?: RegExp
}

export function cssUrlTransformer(opts: CssUrlTransformerOptions): SourceCodeTransformer {
  return {
    enforce: 'pre',
    ...opts,
    transform: withCssUrlTransform(opts.regexp),
  }
}

export function withCssUrlTransform(regexp?: RegExp): SourceCodeTransformer['transform'] {
  return async (code, id, ctx) => {
    if (!regexp) {
      code.overwrite(0, code.original.length, await parseCssUrl(code.original, id, ctx.root))
      return
    }

    const highlightAnnotations: HighlightAnnotation[] = []
    for (const match of code.original.matchAll(regexp)) {
      const part = await parseCssUrl(match[0], id, ctx.root)

      highlightAnnotations.push({
        offset: match.index,
        length: match[0].length,
        className: match[0],
      })

      code.overwrite(match.index, match.index + match[0].length, part)
    }

    return {
      highlightAnnotations,
    }
  }
}

export async function parseCssUrl(code: string, id: string, root: string) {
  // Playground run running in the browser, so the URL will not be converted in the browser.
  const nodePath = await import('node:path').catch(() => null)
  const nodeFS = await import('node:fs').catch(() => null)

  const url = code.replace(cssUrlRE, (_, cssUrl, quote = '') => {
    let url = cssUrl
    if (nodePath && nodeFS && !httpUrlRE.test(cssUrl)) {
      const filepath = nodePath.resolve(nodePath.dirname(id), cssUrl).replace(/\\/g, '/')
      // Alias path and HTTP URL will not be converted.
      url = !nodePath.isAbsolute(cssUrl) && nodeFS.existsSync(filepath) ? filepath.replace(root, '') : cssUrl
    }

    return `url(${quote}${url}${quote})`
  })

  return url
}
