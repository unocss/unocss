import type { UserConfig } from '@unocss/core'

export type ServerConfig = {
  /**
   * Use `https`?.
   *
   * @default false
   */
  https: boolean
  /**
   * The host.
   */
  host: string
  /**
   * The port.
   */
  port: number
}

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
   * - `shadow-dom` - inject generated CSS to `Shadow DOM` css style block for each web component
   *
   * @default 'global'
   */
  mode?: 'global' | 'per-module' | 'vue-scoped' | 'dist-chunk' | 'shadow-dom'

  /**
   * Support for Vite application behind a frontend server.
   *
   * **WARNING**: this will work only with `mode: 'global'`.
   *
   * This allows the plugin to work for example with `PHP + Laravel + Inertia` doing request to the Vite server directly.
   * You can enable it to use the Vite configuration or provide custom one.
   * The plugin will emit a `fetch` chunk using `{ mode: 'no-cors' }` adding the `scheme`, `host` and `port` to the `fetch url`.
   *
   * @default false
   */
  frontend?: boolean | ServerConfig
}
