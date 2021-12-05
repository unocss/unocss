import type { Plugin } from 'vite'
import { UnocssPluginContext } from '../../../plugins-common'
import { PerModuleModePlugin } from './per-module'

export function SvelteScopedPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { uno, ready } = ctx

  return [
    {
      name: 'unocss:svelte-scoped',
      enforce: 'pre',
      async configResolved() {
        await ready

        uno.config.blocklist = uno.config.blocklist || []
        // remove global styles and attribute styles
        if (uno.config.blocklist.length === 0)
          uno.config.blocklist.push(/^\.\\!/, /^\[/)
      },
    },
    PerModuleModePlugin(ctx),
  ]
}
