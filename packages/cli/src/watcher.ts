import type { FSWatcher } from 'chokidar'
import type { CliOptions } from './types'

let watcher: FSWatcher

export const getWatcher = async (options?: CliOptions) => {
  // test case entry without options
  if (watcher && !options)
    return watcher

  const { watch } = await import('chokidar')
  const ignored = ['**/{.git,node_modules}/**']
  // cli may create multiple watchers
  const newWatcher = watch(options?.patterns as string[], {
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored,
    cwd: options?.cwd || process.cwd(),
  })
  watcher = newWatcher
  return newWatcher
}
