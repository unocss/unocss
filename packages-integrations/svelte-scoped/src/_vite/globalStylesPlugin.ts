import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin, ResolvedConfig } from 'vite'
import type { BaseVitePluginConfig } from '#integration/vite/types'
import type { UnocssSvelteScopedViteOptions } from './types'
import MagicString from 'magic-string'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { buildGlobalModeDevPlugin } from '#integration/vite/global/dev'
import { generateGlobalCss } from './global'

const MESSAGE_UNOCSS_ENTRY_NOT_FOUND
  = '[unocss] Entry module not found. Did you add `import \'virtual:uno.css\'` in your main entry?'

const HASH_LENGTH = 6

export function GlobalStylesDevPlugin(ctx: UnocssPluginContext, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Plugin[] {
  const entries = new Set<string>()

  const lastServedHashes = new Map<string, string>()
  let lastServedTime = Date.now()

  async function generateCSS(layer: string) {
    if (layer !== LAYER_MARK_ALL) {
      // We are only responsible for global styles.
      return
    }

    const css = await generateGlobalCss(ctx.uno, injectReset)
    const hash = getHash(css, HASH_LENGTH)

    lastServedHashes.set(layer, hash)
    lastServedTime = Date.now()

    return { hash, css }
  }

  return buildGlobalModeDevPlugin(
    ctx,
    generateCSS,
    lastServedHashes,
    () => lastServedTime,
    entries,
    HASH_LENGTH,
    async (entry) => {
      const layer = await resolveLayer(ctx, getPath(entry))
      // We only care about the global styles.
      return layer === LAYER_MARK_ALL
    },
    MESSAGE_UNOCSS_ENTRY_NOT_FOUND,
  )
}

export function GlobalStylesBuildPlugin(ctx: UnocssPluginContext, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Plugin {
  let generatedGlobalCss = false

  return {
    name: 'unocss:svelte-scoped:global-styles',
    apply: 'build',

    async resolveId(id, importer) {
      return await resolveId(ctx, id, importer)
    },

    async load(id) {
      const layer = await resolveLayer(ctx, getPath(id))
      if (layer === LAYER_MARK_ALL) {
        generatedGlobalCss = true

        return {
          code: await generateGlobalCss(ctx.uno, injectReset),
          map: null,
          moduleSideEffects: true,
        }
      }
    },

    buildStart() {
      generatedGlobalCss = false
    },

    async buildEnd() {
      if (!generatedGlobalCss) {
        if (
          ((await ctx.getConfig()) as BaseVitePluginConfig).checkImport
          !== false
        ) {
          this.warn(MESSAGE_UNOCSS_ENTRY_NOT_FOUND)
        }
      }
    },
  }
}

export function GlobalStylesWarnOutdatedPlugin(): Plugin {
  let isSvelteKit: boolean
  let viteConfig: ResolvedConfig

  function replaceHtmlPlaceholder(this: { warn: (msg: string) => void }, html: string) {
    // Check for outdated setup: the placeholder in index.html/app.html is no longer used. Replace it with an empty string to make it disappear.
    if (html.includes('%unocss-svelte-scoped.global%')) {
      this.warn(
        `[unocss] You are probably using an outdated setup for your ${isSvelteKit ? 'sveltekit' : 'svelte'} app. Remove the placeholder from ${isSvelteKit ? 'app.html' : 'index.html'} and import 'virtual:uno.css' in your ${isSvelteKit ? 'root layout' : 'main entry'}.`,
      )

      const s = new MagicString(html)
      s.replace('%unocss-svelte-scoped.global%', '')

      return {
        code: s.toString(),
        map: s.generateMap(),
      }
    }
  }

  return {
    name: 'unocss:svelte-scoped:global-styles:outdated',

    async configResolved(_viteConfig) {
      viteConfig = _viteConfig
      isSvelteKit = viteConfig.plugins.some(p => p.name.includes('sveltekit'))
    },

    async transform(code, id) {
      // Check for outdated setup: in the first version of the integration the user needed to supply a hook that replaced a placeholder with the final <style/> / <link/> tag.
      if (isSvelteKit && id.includes('hooks') && id.includes('server') && code.includes('unocss_svelte_scoped_global_styles')) {
        this.warn(
          `[unocss] You are probably using an outdated setup for your sveltekit app. Remove the replacement logic in your server handle hook.`,
        )
      }

      const replaced = replaceHtmlPlaceholder.call(this, code)
      if (replaced) {
        return replaced.code
      }
    },

    async transformIndexHtml(html) {
      const replaced = replaceHtmlPlaceholder.call(this, html)
      if (replaced) {
        return replaced.code
      }

      return html
    },
  }
}
