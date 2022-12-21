import { resolve } from 'path'
import { fileURLToPath } from 'url'
import type { AstroIntegration } from 'astro'
import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import type { UserConfigDefaults } from '@unocss/core'

export interface AstroIntegrationConfig<Theme extends {} = {}> extends VitePluginConfig<Theme> {
  /**
   * Include reset styles
   * When passing `true`, `@unocss/reset/tailwind.css` will be used
   * @default true
   */
  injectReset?: string | boolean

  /**
   * Inject UnoCSS entry import for every astro page
   * @default true
   */
  injectEntry?: boolean | string

  /**
   * Inject extra imports for every astro page
   * @default []
   */
  injectExtra?: string[]
}

export default function UnoCSSAstroIntegration<Theme extends {}>(
  options: AstroIntegrationConfig<Theme> = {},
  defaults?: UserConfigDefaults,
): AstroIntegration {
  const {
    injectEntry = true,
    injectReset: includeReset = true,
    injectExtra = [],
  } = options

  return {
    name: 'unocss',
    hooks: {
      'astro:config:setup': async ({ config, injectScript }) => {
        // Adding components to UnoCSS's extra content
        options.extraContent ||= {}
        options.extraContent.filesystem ||= []
        options.extraContent.filesystem.push(resolve(fileURLToPath(config.root), 'src/components/**/*').replace(/\\/g, '/'))

        config.vite.plugins ||= []
        config.vite.plugins.push(...VitePlugin(options, defaults) as any)

        const injects: string[] = []
        if (includeReset) {
          const resetPath = typeof includeReset === 'string'
            ? includeReset
            : '@unocss/reset/tailwind.css'
          injects.push(`import "${resetPath}"`)
        }
        if (injectEntry) {
          injects.push(typeof injectEntry === 'string'
            ? injectEntry
            : 'import "uno.css"')
        }
        if (injectExtra.length > 0)
          injects.push(...injectExtra)
        if (injects?.length)
          injectScript('page-ssr', injects.join('\n'))
      },
    },
  }
}
