import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import UnocssSveltePreprocess from '../preprocess'

export function PassPreprocessToSveltePlugin(context: SvelteScopedContext, options: UnocssSvelteScopedViteOptions = {}): Plugin {
  let commandIsBuild = true
  const isBuild = () => commandIsBuild

  return {
    name: 'unocss:svelte-scoped:pass-preprocess',
    enforce: 'pre',

    configResolved({ command }) {
      commandIsBuild = command === 'build'
    },

    api: {
      sveltePreprocess: UnocssSveltePreprocess(options, context, isBuild),
    },
  }
}

// reference: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#how-do-i-add-a-svelte-preprocessor-from-a-vite-plugin
