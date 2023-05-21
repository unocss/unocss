import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import UnocssSveltePreprocess from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'

export function PassPreprocessToSveltePlugin(options: UnocssSvelteScopedViteOptions = {}, ctx: SvelteScopedContext): Plugin {
  return {
    name: 'unocss:svelte-scoped:pass-preprocess',
    enforce: 'pre',

    configResolved(viteConfig) {
      options = { ...options, combine: viteConfig.command === 'build' }
    },

    api: {
      sveltePreprocess: UnocssSveltePreprocess(options, ctx),
    },
  }
}

// reference: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#how-do-i-add-a-svelte-preprocessor-from-a-vite-plugin
