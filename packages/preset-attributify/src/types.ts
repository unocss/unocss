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

  /**
   * Non-valued attributes will also match if the actual value represented in DOM is `true`.
   * This option exists for supporting frameworks that encodes non-valued attributes as `true`.
   * Enabling this option will break rules that ends with `true`.
   *
   * @default false
   */
  trueToNonValued?: boolean
}
