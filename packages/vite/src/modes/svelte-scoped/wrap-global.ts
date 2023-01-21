// First group: negative lookbehind to make sure not preceded by a digit or open parenthesis as seen in `animate-bounce`
// Second group captures selector starting with either a right bracket as in [dir="rtl"] or a period as in normal selectors, followed by consuming just the next set of brackets with content (lazy)
// if needing to wrap a class starting with a colon as in ":not(...)" then need to avoid grabbing colons from media queries like `@media (min-width: 640px){.uno-28lpzl{margin-bottom:0.5rem;}}`
// setting uno.generate's minify option to true means we don't need to worry about avoiding getting tangled up in layer comments like /* layer: shortcuts */
// Third group captures styles
const SELECTOR_REGEX = /(?<![\d(])([[\.][\S\s]+?)({[\S\s]+?})/g

export function wrapSelectorsWithGlobal(css: string) {
  return css.replace(SELECTOR_REGEX, ':global($1)$2')
}
