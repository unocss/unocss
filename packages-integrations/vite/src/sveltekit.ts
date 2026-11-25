import type { Plugin } from 'vite'

const SVELTEKIT_PLUGIN_PREFIX = 'vite-plugin-sveltekit'

/**
 * SvelteKit renders HTML from `src/app.html` itself, so Vite's `transformIndexHtml`
 * hook never runs there, and SvelteKit warns about every plugin that defines it.
 * Drop the hook from UnoCSS plugins when SvelteKit is present. This runs as a `pre`
 * `configResolved` hook so it happens before SvelteKit's own check.
 */
export function SvelteKitCompatPlugin(plugins: (Plugin | undefined)[]): Plugin {
  return {
    name: 'unocss:sveltekit-compat',
    configResolved: {
      order: 'pre',
      handler(config) {
        if (!config.plugins.some(p => p.name?.startsWith(SVELTEKIT_PLUGIN_PREFIX)))
          return
        for (const plugin of plugins) {
          if (plugin?.transformIndexHtml)
            delete plugin.transformIndexHtml
        }
      },
    },
  }
}
