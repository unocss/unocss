import type { TwoslashGenericFunction } from 'twoslash-protocol'
import { join } from 'node:path'
import { createSyncFn } from 'synckit'
import { distDir } from './dirs'

export interface CreateTwoslashUnoCSSOptions {
  /**
   * Path to UnoCSS config file
   */
  configPath?: string
  /**
   * Custom code transform before sending to UnoCSS for generate
   *
   * This does not affect the code rendering
   */
  preprocess?: (code: string) => string
}

let syncFn: ReturnType<typeof createSyncFn> | null = null

function getSyncFn() {
  if (!syncFn)
    syncFn = createSyncFn(join(distDir, 'worker.mjs'))
  return syncFn
}

export function createTwoslasher(options: CreateTwoslashUnoCSSOptions = {}): TwoslashGenericFunction {
  const { preprocess = code => code, configPath } = options
  const fn = getSyncFn()

  return (code, filename) => fn(preprocess(code), filename, configPath)
}
