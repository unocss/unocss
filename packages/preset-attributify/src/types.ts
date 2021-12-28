import type { PresetOptions } from '@unocss/core'

export interface AttributifyOptions extends PresetOptions {
  /**
   * Only generate CSS for attributify or class
   *
   * @default false
   */
  strict?: boolean

  /**
   * @default 'un-'
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

  /**
   * A list of attributes to be ignored from extracting.
   */
  ignoreAttributes?: string[]
}
