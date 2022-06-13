import path from 'path'
import type { UnocssPluginContext, UserConfig } from '@unocss/core'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'
import presetUno from '@unocss/preset-uno'
import { resolveOptions as resolveNuxtOptions } from '../../nuxt/src/options'
import { createNanoEvents } from '../../core/src/utils/events'
import { createContext } from './integration'
import { isSubdir } from './utils'
import { log } from './log'

export class ContextLoader {
  public cwd: string
  public defaultContext: UnocssPluginContext<UserConfig<any>>
  public contexts = new Map<string, UnocssPluginContext<UserConfig<any>>>()
  private fileToContextCache = new Map<string, UnocssPluginContext<UserConfig<any>>>()
  public events = createNanoEvents<{
    contextLoaded: (context: UnocssPluginContext<UserConfig<any>>) => void
    contextReload: (context: UnocssPluginContext<UserConfig<any>>) => void
    contextUnload: (context: UnocssPluginContext<UserConfig<any>>) => void
  }>()

  constructor(cwd: string) {
    this.cwd = cwd
    this.defaultContext = createContext({
      presets: [
        presetUno(),
      ],
    })
  }

  async unloadContext(configDir: string) {
    const context = this.contexts.get(configDir)
    if (!context)
      return

    this.contexts.delete(configDir)

    for (const [path, ctx] of this.fileToContextCache) {
      if (ctx === context)
        this.fileToContextCache.delete(path)
    }

    this.events.emit('contextUnload', context)
  }

  async loadConfigInDirectory(dir: string) {
    const cached = this.contexts.get(dir)
    if (cached)
      return cached

    const context = createContext(
      dir,
      undefined,
      [
        sourcePluginFactory({
          files: [
            'vite.config',
            'svelte.config',
            'astro.config',
            'iles.config',
          ],
          targetModule: 'unocss/vite',
          parameters: [{ command: 'serve', mode: 'development' }],
        }),
        sourceObjectFields({
          files: 'nuxt.config',
          fields: 'unocss',
        }),
      ],
      (result) => {
        if (result.sources.some(s => s.includes('nuxt.config')))
          resolveNuxtOptions(result.config)
      },
    )

    context.updateRoot(dir)

    let sources = []
    try {
      sources = (await context.ready).sources
    }
    catch (e) {
      log.appendLine(`[error] ${String(e)}`)
      log.appendLine(`[error] Error occurred while loading config. Config directory: ${dir}`)
      return null
    }

    if (!sources.length)
      return null

    const baseDir = path.dirname(sources[0])
    if (this.contexts.has(baseDir))
      return this.contexts.get(baseDir)!

    context.onReload(() => {
      for (const [path, ctx] of this.fileToContextCache) {
        if (ctx === context && !context.rollupFilter(path))
          this.fileToContextCache.delete(path)
      }

      this.events.emit('contextReload', context)
    })

    this.events.emit('contextLoaded', context)

    log.appendLine(`[info] New configuration loaded from\n  ${sources.map(s => `  - ${s}`).join('\n')}`)

    this.contexts.set(baseDir, context)

    return context
  }

  async resolveContext(file: string) {
    const cached = this.fileToContextCache.get(file)
    if (cached)
      return cached

    // try finding an existing context that includes the file
    for (const [configDir, context] of this.contexts) {
      if (!isSubdir(configDir, file))
        continue

      if (!context.rollupFilter(file))
        continue

      this.fileToContextCache.set(file, context)
      return context
    }

    // try finding a config from disk
    const dir = path.dirname(file)
    const context = await this.loadConfigInDirectory(dir)

    if (context?.rollupFilter(file)) {
      this.fileToContextCache.set(file, context)
      return context
    }
  }
}
