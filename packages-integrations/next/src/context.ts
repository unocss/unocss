import type { UnocssPluginContext } from '@unocss/core'
import type { NextPluginOptions } from './types'
import process from 'node:process'
import { createContext } from '#integration/context'

/**
 * Turbopack runs every loader in its own worker process, so a context is shared
 * within a worker and rebuilt per worker. Both loaders derive their results from
 * the same config, which is what keeps the markup and the CSS in agreement
 * without any cross-process state.
 */
let cached: { key: string, ctx: UnocssPluginContext } | undefined

export function getContext(options: NextPluginOptions = {}): UnocssPluginContext {
  const root = options.root ?? process.cwd()
  const key = `${root}:${typeof options.config === 'string' ? options.config : ''}`

  if (cached?.key !== key) {
    const ctx = createContext(options.config as any, {
      envMode: process.env.NODE_ENV === 'development' ? 'dev' : 'build',
    })
    ctx.updateRoot(root)
    cached = { key, ctx }
  }

  return cached.ctx
}

/**
 * Turbopack re-runs a loader when a declared dependency changes, but the worker
 * process it runs in may be reused. Reload so an edited config takes effect
 * within a warm worker as well.
 */
export async function reloadIfConfigChanged(ctx: UnocssPluginContext, mtimes: Map<string, number>) {
  const { statSync } = await import('node:fs')
  let changed = false

  for (const file of ctx.getConfigFileList()) {
    let mtime = 0
    try {
      mtime = statSync(file).mtimeMs
    }
    catch {
      // a removed config file counts as a change
    }
    if (mtimes.get(file) !== mtime) {
      changed = mtimes.size > 0
      mtimes.set(file, mtime)
    }
  }

  if (changed)
    await ctx.reloadConfig()
}
