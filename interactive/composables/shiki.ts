import type { BuiltinLanguage, Highlighter } from 'shikiji'
import { getHighlighter } from 'shikiji'

export const shiki = computedAsync<Highlighter>(async () => {
  return await getHighlighter({
    themes: [
      'vitesse-dark',
      'vitesse-light',
    ],
    langs: [
      'css',
      'javascript',
    ],
  })
})

export function highlight(code: string, lang: BuiltinLanguage) {
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
