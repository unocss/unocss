import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'

export interface TransformerDirectivesOptions {
  enforce?: SourceCodeTransformer['enforce']

  /**
   * Throw an error if utils or themes are not found.
   *
   * @default true
   */
  throwOnMissing?: boolean

  /**
   * Treat CSS custom properties as @apply directives for CSS syntax compatibility.
   *
   * Pass `false` to disable.
   *
   * @default ['--at-apply', '--uno-apply', '--uno']
   */
  applyVariable?: false | string | string[]

  /**
   * Treat CSS custom properties as directives for CSS syntax compatibility.
   *
   * Pass `false` to disable, or a string to use as a prefix.
   *
   * @deprecated use `applyVariable` to specify the full var name instead.
   * @default '--at-'
   */
  varStyle?: false | string
}

export interface TransformerDirectivesContext {
  code: MagicString
  uno: UnoGenerator
  options: TransformerDirectivesOptions
  applyVariable: string[]
  offset?: number
  filename?: string
}
