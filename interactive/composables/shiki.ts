import type { HighlighterCore } from 'shikiji/core'
import { getHighlighterCore } from 'shikiji/core'
import vitesseDark from 'shikiji/themes/vitesse-dark.mjs'
import vitesseLight from 'shikiji/themes/vitesse-light.mjs'
import langCss from 'shikiji/langs/css.mjs'
import langJs from 'shikiji/langs/javascript.mjs'

export const shiki = computedAsync<HighlighterCore>(async () => {
  return await getHighlighterCore({
    loadWasm: () => import('shikiji/wasm').then(r => r.getWasmInlined()),
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
