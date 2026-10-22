import type { FSWatcher } from 'chokidar'
import type { ResolvedCliOptions } from './types'
import process from 'node:process'
import { resolve } from 'pathe'

let watcher: FSWatcher

export async function getWatcher(options?: ResolvedCliOptions) {
  // test case entry without options
  if (watcher && !options)
    return watcher

  if (!options)
    return { close: () => {} } as unknown as FSWatcher

  const { watch } = await import('chokidar')
  const ignored = ['**/{.git,node_modules}/**']
  const cwd = options?.cwd || process.cwd()
  const patterns = (options?.patterns as string[]).map((p) => {
    const abs = resolve(cwd, p)
    if (abs.endsWith('/**/*'))
      return abs.slice(0, -5)
    return abs
  })
  // cli may create multiple watchers
  const newWatcher = watch(patterns, {
    ignoreInitial: false,
    ignorePermissionErrors: true,
    ignored,
    usePolling: true,
    interval: 100,
  })
  watcher = newWatcher
  return newWatcher
}
