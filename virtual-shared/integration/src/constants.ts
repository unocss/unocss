export const INCLUDE_COMMENT = '@unocss-include'
export const IGNORE_COMMENT = '@unocss-ignore'
export const INCLUDE_COMMENT_IDE = '@unocss-ide-include'
export const CSS_PLACEHOLDER = '@unocss-placeholder'
export const SKIP_START_COMMENT = '@unocss-skip-start'
export const SKIP_END_COMMENT = '@unocss-skip-end'
// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-useless-lazy, regexp/optimal-quantifier-concatenation
export const SKIP_COMMENT_RE = new RegExp(`(\/\/\\s*?${SKIP_START_COMMENT}\\s*?|\\/\\*\\s*?${SKIP_START_COMMENT}\\s*?\\*\\/|<!--\\s*?${SKIP_START_COMMENT}\\s*?-->)[\\s\\S]*?(\/\/\\s*?${SKIP_END_COMMENT}\\s*?|\\/\\*\\s*?${SKIP_END_COMMENT}\\s*?\\*\\/|<!--\\s*?${SKIP_END_COMMENT}\\s*?-->)`, 'g')

export const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?::(.+))?\.css(\?.*)?$/,
]
export const LAYER_MARK_ALL = '__ALL__'

class ResolvedIdRegexes {
  private static cache = new Map<string, { RESOLVED_ID_WITH_QUERY_RE: RegExp, RESOLVED_ID_RE: RegExp }>()
  private static _defaultPrefix = '__uno'
  private static _currentPrefix: string | undefined

  private static createRegexes(prefix: string): { RESOLVED_ID_WITH_QUERY_RE: RegExp, RESOLVED_ID_RE: RegExp } {
    return {
      RESOLVED_ID_WITH_QUERY_RE: new RegExp(`[/\\\\]${prefix}(_.*?)?\\.css(\\?.*)?$`),
      RESOLVED_ID_RE: new RegExp(`[/\\\\]${prefix}(?:_(.*?))?\\.css$`),
    }
  }

  static get(): { RESOLVED_ID_WITH_QUERY_RE: RegExp, RESOLVED_ID_RE: RegExp } {
    const prefix = this._currentPrefix || this._defaultPrefix

    if (!this.cache.has(prefix)) {
      this.cache.set(prefix, this.createRegexes(prefix))
    }

    return this.cache.get(prefix)!
  }

  static set(prefix: string = this._defaultPrefix): void {
    if (typeof prefix !== 'string') {
      throw new TypeError('prefix must be a non-empty string')
    }
    this.cache.set(prefix, this.createRegexes(prefix))
    // 设置当前使用的前缀
    this._currentPrefix = prefix
  }

  static currentPrefix(): string {
    return this._currentPrefix || this._defaultPrefix
  }
}

export { ResolvedIdRegexes }
