import type { Compiler } from '@rspack/core'
import type { FSWatcher } from 'chokidar'
import type { NativeContext } from './context'
import { watch } from 'chokidar'

export class ExternalContentWatcher {
  private watcher: FSWatcher | undefined

  private synchronized = false

  private timer: ReturnType<typeof setTimeout> | undefined

  private readonly pendingChanges = new Set<string>()

  constructor(
    private readonly compiler: Compiler,
    private readonly context: NativeContext,
    private readonly enabled: boolean,
  ) {}

  async ensure(): Promise<void> {
    if (!this.synchronized)
      await this.sync()
  }

  async sync(): Promise<void> {
    await this.close()
    if (!this.enabled) {
      this.synchronized = true
      return
    }

    const roots = [...this.context.filesystemWatchRoots]
    if (!roots.length) {
      this.synchronized = true
      return
    }

    const poll = this.compiler.options.watchOptions.poll
    const watcher = watch(roots, {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored: ['**/{.git,node_modules}/**'],
      interval: typeof poll === 'number' ? poll : undefined,
      usePolling: Boolean(poll),
    })
    this.watcher = watcher
    watcher.on('all', (event, file) => this.handleFileEvent(event, file))
    try {
      await new Promise<void>((resolve, reject) => {
        watcher.once('ready', resolve)
        watcher.once('error', reject)
      })
      this.synchronized = true
    }
    catch (error) {
      await this.close()
      throw error
    }
  }

  async close(): Promise<void> {
    this.synchronized = false
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = undefined
    this.pendingChanges.clear()
    const watcher = this.watcher
    this.watcher = undefined
    await watcher?.close()
  }

  private handleFileEvent(event: string, file: string): void {
    if (!this.context.matchesFilesystemFile(file))
      return

    if (event !== 'add' || this.context.filesystemFiles.has(file))
      return

    this.pendingChanges.add(file)

    if (this.timer)
      clearTimeout(this.timer)
    // Coalesce rapid filesystem events into one Rspack invalidation.
    this.timer = setTimeout(() => this.invalidate(), 10)
  }

  private invalidate(): void {
    this.timer = undefined
    const changes = new Set(this.pendingChanges)
    this.pendingChanges.clear()
    this.compiler.watching?.invalidateWithChangesAndRemovals(changes, new Set())
  }
}
