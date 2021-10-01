import type { Plugin } from 'vite'
import { FilterPattern, createFilter } from '@rollup/pluginutils'
import { resolveConfig } from './options'
import { createGenerator, NanowindUserConfig } from '.'

export interface NanowindUserOptions extends NanowindUserConfig {
  include?: FilterPattern
  exclude?: FilterPattern
}

export default function NanowindVueVitePlugin(config: NanowindUserOptions = {}): Plugin {
  const resolved = resolveConfig(config)
  const generate = createGenerator(resolved)

  const filter = createFilter(
    config.include || [/\.vue$/],
    config.exclude || [/[\/\\]node_modules[\/\\]/, /[\/\\]dist[\/\\]/],
  )

  return {
    name: 'nanowind',
    enforce: 'pre',
    transform(code, id) {
      if (!filter(id))
        return

      const style = generate(code)
      if (!style)
        return null

      return {
        code: `${code}\n<style scoped>${style}</style>`,
        map: null,
      }
    },
  }
}
