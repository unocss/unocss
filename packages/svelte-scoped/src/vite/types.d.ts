import type { UnocssSveltePreprocessOptions } from '../preprocess/types'

export interface UnocssSvelteScopedViteOptions extends UnocssSveltePreprocessOptions {
  /**
   * Prefix for compiled class names
   * @default 'uno-'
  */
  classPrefix?: string
  /**
   * Inject reset to the beginning of the global stylesheet. 
   * 
   * You can pass one of the included resets from [@unocss/reset](https://unocss.dev/guide/style-reset): 
   * - `@unocss/reset/normalize.css`
   * - `@unocss/reset/eric-meyer.css`
   * - `@unocss/reset/sanitize/sanitize.css` 
   * - `@unocss/reset/tailwind.css` 
   * - `@unocss/reset/tailwind-compat.css`
   * 
   * You can pass your own custom reset by passing the filepath relative to your project root as in `./src/reset.css`
   * 
   * You can install a package then pass a path to the CSS file in your node_modules as in `@bob/my-tools/reset.css`.
   * @default undefined
   */
  injectReset?: string
  /**
   * When building a component library using `@unocss/svelte-scoped/preprocessor` you can also use `@unocss/svelte-scoped/vite` with this set to `true` to add needed global styles for your library demo app: resets, preflights, and safelist
   * @default false
  */
  onlyGlobal?: boolean
}
