import type { FSWatcher } from 'chokidar'
import type { CliOptions } from './types'
import process from 'node:process'
import { resolve } from 'pathe'

let watcher: FSWatcher

export async function getWatcher(options?: CliOptions) {
  // test case entry without options
  if (watcher && !options)
    return watcher

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
