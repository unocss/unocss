import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { preprocess } from 'svelte/compiler'
import UnocssSveltePreprocess from '../preprocess'

export function PassPreprocessToSveltePlugin(context: SvelteScopedContext, options: UnocssSvelteScopedViteOptions = {}): Plugin {
  let preprocessor: ReturnType<typeof UnocssSveltePreprocess>

  const plugin = {
    name: 'unocss:svelte-scoped:pass-preprocess',
    enforce: 'pre',

    configResolved({ command, plugins }) {
      preprocessor = UnocssSveltePreprocess(options, context, () => command === 'build')

      // use the exact same id filter as vite-plugin-svelte itself
      const svelteIdFilter = plugins.find(p => p.name === 'vite-plugin-svelte:config')?.api.idFilter
      plugin.transform.filter = svelteIdFilter
    },

    transform: {
      filter: {
        // filled above
      },

      // after base preprocess, but before compile
      order: 'pre',

      async handler(source, id) {
        const { code, map } = await preprocess(source, preprocessor, { filename: id })

        if (typeof map === 'string')
          return { code, map }

        return { code }
      },
    },
  } satisfies Plugin

  return plugin
}

// reference: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#how-do-i-add-a-svelte-preprocessor-from-a-vite-plugin
