import type { UnocssPluginContext, UserConfig, UserConfigDefaults } from '@unocss/core'
import type { Connection } from 'vscode-languageserver'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { createContext } from '#integration/context'
import { isCssId } from '#integration/utils'
import { createNanoEvents, notNull } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'
import { resolveOptions as resolveNuxtOptions } from '../../../nuxt/src/options'
import { isSubdir } from '../utils/position'

const frameworkConfigRE = /^(?:vite|svelte|astro|iles|nuxt|unocss|uno)\.config/
const unoConfigRE = /\buno(?:css)?\.config\./
const excludeFileRE = /[\\/](?:node_modules|dist|\.temp|\.cache)[\\/]/

type UnoContext = UnocssPluginContext<UserConfig<any>> | null | undefined

export class ContextManager {
  public ready: Promise<void>
  public contextsMap = new Map<string, UnoContext>()
  public configSources: string[] = []

  private fileContextCache = new Map<string, UnoContext>()
  private configExistsCache = new Map<string, string | false>()
  private loadingContexts = new Map<string, Promise<UnoContext>>()
  private discoveredConfigs = new Set<string>()
  private readonly defaultUnocssConfig: UserConfigDefaults = {
    presets: [presetWind3()],
  }

  public events = createNanoEvents<{
    reload: () => void
    unload: (context: UnocssPluginContext<UserConfig<any>>) => void
    contextLoaded: (context: UnocssPluginContext<UserConfig<any>>) => void
    contextReload: (context: UnocssPluginContext<UserConfig<any>>) => void
    contextUnload: (context: UnocssPluginContext<UserConfig<any>>) => void
  }>()

  constructor(
    public cwd: string,
    private connection: Connection,
  ) {
    this.ready = this.reload()
  }

  private log(message: string) {
    this.connection.console.log(message)
  }

  isTarget(id: string) {
    return Array.from(this.contextsMap.keys()).some(cwd => isSubdir(cwd, id))
  }

  get contexts() {
    return Array.from(new Set(this.contextsMap.values())).filter(notNull)
  }

  async reload() {
    const dirs = Array.from(this.contextsMap.keys())
    await Promise.allSettled(dirs.map(dir => this.unloadContext(dir)))

    this.fileContextCache.clear()
    this.configExistsCache.clear()

    for (const dir of dirs)
      await this.loadContextInDirectory(dir)

    if (!dirs.length)
      await this.loadContextInDirectory(this.cwd)

    this.events.emit('reload')
  }

  async unloadContext(configDir: string) {
    const context = this.contextsMap.get(configDir)
    if (!context)
      return

    this.contextsMap.delete(configDir)
    this.clearFileContextCache(context)
    this.events.emit('contextUnload', context)
    this.events.emit('reload')
  }

  async unload(configDir: string) {
    const context = this.contextsMap.get(configDir)
    if (!context)
      return

    this.contextsMap.delete(configDir)
    this.clearFileContextCache(context)
    this.events.emit('unload', context)
  }

  private clearFileContextCache(context: UnocssPluginContext<UserConfig<any>>) {
    for (const [path, ctx] of this.fileContextCache) {
      if (ctx === context)
        this.fileContextCache.delete(path)
    }
  }

  async loadContextInDirectory(dir: string): Promise<UnoContext> {
    // Return cached context
    const cached = this.contextsMap.get(dir)
    if (cached !== undefined)
      return cached

    // Return existing loading promise to prevent race conditions
    const loading = this.loadingContexts.get(dir)
    if (loading)
      return loading

    // Start loading and cache the promise
    const loadPromise = this.loadContext(dir)
    this.loadingContexts.set(dir, loadPromise)

    try {
      return await loadPromise
    }
    finally {
      this.loadingContexts.delete(dir)
    }
  }

  private async loadContext(dir: string): Promise<UnoContext> {
    // Setup Yarn PnP if present
    this.setupYarnPnp(dir)

    this.log(`\n-----------`)
    this.log(`🛠 Resolving config for ${dir}`)

    // @ts-expect-error support global utils
    globalThis.defineNuxtConfig = config => config

    const context = createContext(
      dir,
      this.defaultUnocssConfig,
      [
        sourcePluginFactory({
          files: [
            'vite.config',
            'svelte.config',
            'iles.config',
          ],
          targetModule: 'unocss/vite',
          parameters: [{ command: 'serve', mode: 'development' }],
        }),
        sourcePluginFactory({
          files: [
            'astro.config',
          ],
          targetModule: 'unocss/astro',
        }),
        sourceObjectFields({
          files: 'nuxt.config',
          fields: 'unocss',
        }),
      ],
      (result) => {
        if (result.sources.some(s => s.includes('nuxt.config')))
          resolveNuxtOptions(result.config)
        result.config.details = true
      },
    )

    let sources: string[] = []
    try {
      sources = (await context.updateRoot(dir)).sources
    }
    catch (e: any) {
      this.log(`⚠️ Error on loading config. Config directory: ${dir}`)
      this.log(String(e.stack ?? e))
      return this.finishLoading(dir, null)
    }

    this.configSources = sources

    if (!sources.length) {
      this.log(`ℹ️ No config sources found in ${dir}`)
      return this.finishLoading(dir, null)
    }

    const baseDir = path.dirname(sources[0])
    if (baseDir !== dir) {
      this.contextsMap.set(dir, null)
      return null
    }

    this.setupContextReload(context)
    this.events.emit('contextLoaded', context)

    const uno = await context.uno
    this.logConfigInfo(sources, uno)

    return this.finishLoading(dir, context)
  }

  private setupYarnPnp(dir: string) {
    for (const file of ['.pnp.js', '.pnp.cjs']) {
      if (existsSync(path.join(dir, file))) {
        try {
          // eslint-disable-next-line ts/no-require-imports
          require(path.join(dir, file)).setup()
        }
        catch {}
      }
    }
  }

  private setupContextReload(context: UnocssPluginContext<UserConfig<any>>) {
    context.onReload(() => {
      // Clear stale file context cache entries
      for (const [path, ctx] of this.fileContextCache) {
        if (ctx === context || !ctx)
          this.fileContextCache.delete(path)
      }
      this.configExistsCache.clear()
      this.events.emit('contextReload', context)
    })

    // Clean up null entries
    for (const [path, ctx] of this.fileContextCache) {
      if (!ctx)
        this.fileContextCache.delete(path)
    }
  }

  private logConfigInfo(sources: string[], uno: any) {
    this.log(`🛠 New configuration loaded from\n${sources.map(s => `  - ${s}`).join('\n')}`)
    this.log(`ℹ️ ${uno.config.presets.length} presets, ${uno.config.rulesSize} rules, ${uno.config.shortcuts.length} shortcuts, ${uno.config.variants.length} variants, ${uno.config.transformers?.length || 0} transformers loaded`)

    if (!sources.some(i => unoConfigRE.test(i))) {
      this.log('💡 To have the best IDE experience, it\'s recommended to move UnoCSS configurations into a standalone `uno.config.ts` file at the root of your project.')
      this.log('👉 Learn more at https://unocss.dev/guide/config-file')
    }
  }

  private finishLoading(dir: string, context: UnoContext) {
    if (!this.contextsMap.has(dir))
      this.contextsMap.set(dir, context)

    this.fileContextCache.clear()
    this.events.emit('reload')

    const enabledContexts = Array.from(this.contextsMap.entries())
      .filter(([, ctx]) => ctx)
      .map(([dir]) => dir)
      .join(', ') || '[none]'

    this.log(`🗂️ Enabled context: ${enabledContexts}`)

    return context
  }

  async resolveClosestContext(code: string, file: string): Promise<UnoContext | undefined> {
    if (excludeFileRE.test(file))
      return undefined

    // Return cached result
    if (this.fileContextCache.has(file))
      return this.fileContextCache.get(file)

    // Find in already loaded contexts (sorted by depth)
    const entries = Array.from(this.contextsMap.entries())
      .sort((a, b) => b[0].length - a[0].length)

    // First pass: strict match (filter + subdir check)
    for (const [configDir, context] of entries) {
      if (!context || !isSubdir(configDir, file))
        continue

      if (context.filter(code, file) || isCssId(file)) {
        this.fileContextCache.set(file, context)
        return context
      }
    }

    // Second pass: subdir match only (fallback)
    for (const [configDir, context] of entries) {
      if (context && isSubdir(configDir, file)) {
        this.fileContextCache.set(file, context)
        return context
      }
    }

    // Try to discover config in parent directories (for monorepo support)
    return this.discoverAndLoadConfig(file)
  }

  private async discoverAndLoadConfig(file: string): Promise<UnoContext> {
    const configDir = await this.findConfigDirectory(path.dirname(file))

    if (!configDir || this.contextsMap.has(configDir))
      return undefined

    // Log only on first discovery
    if (!this.discoveredConfigs.has(configDir)) {
      this.log(`🔍 Discovered config in ${configDir}`)
      this.discoveredConfigs.add(configDir)
    }

    await this.loadContextInDirectory(configDir)

    const context = this.contextsMap.get(configDir)
    if (context)
      this.fileContextCache.set(file, context)

    return context
  }

  private async findConfigDirectory(startDir: string): Promise<string | undefined> {
    // Check cache first
    const cached = this.configExistsCache.get(startDir)
    if (cached !== undefined)
      return cached || undefined

    const root = path.parse(startDir).root
    const searchedDirs: string[] = []
    let dir = startDir

    // Search upwards until we find a config file or hit the boundary
    while (dir !== root && (isSubdir(this.cwd, dir) || dir === this.cwd)) {
      searchedDirs.push(dir)

      // Check if this directory is already cached
      const cached = this.configExistsCache.get(dir)
      if (cached !== undefined) {
        this.cacheSearchPath(searchedDirs, cached || false)
        return cached || undefined
      }

      // Check for config files
      const hasConfig = await this.hasConfigFiles(dir)
      if (hasConfig) {
        this.cacheSearchPath(searchedDirs, dir)
        return dir
      }

      dir = path.dirname(dir)
    }

    // No config found
    this.cacheSearchPath(searchedDirs, false)
    return undefined
  }

  private async hasConfigFiles(dir: string): Promise<boolean> {
    try {
      const files = await readdir(dir)
      return files.some(file => unoConfigRE.test(file) || frameworkConfigRE.test(file))
    }
    catch {
      return false
    }
  }

  private cacheSearchPath(dirs: string[], result: string | false) {
    for (const dir of dirs)
      this.configExistsCache.set(dir, result)
  }
}
