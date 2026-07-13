import type { GenerateResult, UnocssPluginContext, UserConfig } from '@unocss/core'
import type { UnoCSSRspackPluginOptions } from './types'
import fs from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import globParent from 'glob-parent'
import { glob } from 'tinyglobby'
import { createFilter } from 'unplugin-utils'
import { CSS_PLACEHOLDER, IGNORE_COMMENT, INCLUDE_COMMENT, SKIP_COMMENT_RE } from '#integration/constants'
import { createContext } from '#integration/context'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { createNativeFilter } from './filter'
import { transformSource } from './transformers'

export class NativeContext {
  filter

  private readonly base: UnocssPluginContext

  private readonly externalTokens = new Map<string, Set<string>>()

  private readonly moduleSources = new Map<string, string>()

  private readonly moduleTokens = new Map<string, Set<string>>()

  private externalFiles = new Set<string>()

  private externalFileFilter: (id: string) => boolean = () => false

  private externalWatchRoots = new Set<string>()

  private generateKey = ''

  private generateResult: GenerateResult | undefined

  private initializePromise: Promise<void> | undefined

  private virtualHash = ''

  constructor(
    readonly root: string,
    readonly options: UnoCSSRspackPluginOptions,
  ) {
    this.base = createContext(options.configOrPath, options.defaults)
    this.filter = createNativeFilter(root, options.include, options.exclude)
  }

  get configFiles(): string[] {
    return this.base.getConfigFileList()
  }

  get filesystemFiles(): ReadonlySet<string> {
    return this.externalFiles
  }

  get filesystemWatchRoots(): ReadonlySet<string> {
    return this.externalWatchRoots
  }

  matchesFilesystemFile(file: string): boolean {
    return this.externalFileFilter(file)
  }

  getVirtualHash(): string {
    return this.virtualHash
  }

  setVirtualHash(hash: string): void {
    this.virtualHash = hash
  }

  initialize(): Promise<void> {
    this.initializePromise ??= this.initializeInner().catch((error) => {
      this.initializePromise = undefined
      throw error
    })
    return this.initializePromise
  }

  async transformModule(source: string, id: string) {
    await this.base.ready
    return this.transformModuleInner(source, id)
  }

  removeModule(id: string): void {
    this.moduleSources.delete(id)
    this.moduleTokens.delete(id)
    this.invalidateGenerateCache()
  }

  hasModule(id: string): boolean {
    return this.moduleSources.has(id)
  }

  evictModulesNotIn(moduleIds: ReadonlySet<string>): void {
    for (const id of this.moduleSources.keys()) {
      if (!moduleIds.has(id))
        this.removeModule(id)
    }
  }

  async reloadConfig(): Promise<void> {
    await this.base.reloadConfig()
    this.refreshFilter()
    this.moduleTokens.clear()
    this.externalTokens.clear()
    this.invalidateGenerateCache()

    for (const [id, source] of this.moduleSources)
      await this.transformModuleInner(source, id)

    await this.extractExternalContent()
  }

  async extractExternalContent(): Promise<void> {
    await this.base.ready
    const config = this.base.uno.config as UserConfig
    const pendingTokens = new Map<string, Set<string>>()
    const pendingFiles = new Set<string>()
    const pendingWatchRoots = new Set<string>()

    await Promise.all((config.content?.inline ?? []).map(async (item, index) => {
      const resolved = typeof item === 'function' ? await item() : item
      const content = typeof resolved === 'string' ? { code: resolved } : resolved
      const id = content.id ?? `__uno_inline_${index}__`
      pendingTokens.set(id, await this.extractSource(content.code, id))
    }))

    const patterns = config.content?.filesystem ?? []
    if (patterns.length) {
      const include = patterns.filter(pattern => !pattern.startsWith('!'))
      const exclude = patterns
        .filter(pattern => pattern.startsWith('!'))
        .map(pattern => pattern.slice(1))
      this.externalFileFilter = createFilter(
        include,
        [...exclude, '**/{.git,node_modules}/**'],
        { resolve: this.root },
      )
      for (const pattern of patterns) {
        if (pattern.startsWith('!'))
          continue
        const parent = globParent(pattern)
        pendingWatchRoots.add(isAbsolute(parent) ? parent : resolve(this.root, parent))
      }
      const files = await glob(patterns, {
        cwd: this.root,
        absolute: true,
        expandDirectories: false,
        ignore: ['**/{.git,node_modules}/**'],
      })
      const batchSize = 50
      for (let index = 0; index < files.length; index += batchSize) {
        await Promise.all(files.slice(index, index + batchSize).map(async (file) => {
          const absoluteFile = isAbsolute(file) ? file : resolve(this.root, file)
          pendingFiles.add(absoluteFile)
          pendingTokens.set(absoluteFile, await this.extractSource(await fs.readFile(absoluteFile, 'utf8'), absoluteFile))
        }))
      }
    }
    else {
      this.externalFileFilter = () => false
    }

    this.externalTokens.clear()
    for (const [id, tokens] of pendingTokens)
      this.externalTokens.set(id, tokens)
    this.externalFiles = pendingFiles
    this.externalWatchRoots = pendingWatchRoots
    this.invalidateGenerateCache()
  }

  async updateExternalContent(
    changed: ReadonlySet<string>,
    removed: ReadonlySet<string>,
  ): Promise<void> {
    await this.base.ready
    let invalidated = false

    for (const file of removed) {
      if (!this.externalFiles.delete(file))
        continue
      this.externalTokens.delete(file)
      invalidated = true
    }

    await Promise.all([...changed].map(async (file) => {
      if (!this.externalFileFilter(file))
        return
      try {
        const tokens = await this.extractSource(await fs.readFile(file, 'utf8'), file)
        const previous = this.externalTokens.get(file)
        this.externalFiles.add(file)
        this.externalTokens.set(file, tokens)
        invalidated ||= !previous || !setsEqual(previous, tokens)
      }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
          throw error
        if (this.externalFiles.delete(file)) {
          this.externalTokens.delete(file)
          invalidated = true
        }
      }
    }))

    if (invalidated)
      this.invalidateGenerateCache()
  }

  async generate(minify = false): Promise<GenerateResult> {
    await this.base.ready
    const tokens = this.collectTokens()
    const key = `${minify}\0${[...tokens].sort().join('\0')}`
    if (this.generateResult && this.generateKey === key)
      return this.generateResult

    this.generateKey = key
    this.generateResult = await this.base.uno.generate(tokens, { minify })
    return this.generateResult
  }

  getPluginContext(tokens: Set<string>): UnocssPluginContext {
    const base = this.base
    return {
      ...base,
      tokens,
      filter: (code, id) => {
        if (code.includes(IGNORE_COMMENT))
          return false
        return code.includes(INCLUDE_COMMENT)
          || code.includes(CSS_PLACEHOLDER)
          || this.filter.shouldExtract(id)
      },
    }
  }

  async resolveVirtualId(id: string, importer?: string): Promise<string | undefined> {
    return resolveId(this.base, id, importer)
  }

  async resolveLayer(id: string): Promise<string | undefined> {
    return resolveLayer(this.base, getPath(id))
  }

  private async transformModuleInner(source: string, id: string) {
    const tokens = new Set<string>()
    const pluginContext = this.getPluginContext(tokens)
    const result = await transformSource(pluginContext, source, id)
    if (pluginContext.filter(result.code, id))
      await this.base.uno.applyExtractors(result.code.replace(SKIP_COMMENT_RE, ''), id, tokens)

    this.moduleSources.set(id, source)
    this.moduleTokens.set(id, tokens)
    this.invalidateGenerateCache()
    return result
  }

  private async extractSource(source: string, id: string): Promise<Set<string>> {
    const tokens = new Set<string>()
    const pluginContext = this.getPluginContext(tokens)
    const result = await transformSource(pluginContext, source, id)
    if (pluginContext.filter(result.code, id))
      await this.base.uno.applyExtractors(result.code.replace(SKIP_COMMENT_RE, ''), id, tokens)
    return tokens
  }

  private collectTokens(): Set<string> {
    const tokens = new Set<string>()
    for (const tokenSet of this.moduleTokens.values()) {
      for (const token of tokenSet)
        tokens.add(token)
    }
    for (const tokenSet of this.externalTokens.values()) {
      for (const token of tokenSet)
        tokens.add(token)
    }
    return tokens
  }

  private invalidateGenerateCache(): void {
    this.generateKey = ''
    this.generateResult = undefined
  }

  private async initializeInner(): Promise<void> {
    await this.base.updateRoot(this.root)
    this.refreshFilter()
    await this.extractExternalContent()
  }

  private refreshFilter(): void {
    const pipeline = this.base.uno.config.content?.pipeline
    this.filter = createNativeFilter(
      this.root,
      this.options.include ?? (pipeline === false ? undefined : pipeline?.include),
      this.options.exclude ?? (pipeline === false ? undefined : pipeline?.exclude),
      pipeline === false,
    )
  }
}

function setsEqual(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size !== right.size)
    return false
  for (const value of left) {
    if (!right.has(value))
      return false
  }
  return true
}
