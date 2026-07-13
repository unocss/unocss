import type { Compiler, Module } from '@rspack/core'
import type { NativeContext } from './context'

const CACHE_RECOVERY_CONCURRENCY = 8

export async function restoreCachedModules(
  compiler: Compiler,
  context: NativeContext,
  modules: Iterable<Module>,
): Promise<void> {
  if (!compiler.options.cache || !compiler.inputFileSystem)
    return

  const files = new Set<string>()
  for (const module of modules) {
    const resource = (module as Module & { resource?: string }).resource
    if (!resource || context.hasModule(resource))
      continue
    const file = resource.replace(/\?.*$/, '')
    if (file.includes('.unocss-rsbuild') || !context.filter.shouldExtract(file))
      continue
    files.add(file)
  }

  const queue = [...files]
  let index = 0
  const worker = async () => {
    while (index < queue.length) {
      const file = queue[index++]
      await context.transformModule(await readModule(compiler, file), file)
    }
  }
  await Promise.all(Array.from(
    { length: Math.min(CACHE_RECOVERY_CONCURRENCY, queue.length) },
    worker,
  ))
}

function readModule(compiler: Compiler, file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    compiler.inputFileSystem!.readFile(file, (error, content) => {
      if (error)
        reject(error)
      else
        resolve(content?.toString() ?? '')
    })
  })
}
