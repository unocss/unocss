export interface AttributifyOptions {
  /**
   * @default 'mw-'
   */
  prefix?: string

  /**
   * Only match for prefixed attributes
   *
   * @default false
   */
  prefixedOnly?: boolean

  /**
   * Support matching non-valued attributes
   *
   * For example
   * ```html
   * <div mt-2 />
   * ```
   *
   * @default true
   */
  nonValuedAttribute?: boolean
}
