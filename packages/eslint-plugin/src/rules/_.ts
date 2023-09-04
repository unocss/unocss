import { join } from 'node:path'
import { createSyncFn } from 'synckit'
import { distDir } from '../dirs'
import type { run } from '../worker'

export const syncAction = createSyncFn(join(distDir, 'worker.cjs')) as typeof run
