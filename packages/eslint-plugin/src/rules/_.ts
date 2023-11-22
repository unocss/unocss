import { join } from 'node:path'
import { createSyncFn } from 'synckit'
import { distDir } from '../dirs'
import type { run } from '../worker'

export type Sync<Fn extends Function> = Fn extends (...args: infer Args) => Promise<infer R> ? (...args: Args) => R : Fn

export const syncAction = createSyncFn(join(distDir, 'worker.cjs')) as Sync<typeof run>
