import type { LoadConfigResult } from '@unocss/config'
import type { UnoGenerator, UserConfig } from '@unocss/core'

export interface TransformClassesOptions {
  /**
   * Prefix for compiled class names. Distinct between `@unocss/svelte-scoped/vite` and `@unocss/svelte-scoped/preprocessor` to avoid bugs when using a component library built with `@unocss/svelte-scoped/preprocessor` in a project using `@unocss/svelte-scoped/vite`.
   * @default 'uno-' // `@unocss/svelte-scoped/vite`
   * @default 'usp-' // `@unocss/svelte-scoped/preprocessor`
   */
  classPrefix?: string
  /**
   * Add hash and combine recognized tokens (optimal for production); set false in dev mode for easy dev tools toggling to allow for design adjustments in the browser
   * @default true
   */
  combine?: boolean
  /**
   * Used to generate hash for compiled class names
   */
  hashFn?: (str: string) => string
}

export interface TransformApplyOptions {
  /**
   * Transform CSS custom properties (recommended for CSS syntax compatibility) or @apply directives.
   *
   * Pass `false` to disable.
   *
   * @default ['--at-apply', '@apply']
   */
  applyVariables?: string | string[] | false
}

export interface TransformDirectivesOptions {
  /**
   * Transform the `theme()` directive (recommended for CSS syntax compatibility).
   *
   * Disable for TailwindCss compatibility.
   *
   * Pass `false` to disable.
   *
   * @default true
   */
  transformThemeDirective?: boolean
}

export interface SvelteScopedContext {
  uno: UnoGenerator
  ready: Promise<LoadConfigResult<UserConfig>>
}
