import type { LoaderContext } from './types'
import { getContext, transformAll } from './context'

export default function unocssSourceLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const id = this.resourcePath

  ;(async () => {
    const { ctx } = await getContext(this.rootContext)

    // rerun on config edit
    for (const file of ctx.getConfigFileList())
      this.addDependency(file)

    const result = await transformAll(ctx, source, id)
    callback(null, result?.code ?? source, result?.map)
  })().catch(callback)
}
