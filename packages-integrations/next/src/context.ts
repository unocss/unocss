import type { UnocssPluginContext } from '@unocss/core'
import { statSync } from 'node:fs'
import process from 'node:process'
import { createContext } from '#integration/context'
import { applyTransformers } from '#integration/transformers'

export interface LoadedContext {
  ctx: UnocssPluginContext
  revision: number
}

interface CachedContext extends LoadedContext {
  root: string
  /** Last seen mtime of every config source, to detect edits made while a worker is idle. */
  mtimes: Map<string, number>
  /** Serializes config checks and reloads across concurrent loader runs. */
  queue: Promise<unknown>
}

// Turbopack keeps a pool of loader workers alive across rebuilds, and both loaders
// resolve to the same chunk, so one context per worker is loaded once and shared.
let cached: CachedContext | undefined

export function getContext(root: string): Promise<LoadedContext> {
  if (cached?.root !== root) {
    const ctx = createContext(undefined, {
      envMode: process.env.NODE_ENV === 'development' ? 'dev' : 'build',
    })
    cached = { root, ctx, revision: 0, mtimes: new Map(), queue: ctx.updateRoot(root) }
  }

  const entry = cached
  // A rejected check must not poison later runs, so chain off a settled promise.
  const next = entry.queue.then(() => reloadIfConfigChanged(entry), () => reloadIfConfigChanged(entry))
  entry.queue = next
  return next
}

async function reloadIfConfigChanged(entry: CachedContext): Promise<LoadedContext> {
  const { ctx, mtimes } = entry
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
      // The first run primes the map for a config the context just loaded itself.
      changed = mtimes.size > 0
      mtimes.set(file, mtime)
    }
  }

  if (changed) {
    await ctx.reloadConfig()
    entry.revision++
  }

  return { ctx, revision: entry.revision }
}

export async function transformAll(ctx: UnocssPluginContext, code: string, id: string) {
  const pre = await applyTransformers(ctx, code, id, 'pre')
  const def = await applyTransformers(ctx, pre?.code ?? code, id, 'default')
  const post = await applyTransformers(ctx, def?.code ?? pre?.code ?? code, id, 'post')
  return post ?? def ?? pre
}
