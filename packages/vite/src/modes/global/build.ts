import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from '../../utils'
import { Context } from '../../context'
import { PLACEHOLDER, PLACEHOLDER_RE, VIRTUAL_ENTRY_DEFAULT, VIRTUAL_ENTRY_ALIAS } from './shared'

export function GlobalModeBuildPlugin({ uno, config, scan, tokens }: Context): Plugin[] {
  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const tasks: Promise<any>[] = []
  const entry = config.__virtualModuleEntry || VIRTUAL_ENTRY_DEFAULT

  return [
    {
      name: 'unocss:global:build:scan',
      apply: 'build',
      enforce: 'pre',
      transform(code, id) {
        if (filter(id))
          tasks.push(scan(code, id))

        return null
      },
      transformIndexHtml: {
        enforce: 'pre',
        transform(code, { path }) {
          tasks.push(scan(code, path))
        },
      },
      resolveId(id) {
        return VIRTUAL_ENTRY_ALIAS.includes(id)
          ? entry
          : null
      },
      async load(id) {
        if (id !== entry)
          return null
        return PLACEHOLDER
      },
    },
    {
      name: 'unocss:global:build:generate',
      apply(options, { command }) {
        return command === 'build' && !options.build?.ssr
      },
      enforce: 'post',
      async generateBundle(options, bundle) {
        const files = Object.keys(bundle)
          .filter(i => i.endsWith('.css'))

        if (!files.length)
          return

        await Promise.all(tasks)
        const { css } = await uno.generate(tokens, undefined, { layerComments: false })
        let replaced = false

        if (!css)
          return

        for (const file of files) {
          const chunk = bundle[file]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            if (PLACEHOLDER_RE.test(chunk.source)) {
              chunk.source = chunk.source.replace(PLACEHOLDER_RE, css)
              replaced = true
            }
          }
        }

        if (!replaced)
          this.error(new Error('[unocss] does not found CSS placeholder in the generated chunks,\nthis is likely an internal bug of unocss vite plugin'))
      },
    },
  ]
}
