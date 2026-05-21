import path from 'node:path'

export { getMatchedPositionsFromCode } from '#integration/match-positions'

const styleTagsRe = /<style[^>]*>[\s\S]*?(?:<\/style>|<\/>)/g
const pugTemplateRe = /<template.*?lang=['"]pug['"][^>]*>/i

export function shouldProvideAutocomplete(code: string, id: string, offset: number) {
  const isSfcLike = id.match(/\.(svelte|vue|astro|marko)$/)

  const isPugVue = isSfcLike && isVueWithPug(code, id)
  if (isPugVue) {
    const codeBeforeCursor = code.slice(0, offset)
    if (/\.$/.test(codeBeforeCursor) || /\.\S+$/.test(codeBeforeCursor)) {
      return true
    }
  }

  const isInStyleTag = isSfcLike
    ? [...code.matchAll(styleTagsRe)]
        .map(v => [v.index, v.index + v[0].length])
        .some(([start, end]) => offset > start && offset < end)
    : true

  if (isInStyleTag)
    return true

  const codeStripStrings = code
    .slice(offset)
    .replace(/"[^"]*"|\{[^}]*\}|'[^']*'/g, '')

  const isInStartTag = /^[^<>]*>/.test(codeStripStrings)

  return isInStartTag
}

export function isVueWithPug(code: string, id: string): boolean {
  return id.endsWith('.vue') && pugTemplateRe.test(code)
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
