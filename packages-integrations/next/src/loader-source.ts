import type { LoaderContext } from './types'
import { getContext, reloadIfConfigChanged, transformAll } from './context'

const mtimes = new Map<string, number>()

/** Runs the transformers over a module, the way the Vite plugin's transform hook does. */
export default function unocssSourceLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const id = this.resourcePath

  ;(async () => {
    const ctx = getContext(this.getOptions?.() ?? {}, this.rootContext)
    await ctx.ready
    await reloadIfConfigChanged(ctx, mtimes)

    // A config edit invalidates every module transformed under the old config.
    for (const file of ctx.getConfigFileList())
      this.addDependency?.(file)

    const result = await transformAll(ctx, source, id)
    callback(null, result?.code ?? source, result?.map)
  })().catch(callback)
}
