import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import type { UserConfigDefaults } from '@unocss/core'
import type { Plugin, ResolvedConfig } from 'vite'

const UNO_INJECT_ID = 'uno-astro'
const UNO_QUERY_KEY = 'uno-with-astro-key'
const astroCSSKeyRE = /(\?|\&)lang\.css/

interface AstroVitePluginOptions {
  injects: string[]
  injectReset: boolean
}

function AstroVitePlugin(options: AstroVitePluginOptions): Plugin {
  const { injects, injectReset } = options
  const resetInjectPath = injectReset ? injects[0] : undefined
  let command: ResolvedConfig['command']
  let nodeModulesPath: string
  let resetCSSInjected = false
  const resolveCSSQueue = new Set<() => void>()

  return {
    name: 'unocss:astro',
    enforce: 'pre',
    configResolved(config) {
      command = config.command
      nodeModulesPath = `${config.root}/node_modules`
    },
    async resolveId(id, importer) {
      if (id === UNO_INJECT_ID) {
        if (injectReset) {
          /**
           * When running here, means that this is a new file.
           * We need to make sure that the reset css for each file
           * needs to be loaded first.
           */
          resetCSSInjected = false
        }
        return id
      }

      if (
        injectReset && command === 'serve'
        // css need to be injected after reset style
        && astroCSSKeyRE.test(id) && !resetCSSInjected
      )
        return new Promise(resolve => resolveCSSQueue.add(() => resolve()))

      if (importer?.endsWith(UNO_INJECT_ID) && command === 'serve') {
        const resolved = await this.resolve(id, importer, { skipSelf: true })
        if (resolved) {
          const fsPath = resolved.id
          const realId = `${fsPath}${fsPath.includes('?') ? '&' : '?'}${UNO_QUERY_KEY}`

          if (injectReset) {
            if (resetInjectPath!.includes(id)) {
              // Make sure the reset style is injected first
              setTimeout(() => {
                resolveCSSQueue.forEach((res) => {
                  res()
                  resolveCSSQueue.delete(res)
                })
              })
              resetCSSInjected = true
            }
            // css need to be injected after reset style
            else if (id.includes('.css') && !resetCSSInjected) {
              return new Promise((resolve) => {
                resolveCSSQueue.add(() => resolve(realId))
              })
            }
          }

          return realId
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
        /**
         * If the module in node_modules, astro will reuse same style tag
         * @see https://github.com/unocss/unocss/issues/2655
         */
        && !id.startsWith(nodeModulesPath)
      )
        return null
    },
  }
}

export interface AstroIntegrationConfig<Theme extends object = object> extends VitePluginConfig<Theme> {
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

export default function UnoCSSAstroIntegration<Theme extends object>(
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
        const source = resolve(fileURLToPath(config.srcDir), 'components/**/*').replace(/\\/g, '/')
        options.content ||= {}
        options.content.filesystem ||= []
        options.content.filesystem.push(source)

        const injects: string[] = []
        if (injectReset) {
          const resetPath = typeof injectReset === 'string'
            ? injectReset
            : '@unocss/reset/tailwind.css'
          injects.push(`import ${JSON.stringify(resetPath)}`)
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
              injectReset: !!injectReset,
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
