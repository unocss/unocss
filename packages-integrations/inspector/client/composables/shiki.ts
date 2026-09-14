import type { HighlighterCore } from 'shiki/core'

let highlighterPromise: Promise<HighlighterCore> | undefined

/**
 * Minimal client-bundled Shiki: the CSS grammar (the only language
 * `ShikiCode` renders), the vitesse dual themes, and the JavaScript regex
 * engine — no wasm, no server round-trip. Dynamic imports keep it all out
 * of the entry chunk until the first highlight.
 */
async function loadHighlighter(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ])
  return createHighlighterCore({
    themes: [
      import('shiki/themes/vitesse-light.mjs'),
      import('shiki/themes/vitesse-dark.mjs'),
    ],
    langs: [
      import('shiki/langs/css.mjs'),
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
}

/**
 * Highlight code to dual-theme HTML (`--shiki-dark` variables, light as the
 * default color). Languages without a bundled grammar render as plain text.
 */
export async function shikiHighlight(code: string, lang: string): Promise<string> {
  const highlighter = await (highlighterPromise ??= loadHighlighter())
  const resolved = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
  return highlighter.codeToHtml(code, {
    lang: resolved,
    themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
  })
}
