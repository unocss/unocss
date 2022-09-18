import type { UserConfig } from '@unocss/core'

export interface VitePluginConfig<Theme extends {} = {}> extends UserConfig<Theme> {
  /**
   * Enable UnoCSS inspector
   *
   * @default true
   */
  inspector?: boolean

  /**
   * CSS Generation mode
   *
   * - `global` - generate a single CSS sheet for entire App
   * - `dist-chunk` - generate a CSS sheet for each code chunk on build, great for MPA
   * - `per-module` - generate a CSS sheet for each module, can be scoped
   * - `vue-scoped` - inject generated CSS to Vue SFC's `<style scoped>` for isolation
   * - `svelte-scoped` - inject generated CSS to Svelte's `<style>` for isolation
   * - `shadow-dom` - inject generated CSS to `Shadow DOM` css style block for each web component
   *
   * @default 'global'
   */
  mode?: 'global' | 'per-module' | 'vue-scoped' | 'svelte-scoped' | 'dist-chunk' | 'shadow-dom'
  /**
   * Transform CSS for `@apply` directive
   *
   * @experimental
   * @default false
   */
  transformCSS?: boolean | 'pre' | 'post'
  /**
   *
   * make the generated css processed by postcss (https://vitejs.dev/guide/features.html#postcss)
   * @default true
   */
  postcss?: boolean
}
