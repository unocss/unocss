import type { SourceCodeTransformer } from '@unocss/core'
import { dirname, isAbsolute, join, normalize } from 'pathe'

const cssUrlRE = /url\(['"]?(.+?)(['"])?\)/g

export interface CssUrlTransformerOptions extends Partial<Omit<SourceCodeTransformer, 'transform'>> {
}

export function cssUrlTransformer(opts?: CssUrlTransformerOptions): SourceCodeTransformer {
  return {
    name: '@unocss/rule-utils:transformer',
    enforce: 'pre',
    ...opts,
    transform: (code, id, ctx) => {
      // the vscode extension will not pass 'ctx.root'
      if (!ctx.root) {
        return
      }

      for (const match of code.original.matchAll(cssUrlRE)) {
        const className = replaceRelativeCssUrl(match[0], id, ctx.root)
        if (className !== match[0]) {
          code.overwrite(match.index, match.index + match[0].length, className)
        }
      }
    },
  }
}

export function replaceRelativeCssUrl(code: string, id: string, root: string) {
  const url = code.replace(cssUrlRE, (_, cssUrl, quote = '') => {
    let url = isRelative(cssUrl) ? join(dirname(id), cssUrl) : cssUrl
    url = url.replace(normalize(root), '')

    return `url(${quote}${url}${quote})`
  })

  return url
}

function isRelative(url: string) {
  return !isAbsolute(url) && /^[.\w]/.test(url) && !/^\w+:\/\//.test(url)
}
