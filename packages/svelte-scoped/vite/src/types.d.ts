import type { UnoGenerator, UserConfig } from "@unocss/core";
import type { UnocssSveltePreprocessOptions } from '../../preprocessor/src/types'

export interface SvelteScopedContext {
  uno: UnoGenerator<{}>
  ready: Promise<UserConfig<{}>>
}

export interface UnocssSvelteScopedViteOptions extends UnocssSveltePreprocessOptions {
  /**
   * Prefix for compiled class names
   * @default 'uno-'
  */
  classPrefix?: string
  /**
   * Add Tailwind reset to the beginning of the global stylesheet
   * @default undefined
   */
  addReset?: 'tailwind' | undefined
  /**
   * When building a component library using `@unocss/svelte-scoped/preprocessor` you can also use `@unocss/svelte-scoped/vite` with this set to `true` to add needed global styles for your library demo app: resets, preflights, and safelist
   * @default false
  */
  onlyGlobal?: boolean
}
