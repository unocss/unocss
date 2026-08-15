import type { UnocssPluginContext } from '@unocss/core'
import type { NextPluginOptions } from './types'
import process from 'node:process'
import { createContext } from '#integration/context'
import { applyTransformers } from '#integration/transformers'

// share loaded uno.config.ts within a worker, otherwise loading takes too long
let cached: { key: string, ctx: UnocssPluginContext } | undefined

export function getContext(options: NextPluginOptions, root: string): UnocssPluginContext {
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

export async function transformAll(ctx: UnocssPluginContext, code: string, id: string) {
  const pre = await applyTransformers(ctx, code, id, 'pre')
  const def = await applyTransformers(ctx, pre?.code ?? code, id, 'default')
  const post = await applyTransformers(ctx, def?.code ?? pre?.code ?? code, id, 'post')
  return post ?? def ?? pre
}
