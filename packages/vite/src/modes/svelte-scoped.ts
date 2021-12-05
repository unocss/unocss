import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { UnocssPluginContext, defaultExclude } from '../../../plugins-common'
import { PerModuleModePlugin } from './per-module'

export function SvelteScopedPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { uno, ready } = ctx
  let preFilter = createFilter([/\.svelte$/], defaultExclude)

  return [
    {
      name: 'unocss:svelte-scoped',
      enforce: 'pre',
      async configResolved() {
        const { config } = await ready

        uno.config.blocklist = uno.config.blocklist || []
        // remove global styles and attribute styles
        if (uno.config.blocklist.length === 0)
          uno.config.blocklist.push(/^\.\\!/, /^\[/)

        preFilter = createFilter(
          config.include || [/\.svelte$/],
          config.exclude || defaultExclude,
        )
      },
      transform(code, id) {
        if (!preFilter(id))
          return

        return `<!-- @unocss-include -->\n${code}`
      },
    },
    PerModuleModePlugin(ctx),
  ]
}
