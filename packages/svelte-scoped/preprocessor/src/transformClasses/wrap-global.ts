const NOT_PRECEEDED_BY_DIGIT_OR_OPEN_PARENTHESIS_RE = /(?<![\d(])/
// as seen in animate-bounce keyframe digits for example:
// 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }

const SELECTOR_STARTING_WITH_BRACKET_OR_PERIOD_RE = /([[\.][\S\s]+?)/
// as in [dir="rtl"] or a normal selector, capturing lazily

const STYLES_RE = /({[\S\s]+?})/

const EXTRACT_SELECTOR_RE = new RegExp(NOT_PRECEEDED_BY_DIGIT_OR_OPEN_PARENTHESIS_RE.source + SELECTOR_STARTING_WITH_BRACKET_OR_PERIOD_RE.source + STYLES_RE.source, 'g')

export function wrapSelectorsWithGlobal(css: string) {
  return css.replace(EXTRACT_SELECTOR_RE, ':global($1)$2')
}

// if we ever need to wrap a class starting with a colon as in ":not(...)" then we would need to avoid grabbing colons from media queries like `@media (min-width: 640px){.uno-28lpzl{margin-bottom:0.5rem;}}`
