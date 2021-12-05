import { UserConfig } from '@unocss/core'

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
   * - `svelte` - generate a single CSS sheet for entire Svelte/SvelteKit App
   * - `shadow-dom` - generate a CSS sheet for each module for `webcomponents shadow-dom`
   *
   * @default 'global'
   */
  mode?: 'global' | 'per-module' | 'vue-scoped' | 'svelte' | 'shadow-dom' | 'dist-chunk'
}
