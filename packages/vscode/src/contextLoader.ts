import { readdir } from 'fs/promises'
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
  public ready: Promise<void>
  public defaultContext: UnocssPluginContext<UserConfig<any>>
  public contexts = new Map<string, UnocssPluginContext<UserConfig<any>>>()
  private fileContextCache = new Map<string, UnocssPluginContext<UserConfig<any>> | null>()
  private configExistsCache = new Map<string, boolean>()
  public events = createNanoEvents<{
    reload: () => void
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

    this.ready = this.reload()
      .then(async () => {
        await this.defaultContext.ready
      })
  }

  async reload() {
    this.ready = this._reload()
    await this.ready
    this.events.emit('reload')
  }

  private async _reload() {
    for (const dir of this.contexts.keys())
      this.unloadContext(dir)
    this.fileContextCache.clear()
    this.configExistsCache.clear()

    await this.loadConfigInDirectory(this.cwd)
  }

  async unloadContext(configDir: string) {
    const context = this.contexts.get(configDir)
    if (!context)
      return

    this.contexts.delete(configDir)

    for (const [path, ctx] of this.fileContextCache) {
      if (ctx === context)
        this.fileContextCache.delete(path)
    }

    this.events.emit('contextUnload', context)
  }

  async configExists(dir: string) {
    const files = await readdir(dir)
    return files.some(f => /^(vite|svelte|astro|iles|nuxt|unocss|uno)\.config/.test(f))
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

    this.configExistsCache.set(baseDir, true)

    context.onReload(() => {
      for (const [path, ctx] of this.fileContextCache) {
        if (ctx === context || !ctx)
          this.fileContextCache.delete(path)
      }

      this.configExistsCache.clear()
      this.events.emit('contextReload', context)
    })

    for (const [path, ctx] of this.fileContextCache) {
      if (!ctx)
        this.fileContextCache.delete(path)
    }

    this.events.emit('contextLoaded', context)

    log.appendLine(`[info] New configuration loaded from\n  ${sources.map(s => `  - ${s}`).join('\n')}`)

    this.contexts.set(baseDir, context)

    return context
  }

  async resolveContext(code: string, file: string) {
    const cached = this.fileContextCache.get(file)
    if (cached !== undefined)
      return cached

    log.appendLine(`[info] Resolving config for ${file}`)

    // try finding an existing context that includes the file
    for (const [configDir, context] of this.contexts) {
      if (!isSubdir(configDir, file))
        continue

      if (!context.filter(code, file))
        continue

      this.fileContextCache.set(file, context)
      return context
    }

    // try finding a config from disk
    let dir = path.dirname(file)
    while (isSubdir(this.cwd, dir)) {
      if (this.configExistsCache.get(dir) === false)
        continue

      if (!this.configExists(dir)) {
        this.configExistsCache.set(dir, false)
        continue
      }

      const context = await this.loadConfigInDirectory(dir)
      this.configExistsCache.set(dir, !!context)

      if (context?.filter(code, file)) {
        this.fileContextCache.set(file, context)
        return context
      }

      dir = path.dirname(dir)
    }

    this.fileContextCache.set(file, null)
    return null
  }

  async resolveCloestContext(code: string, file: string) {
    const cached = this.fileContextCache.get(file)
    if (cached)
      return cached

    for (const [configDir, context] of this.contexts) {
      if (!isSubdir(configDir, file))
        continue

      if (!context.filter(code, file))
        continue

      this.fileContextCache.set(file, context)
      return context
    }

    for (const [configDir, context] of this.contexts) {
      if (isSubdir(configDir, file)) {
        this.fileContextCache.set(file, context)
        return context
      }
    }

    return this.defaultContext
  }
}
