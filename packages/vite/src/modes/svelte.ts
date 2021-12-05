import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, UnocssPluginContext } from '../../../plugins-common'

export function SveltePlugin({ uno, ready }: UnocssPluginContext): Plugin[] {
  let filter = createFilter([/\.svelte$/], defaultExclude)
  const regexp = [/(class:(.+)={)/g, /(class:(.+)\s|>)/g]
  return [
    {
      name: 'unocss:svelte',
      enforce: 'pre',
      async configResolved() {
        const { config } = await ready
        filter = createFilter(
          config.include || [/\.svelte$/],
          config.exclude || defaultExclude,
        )
        uno.config.extractors = uno.config.extractors || []
        uno.config.extractors.push({
          name: 'unocss:svelte-class-extractor',
          async extract({ code }) {
            let result = code.match(regexp[0])
            const entries = new Set<string>()
            if (result) {
              result.forEach((r) => {
                entries.add(r.slice(6, r.length - 2))
              })
            }

            result = code.match(regexp[1])
            if (result) {
              result.forEach((r) => {
                entries.add(r.trim())
              })
            }

            return entries.size > 0 ? entries : undefined
          },
          order: 0,
        })

        uno.config.blocklist = uno.config.blocklist || []
        // remove global styles and attribute styles
        if (uno.config.blocklist.length === 0)
          uno.config.blocklist.push(/^\.\\!//*, /^\[/ */)
      },
      transform(code, id) {
        if (!filter(id))
          return

        return code.includes('@unocss-include')
          ? code
          : `<!-- @unocss-include -->
${code}`
      },
    },
  ]
}
