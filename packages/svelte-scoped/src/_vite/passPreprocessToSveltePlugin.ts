import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import UnocssSveltePreprocess from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'

export function PassPreprocessToSveltePlugin(options: UnocssSvelteScopedViteOptions = {}, ctx: SvelteScopedContext): Plugin {
  let commandIsBuild = true
  const isBuild = () => commandIsBuild

  return {
    name: 'unocss:svelte-scoped:pass-preprocess',
    enforce: 'pre',

    configResolved({ command }) {
      commandIsBuild = command === 'build'
    },

    api: {
      sveltePreprocess: UnocssSveltePreprocess(options, ctx, isBuild),
    },
  }
}

// reference: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#how-do-i-add-a-svelte-preprocessor-from-a-vite-plugin
