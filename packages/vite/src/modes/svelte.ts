import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, UnocssPluginContext } from '../../../plugins-common'

export function SveltePlugin({ uno, ready }: UnocssPluginContext): Plugin[] {
  let filter = createFilter([/\.svelte$/], defaultExclude)
  const regexp = /(class:(.+)={)/g
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
            const result = code.match(regexp)
            return result
              ? result.reduce((acc, r) => {
                acc.add(r.slice(6, r.length - 2))
                return acc
              }, new Set<string>())
              : undefined
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
