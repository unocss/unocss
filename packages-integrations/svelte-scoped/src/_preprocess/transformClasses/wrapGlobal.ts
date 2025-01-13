const NOT_PRECEDED_BY_DIGIT_OR_OPEN_PARENTHESIS_RE = /(?<![\d(])/
// as seen in animate-bounce keyframe digits for example:
// 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }

const SELECTOR_STARTING_WITH_BRACKET_OR_PERIOD_RE = /([[.][\s\S]+?)/
// as in [dir="rtl"] or a normal selector, capturing lazily

const STYLES_RE = /(\{[\s\S]+?\})/

// eslint-disable-next-line regexp/no-super-linear-backtracking
const EXTRACT_SELECTOR_RE = new RegExp(NOT_PRECEDED_BY_DIGIT_OR_OPEN_PARENTHESIS_RE.source + SELECTOR_STARTING_WITH_BRACKET_OR_PERIOD_RE.source + STYLES_RE.source, 'g')

export function wrapSelectorsWithGlobal(css: string) {
  return css.replace(EXTRACT_SELECTOR_RE, ':global($1)$2')
}
