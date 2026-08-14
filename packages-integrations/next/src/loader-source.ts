import type { LoaderContext } from './types'
import { applyTransformers } from '#integration/transformers'
import { getContext, reloadIfConfigChanged } from './context'

// Rewrites module source so the markup the browser receives matches the CSS
// `loader-css` generates. Both run `applyTransformers` over the same config, so
// they agree across Turbopack's isolated workers with no shared state.

const mtimes = new Map<string, number>()

export default function unocssSourceLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const id = this.resourcePath
  const options = this.getOptions?.() ?? {}

  ;(async () => {
    const ctx = getContext(options)
    await ctx.ready
    await reloadIfConfigChanged(ctx, mtimes)

    // Turbopack re-runs this loader when a declared dependency changes, so a
    // config edit invalidates every module transformed under the old config.
    for (const file of ctx.getConfigFileList())
      this.addDependency?.(file)

    // `content.pipeline`, `@unocss-ignore` and `@unocss-include` all resolve
    // here, the same as in the Vite and Webpack integrations.
    if (!ctx.filter(source, id))
      return callback(null, source)

    const pre = await applyTransformers(ctx, source, id, 'pre')
    const def = await applyTransformers(ctx, pre?.code ?? source, id, 'default')
    const post = await applyTransformers(ctx, def?.code ?? pre?.code ?? source, id, 'post')

    const result = post ?? def ?? pre
    callback(null, result?.code ?? source, result?.map)
  })().catch(callback)
}
