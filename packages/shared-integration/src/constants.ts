export const INCLUDE_COMMENT = '@unocss-include'
export const IGNORE_COMMENT = '@unocss-ignore'
export const INCLUDE_COMMENT_IDE = '@unocss-ide-include'
export const CSS_PLACEHOLDER = '@unocss-placeholder'
export const SKIP_START_COMMENT = '@unocss-skip-start'
export const SKIP_END_COMMENT = '@unocss-skip-end'
// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-useless-lazy, regexp/optimal-quantifier-concatenation
export const SKIP_COMMENT_RE = new RegExp(`(\/\/\\s*?${SKIP_START_COMMENT}\\s*?|\\/\\*\\s*?${SKIP_START_COMMENT}\\s*?\\*\\/|<!--\\s*?${SKIP_START_COMMENT}\\s*?-->)[\\s\\S]*?(\/\/\\s*?${SKIP_END_COMMENT}\\s*?|\\/\\*\\s*?${SKIP_END_COMMENT}\\s*?\\*\\/|<!--\\s*?${SKIP_END_COMMENT}\\s*?-->)`, 'g')
