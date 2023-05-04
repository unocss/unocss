import type { Highlighter, Lang } from 'shiki'

export const shiki = ref<Highlighter>()

import('shiki')
  .then(async (r) => {
    r.setCDN('/interactive/shiki/')
    shiki.value = await r.getHighlighter({
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
