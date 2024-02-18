import type { HighlighterCore } from 'shiki/core'
import { getHighlighterCore } from 'shiki/core'
import vitesseDark from 'shiki/themes/vitesse-dark.mjs'
import vitesseLight from 'shiki/themes/vitesse-light.mjs'
import langCss from 'shiki/langs/css.mjs'
import langJs from 'shiki/langs/javascript.mjs'

export const shiki = computedAsync<HighlighterCore>(async () => {
  return await getHighlighterCore({
    loadWasm: () => import('shiki/wasm'),
    themes: [
      vitesseDark,
      vitesseLight,
    ],
    langs: [
      langCss,
      langJs,
    ],
  })
})

export function highlight(code: string, lang: 'css' | 'javascript') {
  if (!shiki.value)
    return code
  return shiki.value.codeToHtml(code, {
    lang,
    defaultColor: false,
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
  })
}

export function highlightCSS(code: string) {
  return highlight(code.trim(), 'css')
}

export function highlightJS(code: string) {
  return highlight(code, 'javascript')
}
