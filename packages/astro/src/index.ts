import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import type { UserConfigDefaults } from '@unocss/core'
import type { Plugin, ResolvedConfig } from 'vite'

const UNO_INJECT_ID = 'uno-astro'
const UNO_QUERY_KEY = 'uno-with-astro-key'

interface AstroVitePluginOptions {
  injects: string[]
}

function AstroVitePlugin(options: AstroVitePluginOptions): Plugin {
  const { injects } = options

  let config: ResolvedConfig

  return {
    name: 'unocss:astro',
    enforce: 'pre',
    configResolved(_config) {
      config = _config
    },
    async resolveId(id, importer) {
      if (id === UNO_INJECT_ID)
        return id
      if (importer?.endsWith(UNO_INJECT_ID) && config && config.command === 'serve') {
        const resolved = await this.resolve(id, importer, { skipSelf: true })
        if (resolved) {
          const fsPath = resolved.id
          return `${fsPath}${fsPath.includes('?') ? '&' : '?'}${UNO_QUERY_KEY}`
        }
      }
    },
    load(id, options) {
      if (id.endsWith(UNO_INJECT_ID))
        return injects.join('\n')

      if (
        !options?.ssr
        && id.includes(UNO_QUERY_KEY)
        && id.includes('.css')
      )
        return ''
    },
  }
}

export interface AstroIntegrationConfig<Theme extends {} = {}> extends VitePluginConfig<Theme> {
  /**
   * Include reset styles
   * When passing `true`, `@unocss/reset/tailwind.css` will be used
   * @default false
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
    injectReset = false,
    injectExtra = [],
  } = options

  return {
    name: 'unocss',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, injectScript }) => {
        // Adding components to UnoCSS's extra content
        options.extraContent ||= {}
        options.extraContent.filesystem ||= []
        options.extraContent.filesystem.push(resolve(fileURLToPath(config.srcDir), 'components/**/*').replace(/\\/g, '/'))

        const injects: string[] = []
        if (injectReset) {
          const resetPath = typeof injectReset === 'string'
            ? injectReset
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

        updateConfig({
          vite: {
            plugins: [AstroVitePlugin({
              injects,
            }), ...VitePlugin(options, defaults)],
          },
        })

        if (injects?.length)
          injectScript('page-ssr', `import ${JSON.stringify(UNO_INJECT_ID)}`)
      },
    },
  }
}
