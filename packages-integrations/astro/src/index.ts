import type { UnocssPluginContext, UserConfigDefaults } from '@unocss/core'
import type { UnocssVitePluginAPI, VitePluginConfig } from '@unocss/vite'
import type { AstroIntegration } from 'astro'
import type { Plugin } from 'vite'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import VitePlugin from '@unocss/vite'
import { normalizePath } from 'vite'

const UNO_INJECT_ID = 'uno-astro'
const WIND3_RESET_CSS = '@unocss/reset/tailwind.css'

/**
 * When presetWind4 is detected in the resolved config, remove the Wind 3 reset
 * injection (`@unocss/reset/tailwind.css`) from the injects array, since Wind 4
 * handles its own reset via the preflight system.
 */
async function reconcileResetInjects(
  ctx: UnocssPluginContext<VitePluginConfig>,
  injects: string[],
) {
  const config = await ctx.getConfig()
  const hasWind4 = config.presets?.some((p: any) => p.name === '@unocss/preset-wind4')
  if (hasWind4) {
    const resetIndex = injects.findIndex(s => s.includes(WIND3_RESET_CSS))
    if (resetIndex !== -1)
      injects.splice(resetIndex, 1)
  }
}

interface AstroVitePluginOptions {
  injects: string[]
}

function AstroVitePlugin(options: AstroVitePluginOptions): Plugin {
  const { injects } = options
  let root: string
  let ctx: UnocssPluginContext<VitePluginConfig>

  return {
    name: 'unocss:astro',
    enforce: 'pre',
    async configResolved(config) {
      root = config.root

      const api = config.plugins.find(i => i.name === 'unocss:api')?.api as UnocssVitePluginAPI | undefined
      if (!api) {
        throw new Error('[@unocss/astro] Unable to find UnoCSS Vite plugin API.')
      }
      ctx = api.getContext()
      await reconcileResetInjects(ctx, injects)
    },
    async resolveId(id, importer) {
      const { RESOLVED_ID_RE } = await ctx.getVMPRegexes()

      if (RESOLVED_ID_RE.test(id)) {
        // https://github.com/withastro/astro/blob/087270c61fd5c91ddd37db5c8fd93a8a0ef41f94/packages/astro/src/core/util.ts#L91-L93
        // Align data-astro-dev-id with data-vite-dev-id to fix https://github.com/unocss/unocss/issues/2513
        return this.resolve(normalizePath(join(root, id)), importer, { skipSelf: true })
      }

      if (id === UNO_INJECT_ID)
        return id
    },
    load(id) {
      if (id.endsWith(UNO_INJECT_ID))
        return injects.join('\n')
    },
  }
}

export interface AstroIntegrationConfig<Theme extends object = object> extends VitePluginConfig<Theme> {
  /**
   * Include reset styles
   * When passing `true`, `@unocss/reset/tailwind.css` will be used
   *
   * Note: When using `presetWind4`, the reset is handled by the preset itself
   * via `preflights.reset` (enabled by default). In this case, the old Wind 3
   * reset (`@unocss/reset/tailwind.css`) will not be injected even if this
   * option is `true`.
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
            : WIND3_RESET_CSS
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
            plugins: [
              AstroVitePlugin({
                injects,
              }) as any,
              ...VitePlugin(options, defaults),
            ],
          },
        })

        if (injects?.length)
          injectScript('page-ssr', `import ${JSON.stringify(UNO_INJECT_ID)}`)
      },
    },
  }
}
