import type { Highlighter, Lang } from 'shiki'
import { getHighlighter, setCDN } from 'shiki'

setCDN('/shiki/')

export const shiki = ref<Highlighter>()

getHighlighter({
  themes: [
    'vitesse-dark',
    'vitesse-light',
  ],
  langs: [
    'css',
    'javascript',
  ],
})
  .then(i => shiki.value = i)

export function highlight(code: string, lang: Lang) {
  if (!shiki.value)
    return code
  return shiki.value.codeToHtml(code, {
    lang,
    theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
  })
}

export function highlightCSS(code: string) {
  return highlight(code.trim(), 'css')
}

export function highlightJS(code: string) {
  return highlight(code, 'javascript')
}
